import { supabase } from '@/lib/supabase';
import { MemberLeague, Stats } from '@/types';

import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

export const membersService = {
  async getMemberStats(memberId: string): Promise<Stats> {
    if (!memberId) {
      throw new Error('No member ID available');
    }

    const { data, error } = await supabase
      .from('predictions')
      .select('points, is_finished')
      .eq('league_member_id', memberId)
      .eq('is_finished', true);

    if (error) throw error;

    const totalPredictions = data.length;
    const totalPoints = data.reduce((sum, prediction) => sum + (prediction.points || 0), 0);

    const bingoHits = data.filter((p) => p.points === 3).length;

    const regularHits = data.filter((p) => p.points === 1).length;

    const missedHits = data.filter((p) => p.points === 0).length;

    const accuracy = totalPredictions > 0 ? ((bingoHits + regularHits) / totalPredictions) * 100 : 0;

    return {
      totalPredictions,
      bingoHits,
      regularHits,
      missedHits,
      totalPoints,
      accuracy: Math.round(accuracy * 100) / 100,
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

  async uploadImage(
    leagueId: string,
    memberId: string,
    avatarUrl: ImagePicker.ImagePickerAsset
  ): Promise<MemberLeague> {
    try {
      const base64 = avatarUrl.base64;
      if (!base64) {
        throw new Error('No base64 available');
      }
      const extensionFromName = avatarUrl.fileName?.split('.').pop();
      const extensionFromUri = avatarUrl.uri.split('.').pop()?.split('?')[0];
      const fileExtension = extensionFromName ?? extensionFromUri ?? (avatarUrl.type === 'image' ? 'jpg' : 'bin');

      const normalizedExtension = fileExtension.replace('jpeg', 'jpg');
      const contentType =
        avatarUrl.mimeType ?? (normalizedExtension === 'jpg' ? 'image/jpeg' : `image/${normalizedExtension}`);

      const filePath = `${leagueId}/${memberId}.${normalizedExtension}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, decode(base64), {
        contentType,
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .update({ avatar_url: filePath })
        .eq('id', memberId)
        .select()
        .single();

      if (memberError) throw memberError;
      return memberData as MemberLeague;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },
  async deleteImage(memberId: string, currentPath?: string | null) {
    if (currentPath) {
      const { error: storageError } = await supabase.storage.from('avatars').remove([currentPath]);
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
      .select('nickname, avatar_url')
      .eq('id', memberId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
