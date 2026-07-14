import { supabase } from "@/lib/supabase";
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

export const memberImageApi = { 
    async deleteImage(memberId: string, currentPath?: string | null) {
        if (!memberId) throw new Error('No member ID available');
    
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
      async uploadImage(memberId: string, avatarUrl: ImagePicker.ImagePickerAsset) {
        if (!memberId) throw new Error('No member ID available');
    
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
    }
    
}