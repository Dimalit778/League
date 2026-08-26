import { supabase } from '@/lib/supabase';
import { memberImageApi } from '../memberImageApi';

const jpegAsset = {
  uri: 'file:///avatar.jpg',
  width: 100,
  height: 100,
  base64: '/9j/AA==',
  mimeType: 'image/jpeg',
};

describe('memberImageApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('routes profile images through the moderation Edge Function', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { member: { id: 'member-1', avatar_url: 'member-1_1.jpg' } },
      error: null,
    });

    const result = await memberImageApi.uploadImage('member-1', jpegAsset as any);

    expect(supabase.functions.invoke).toHaveBeenCalledWith('moderate-profile-image', {
      body: {
        memberId: 'member-1',
        base64: jpegAsset.base64,
        contentType: 'image/jpeg',
      },
    });
    expect(result.avatar_url).toBe('member-1_1.jpg');
  });

  it('surfaces the JSON message returned by a rejected function call', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: null,
      error: {
        message: 'Edge Function returned a non-2xx status code',
        context: {
          json: jest.fn().mockResolvedValue({
            message: 'This image appears to violate our content guidelines and was not saved.',
          }),
        },
      },
    });

    await expect(memberImageApi.uploadImage('member-1', jpegAsset as any)).rejects.toThrow(
      'This image appears to violate our content guidelines and was not saved.',
    );
  });
});
