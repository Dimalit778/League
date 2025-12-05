import { supabase } from '@/lib/supabase';
import {} from '../types';

import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

export const memberApi = {
  async getMemberStats(memberId: string) {
    if (!memberId) throw new Error('No member ID available');

    const { data: memberData, error: memberError } = await supabase
      .from('league_members')
      .select('league_id')
      .eq('id', memberId)
      .single();

    if (memberError) throw memberError;

    const [predictionsResult, leaderboardResult] = await Promise.all([
      supabase
        .from('predictions')
        .select('points, is_finished')
        .eq('league_member_id', memberId)
        .eq('is_finished', true),
      supabase
        .from('league_leaderboard_view')
        .select('member_id, total_points')
        .eq('league_id', memberData.league_id)
        .order('total_points', { ascending: false }),
    ]);

    if (predictionsResult.error) throw predictionsResult.error;
    if (leaderboardResult.error) throw leaderboardResult.error;

    const predictionsData = predictionsResult.data;
    const leaderboardData = leaderboardResult.data;

    const totalPredictions = predictionsData.length;
    const totalPoints = predictionsData.reduce((sum, prediction) => sum + (prediction.points || 0), 0);

    const bingoHits = predictionsData.filter((p) => p.points === 5).length;
    const regularHits = predictionsData.filter((p) => p.points === 3).length;
    const missedHits = predictionsData.filter((p) => p.points === 0).length;

    const accuracy = totalPredictions > 0 ? ((bingoHits + regularHits) / totalPredictions) * 100 : 0;

    // Find member's position in leaderboard
    const memberIndex = leaderboardData.findIndex((entry) => entry.member_id === memberId);
    const position = memberIndex !== -1 ? memberIndex + 1 : null;

    return {
      totalPredictions,
      bingoHits,
      regularHits,
      missedHits,
      totalPoints,
      accuracy: Math.round(accuracy * 100) / 100,
      position,
    };
  },
  async updateMember(memberId: string, nickname: string) {
    const { data, error } = await supabase
      .from('league_members')
      .update({ nickname })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadMemberImage(memberId: string, avatarUrl: ImagePicker.ImagePickerAsset) {
    try {
      const { data: currentMember, error: fetchError } = await supabase
        .from('league_members')
        .select('avatar_url')
        .eq('id', memberId)
        .single();

      if (fetchError) throw fetchError;

      if (currentMember?.avatar_url) {
        await supabase.storage.from('profile_images').remove([currentMember.avatar_url]);
      }

      // Validate base64 data
      const base64 = avatarUrl.base64;
      if (!base64) throw new Error('No base64 data available');

      // Determine file extension and content type
      const extensionFromName = avatarUrl.fileName?.split('.').pop();
      const extensionFromUri = avatarUrl.uri.split('.').pop()?.split('?')[0];
      const fileExtension = extensionFromName ?? extensionFromUri ?? (avatarUrl.type === 'image' ? 'jpg' : 'bin');
      const normalizedExtension = fileExtension.replace('jpeg', 'jpg');
      const contentType =
        avatarUrl.mimeType ?? (normalizedExtension === 'jpg' ? 'image/jpeg' : `image/${normalizedExtension}`);

      const timestamp = Date.now();
      const filePath = `${memberId}_${timestamp}.${normalizedExtension}`;
      const { error: uploadError } = await supabase.storage.from('profile_images').upload(filePath, decode(base64), {
        contentType,
        upsert: true,
      });

      if (uploadError) throw uploadError;

      // Update member record with new avatar path
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .update({ avatar_url: filePath })
        .eq('id', memberId)
        .select()
        .single();

      if (memberError) throw memberError;

      return memberData;
    } catch (error) {
      throw error;
    }
  },

  async deleteImage(memberId: string, currentPath?: string | null) {
    if (currentPath) {
      const { error: storageError } = await supabase.storage.from('profile_images').remove([currentPath]);
      if (storageError) throw storageError;
    }

    const { data, error } = await supabase
      .from('league_members')
      .update({ avatar_url: null })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMemberPredictions(memberId: string) {
    const { data, error } = await supabase
      .from('predictions')
      .select(
        `
        *,
        matches!inner(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        )
      `
      )
      .eq('league_member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  async getMemberInfo(memberId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues!league_id(*, competition:competitions(*))')
      .eq('id', memberId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return data;
  },

  async getMemberDataAndStats(memberId: string) {
    const [memberData, stats] = await Promise.all([this.getMemberInfo(memberId), this.getMemberStats(memberId)]);
    const arrayOfFixtures = Array.from(
      { length: memberData?.league?.competition?.current_fixture ?? 0 },
      (_, index) => index + 1
    );

    return {
      member: memberData,
      stats,
      totalFixtures: arrayOfFixtures,
      currentFixture: memberData?.league?.competition?.current_fixture ?? 1,
    };
  },
  async getMemberProfile(memberId: string) {
    const { data, error } = await supabase.from('league_members').select('*').eq('id', memberId).single();
    if (error) throw error;
    return data;
  },
  async getPrimaryMember(userId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues!league_id(*, competition:competitions(*))')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return data;
  },
};
