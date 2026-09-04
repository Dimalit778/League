import { Button, InputField } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { formatNameCapitalize } from '@/utils/formats';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import * as yup from 'yup';
import { useUpdateMember } from '../../hooks/useMembers';

type ProfileNicknameEditProps = {
  initialNickname: string;
};

type FormValues = {
  nickname: string;
};

export function ProfileNicknameEdit({ initialNickname }: ProfileNicknameEditProps) {
  const { t } = useTranslation();
  const updateMember = useUpdateMember();
  const savedNickname = formatNameCapitalize(initialNickname);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(
      yup.object({
        nickname: yup
          .string()
          .trim()
          .min(2, t('Nickname must be at least 2 characters'))
          .max(20, t('Nickname must be at most 20 characters'))
          .required(t('Nickname is required')),
      }),
    ),
    mode: 'onChange',
    defaultValues: { nickname: savedNickname },
  });

  useEffect(() => {
    reset({ nickname: formatNameCapitalize(initialNickname) });
  }, [initialNickname, reset]);

  const hasChanges = (watch('nickname') ?? '').trim() !== savedNickname.trim();

  const handleSave = handleSubmit((data) => {
    updateMember.mutate(data.nickname.trim(), {
      onSuccess: () => reset({ nickname: formatNameCapitalize(data.nickname.trim()) }),
      onError: () => reset({ nickname: savedNickname }),
    });
  });

  return (
    <View>
      <InputField
        control={control}
        name="nickname"
        placeholder={t('Nickname')}
        maxLength={20}
        autoCapitalize="words"
        autoCorrect={false}
        autoComplete="off"
        textAlign="center"
        error={errors.nickname}
      />
      {hasChanges ? (
        <Button
          label={t('Save')}
          onPress={handleSave}
          intent="outline"
          fullWidth
          className="mt-3"
          loading={updateMember.isPending}
          disabled={!isValid || updateMember.isPending}
        />
      ) : null}
    </View>
  );
}
