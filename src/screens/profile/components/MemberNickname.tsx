import { Button } from '@/components/ui';
import { useUpdateMember } from '@/hooks/useMembers';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { FontAwesome6 } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import * as yup from 'yup';

const schema = yup.object().shape({
  nickname: yup.string().required('Nickname is required'),
});

const MemberNickname = () => {
  const member = useMemberStore((s) => s.member);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const { colors } = useThemeTokens();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      nickname: member?.nickname || '',
    },
  });

  const updateMember = useUpdateMember(member?.id || '');

  const handleSaveNickname = handleSubmit((data) => {
    updateMember.mutate(data.nickname, {
      onSuccess: () => {
        setIsEditingNickname(false);
        Alert.alert('Success', 'Nickname updated successfully!');
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    });
  });

  const handleCancelEdit = () => {
    setIsEditingNickname(false);
    reset({ nickname: member?.nickname || '' });
  };

  return (
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
          <Pressable onPress={() => setIsEditingNickname(true)} className="p-2">
            <FontAwesome6
              name="pen-to-square"
              size={16}
              color={colors.secondary}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default MemberNickname;
