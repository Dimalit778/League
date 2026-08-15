import { Row, Text } from '@/components';
import { View } from 'react-native';

type AuthDividerProps = {
  label: string;
  lines?: boolean;
};

export default function AuthDivider({ label, lines = true }: AuthDividerProps) {
  return (
    <Row keepLtr className="items-center justify-center py-2">
      {lines ? <View className="h-px flex-1 bg-[#526078]" /> : null}
      <Text className={lines ? 'mx-3 text-sm font-semibold text-[#9EA9BE]' : 'text-sm font-semibold text-[#AEB9CE]'}>
        {label}
      </Text>
      {lines ? <View className="h-px flex-1 bg-[#526078]" /> : null}
    </Row>
  );
}
