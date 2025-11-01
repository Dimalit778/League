import { LoadingOverlay } from '@/components/layout';
import { AvatarImage, Button, MyImage } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/hooks/useLeagues';
import { useUpdateMember, useUploadMemberImage } from '@/hooks/useMembers';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { ProfileSkeleton } from '@/screens/profile/ProfileSkeleton';
import { useMemberStore } from '@/store/MemberStore';
import { FontAwesome6 } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

export default function Profile() {
  const member = useMemberStore((s) => s.member);
  const { colors } = useThemeTokens();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        nickname: yup
          .string()
          .min(2, 'Nickname must be at least 2 characters')
          .required('Nickname is required'),
      })
    ),
    mode: 'onChange',
    defaultValues: {
      nickname: member?.nickname || '',
    },
  });

  const leaveLeague = useLeaveLeague();
  const updateMember = useUpdateMember(member?.id);
  const uploadImage = useUploadMemberImage(member?.league_id, member?.id);

  const { data: league, isLoading } = useGetLeagueAndMembers(member?.league_id);

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const confirmLeaveLeague = useCallback(() => {
    if (!league?.id) return;
    Alert.alert(
      'Leave League',
      `Are you sure you want to leave "${league?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            leaveLeague.mutate(league.id, {
              onSuccess: () => {
                router.replace('/(app)/(public)/myLeagues');
              },
              onError: (error) => {
                Alert.alert('Error', error.message);
              },
            });
          },
        },
      ]
    );
  }, [leaveLeague, league?.id, league?.name, router]);

  const handleSaveNickname = handleSubmit((data) => {
    updateMember.mutate(data.nickname, {
      onSuccess: () => {
        setIsEditingNickname(false);
        Alert.alert('Success', 'Nickname updated successfully!');
      },
    });
  });

  const handleCancelEdit = () => {
    setIsEditingNickname(false);
    reset({ nickname: member?.nickname || '' });
  };

  const handleCopyJoinCode = async () => {
    if (typeof league?.join_code === 'string') {
      await Clipboard.setStringAsync(league?.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };
  const handleImagePicker = async () => {
    if (!member?.league_id || !member?.id) {
      return;
    }
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'We need access to your photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        await uploadImage.mutateAsync(result.assets[0], {
          onSuccess: () => {
            Alert.alert('Success', 'Profile picture updated successfully!');
          },
          onError: (error) => {
            Alert.alert('Error', 'Failed to upload image');
          },
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  if (!member || !league || isLoading) return <ProfileSkeleton />;
  return (
    <KeyboardAwareScrollView
      bottomOffset={62}
      className="flex-1 bg-background "
    >
      {(isLoading || leaveLeague.isPending) && <LoadingOverlay />}
      {/* Avatar */}
      <View className="px-4 mt-4">
        <View className="items-center px-4">
          <View className="relative mb-4">
            <AvatarImage
              imageUri={member?.avatar_url}
              nickname={member?.nickname}
              className="w-40 h-40"
            />

            <TouchableOpacity
              onPress={handleImagePicker}
              disabled={uploadImage.isPending}
              className="absolute -bottom-2 -right-2 bg-primary rounded-full p-3 border-2 border-background"
            >
              {uploadImage.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome6 name="camera" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Nickname */}
      <View className="px-4 mt-4">
        {isEditingNickname ? (
          <View>
            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-surface text-text border border-border rounded-lg px-4 py-3 mb-3"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Nickname"
                  placeholderTextColor="#999"
                  autoFocus
                />
              )}
            />
            {errors.nickname && (
              <Text className="text-red-500 mb-3 text-sm">
                {errors.nickname.message}
              </Text>
            )}
            <View className="flex-row gap-2">
              <Button
                title="Save"
                onPress={handleSaveNickname}
                variant="primary"
                loading={updateMember.isPending}
                disabled={!isValid || updateMember.isPending}
                className="flex-1"
              />
              <Button
                title="Cancel"
                onPress={handleCancelEdit}
                variant="border"
                disabled={updateMember.isPending}
                className="flex-1"
              />
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between bg-surface rounded-lg px-4 py-3 border border-border">
            <Text className="text-text text-lg font-semibold">
              {member?.nickname}
            </Text>
            <Pressable
              onPress={() => setIsEditingNickname(true)}
              className="p-2"
            >
              <FontAwesome6
                name="pen-to-square"
                size={16}
                color={colors.secondary}
              />
            </Pressable>
          </View>
        )}
      </View>

      <View className="flex-grow justify-center px-4 mt-4">
        <View className=" bg-surface rounded-2xl border border-border p-4">
          <View className="flex-row justify-between items-center px-4">
            <MyImage
              source={league?.competition?.logo || ''}
              className="rounded-xl mr-3"
              width={40}
              height={40}
              resizeMode="contain"
            />
            <Text className="flex-1 text-text text-xl text-center   uppercase">
              {league.name}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/profile/edit-league')}
            >
              <FontAwesome6
                name="pen-to-square"
                size={16}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>

          <View className="h-[1px] bg-muted my-3" />
          {/* League details */}
          <View className="gap-3">
            {/* Join Code */}
            <View className="flex-row items-center justify-between ">
              <Text className="text-text font-medium">Join Code</Text>

              <Pressable
                className="border border-border rounded-lg px-3 py-2"
                onPress={handleCopyJoinCode}
              >
                <Text className="text-text  tracking-[2px] text-center ">
                  {league.join_code}
                </Text>
              </Pressable>
            </View>
            <View className="h-[1px] bg-border" />
            {/* Members */}
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-text">Members</Text>
                <Text className="text-text font-semibold">
                  {league?.league_members.length || 0} / {league?.max_members}
                </Text>
              </View>
            </View>
            <View className="h-[1px] bg-border" />
            {/* Owner */}
            <View className="flex-row justify-between">
              <Text className="text-text">League Owner</Text>
              <Text className="text-text font-semibold">
                {league.owner?.nickname || 'Unknown'}
              </Text>
            </View>
            <View className="h-[1px] bg-border" />
            {/* Competition details */}
            <View className="flex-row justify-between">
              <Text className="text-text">League</Text>
              <View className="flex-row items-center">
                <Text className="text-text font-semibold mr-2">
                  {league.competition.name}
                </Text>
                <MyImage
                  source={{ uri: league.competition.logo }}
                  width={18}
                  height={18}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View className="h-[1px] bg-border" />

            <View className="flex-row justify-between items-center">
              <Text className="text-text">Country</Text>
              <View className="flex-row items-center">
                <Text className="text-text font-semibold mr-2">
                  {league.competition.area}
                </Text>
                <MyImage
                  source={{ uri: league.competition.flag }}
                  width={18}
                  height={18}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View className="h-[1px] bg-border" />
            {/* Created date */}
            <View className="flex-row justify-between">
              <Text className="text-text font-medium">Created at</Text>
              <Text className="text-muted">
                {new Date(league.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 mt-4">
        <Button
          title={'Leave League'}
          variant="error"
          onPress={confirmLeaveLeague}
          disabled={leaveLeague.isPending}
          loading={leaveLeague.isPending}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}
