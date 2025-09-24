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

  async getMemberAvatar(
    path: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      expiresIn?: number;
    }
  ) {
    const {
      width = 96,
      height = 96,
      quality = 80,
      resize = 'cover',
      expiresIn = 3600,
    } = options ?? {};

    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(path, expiresIn, {
        transform: {
          width,
          height,
          resize:
            resize === 'inside' || resize === 'outside' ? 'cover' : resize,
          quality,
        },
      });

    if (error) throw error;

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

      const extensionFromName = avatarUrl.fileName?.split('.').pop();
      const extensionFromUri = avatarUrl.uri.split('.').pop()?.split('?')[0];
      const fileExtension =
        extensionFromName ??
        extensionFromUri ??
        (avatarUrl.type === 'image' ? 'jpg' : 'bin');

      const normalizedExtension = fileExtension.replace('jpeg', 'jpg');
      const contentType =
        avatarUrl.mimeType ??
        (normalizedExtension === 'jpg'
          ? 'image/jpeg'
          : `image/${normalizedExtension}`);

      const filePath = `${leagueId}/${memberId}.${normalizedExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
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
        const { error: storageError } = await supabase.storage
          .from('avatars')
          .remove([currentPath]);
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
