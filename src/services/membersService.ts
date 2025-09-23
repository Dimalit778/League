import { supabase } from '@/lib/supabase';
import { MemberStatsType } from '@/types';

import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export const membersService = {
  // Get Member Stats
  async getMemberStats(memberId: string): Promise<MemberStatsType> {
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
    const totalPoints = data.reduce(
      (sum, prediction) => sum + (prediction.points || 0),
      0
    );

    const bingoHits = data.filter((p) => p.points === 3).length;

    const regularHits = data.filter((p) => p.points === 1).length;

    const missedHits = data.filter((p) => p.points === 0).length;

    const accuracy =
      totalPredictions > 0
        ? ((bingoHits + regularHits) / totalPredictions) * 100
        : 0;

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

  // Delete Member Image
  async deleteMemberImage(memberId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .update({ avatar_url: null })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMemberAvatar(path: string) {
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(path, 3600, {
        transform: { width: 96, height: 96, resize: 'cover', quality: 80 },
      });
    if (error) throw error;
    console.log('data', data);
    return data?.signedUrl;
  },
  async uploadAvatarImage(
    leagueId: string,
    memberId: string,
    avatarUrl: ImagePicker.ImagePickerAsset
  ) {
    try {
      const base64 = await FileSystem.readAsStringAsync(avatarUrl.uri, {
        encoding: 'base64',
      });

      const filePath = `${leagueId}/${memberId}.${avatarUrl.type === 'image' ? 'png' : 'mp4'}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType: 'image/png',
        });
      if (uploadError) throw uploadError;

      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .update({ avatar_url: filePath })
        .eq('id', memberId)
        .select()
        .single();

      if (memberError) throw memberError;
      return memberData;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },
  async removeAvatar(
    leagueId: string,
    memberId: string,
    currentPath?: string | null
  ) {
    try {
      if (currentPath) {
        // Extract the filename from the URL
        const filename = currentPath.split('/').pop();

        // Format path as leagueId/memberId.extension
        const path = `${leagueId}/${memberId}`;

        const { error: storageError } = await supabase.storage
          .from('avatars')
          .remove([path]);
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
    } catch (error) {
      console.error('Error removing avatar:', error);
      throw error;
    }
  },
};
