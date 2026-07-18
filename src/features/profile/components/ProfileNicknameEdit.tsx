import { Button, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { formatNameCapitalize } from '@/utils/formats';
import { FontAwesome6 } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, TextInput, View } from 'react-native';
import * as yup from 'yup';
import { useUpdateMember } from '../hooks/useMembers';

type ProfileNicknameEditProps = {
  initialNickname: string;
};

export function ProfileNicknameEdit({ initialNickname }: ProfileNicknameEditProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [displayNickname, setDisplayNickname] = useState(formatNameCapitalize(initialNickname));
  const updateMember = useUpdateMember();

  useEffect(() => {
    setDisplayNickname(formatNameCapitalize(initialNickname));
  }, [initialNickname]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        nickname: yup.string().min(2, t('Nickname must be at least 2 characters')).required(t('Nickname is required')),
      }),
    ),
    mode: 'onChange',
    defaultValues: { nickname: formatNameCapitalize(initialNickname) },
  });

  const handleSave = handleSubmit((data) => {
    setDisplayNickname(data.nickname);
    setIsEditing(false);
    updateMember.mutate(data.nickname, {
      onError: () => {
        setDisplayNickname(initialNickname);
        setIsEditing(true);
        reset({ nickname: initialNickname });
      },
    });
  });

  if (!isEditing) {
    return (
      <View className="mx-3 mt-3">
        <Pressable
          onPress={() => {
            reset({ nickname: displayNickname });
            setIsEditing(true);
          }}
          className="flex-row items-center justify-between rounded-xl border border-border bg-background px-4 py-3 active:opacity-80"
        >
          <View>
            <Text className="text-xs text-muted">{t('Nickname')}</Text>
            <Text className="text-base font-semibold text-text">{displayNickname}</Text>
          </View>
          <FontAwesome6 name="pen-to-square" size={14} color={colors.primary} />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mx-3 mt-3 rounded-xl border border-border bg-background p-4">
      <Text className="mb-2 text-xs text-[#97A7BF]">{t('Edit nickname')}</Text>
      <Controller
        control={control}
        name="nickname"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="mb-2 rounded-lg border border-border bg-background px-4 py-3 text-text"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={t('Nickname')}
            placeholderTextColor={colors.muted}
            autoFocus
          />
        )}
      />
      {errors.nickname && <Text className="mb-2 text-sm text-error">{t(errors.nickname.message as string)}</Text>}
      <View className="flex-row gap-2">
        <Button
          title={t('Save')}
          onPress={handleSave}
          variant="border"
          loading={updateMember.isPending}
          disabled={!isValid || updateMember.isPending}
          className="flex-1"
        />
        <Button
          title={t('Cancel')}
          onPress={() => {
            setIsEditing(false);
            reset({ nickname: displayNickname });
          }}
          variant="border"
          disabled={updateMember.isPending}
          className="flex-1"
        />
      </View>
    </View>
  );
}
