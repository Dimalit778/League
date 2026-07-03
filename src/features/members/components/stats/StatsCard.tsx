import { Card, CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

const StatsCard = ({ title, value = 0, subtitle }: StatsCardProps) => {
  const { t } = useTranslation();
  return (
    <Card className=" flex-1 p-4 justify-center items-center">
      <CText className="text-text text-sm">{t(title)}</CText>
      <CText className="text-secondary text-2xl font-bold mt-1">{value}</CText>
      {subtitle && <CText className="text-muted text-xs mt-1">{t(subtitle)}</CText>}
    </Card>
  );
};

export default StatsCard;
