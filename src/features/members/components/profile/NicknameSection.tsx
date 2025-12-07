import { Button, CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { formatNameCapitalize } from '@/utils/formats';
import { FontAwesome6 } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, TextInput, View } from 'react-native';
import * as yup from 'yup';
import { useUpdateMember } from '../../hooks/useMembers';

type NicknameSectionProps = {
  initialNickname: string;
};

export const NicknameSection = ({ initialNickname }: NicknameSectionProps) => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
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
      })
    ),
    mode: 'onChange',
    defaultValues: {
      nickname: formatNameCapitalize(initialNickname),
    },
  });

  const handleSaveNickname = handleSubmit((data) => {
    setDisplayNickname(data.nickname);
    setIsEditingNickname(false);

    updateMember.mutate(data.nickname, {
      onError: () => {
        setDisplayNickname(initialNickname);
        setIsEditingNickname(true);
        reset({ nickname: initialNickname });
      },
    });
  });

  const handleCancelEdit = () => {
    setIsEditingNickname(false);
    reset({ nickname: displayNickname });
  };

  const handleStartEdit = () => {
    reset({ nickname: displayNickname });
    setIsEditingNickname(true);
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
                placeholder={t('Nickname')}
                placeholderTextColor="#999"
                autoFocus
              />
            )}
          />
          {errors.nickname && (
            <CText className="text-error mb-3 text-sm text-center">{t(errors.nickname.message as string)}</CText>
          )}
          <View className="flex-row gap-2">
            <Button
              title={t('Save')}
              onPress={handleSaveNickname}
              variant="secondary"
              loading={updateMember.isPending}
              disabled={!isValid || updateMember.isPending}
              className="flex-1"
            />
            <Button
              title={t('Cancel')}
              onPress={handleCancelEdit}
              variant="error"
              disabled={updateMember.isPending}
              className="flex-1"
            />
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between bg-surface rounded-lg px-4 py-3 border border-border">
          <CText className="text-text text-lg font-semibold">{displayNickname}</CText>
          <Pressable onPress={handleStartEdit} className="p-2">
            <FontAwesome6 name="pen-to-square" size={16} color={colors.secondary} />
          </Pressable>
        </View>
      )}
    </View>
  );
};
