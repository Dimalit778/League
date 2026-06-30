import { useTranslation } from '@/hooks/useTranslation';
import stadiumBg from '@assets/images/fieldImage.jpg';
import Trophy from '@assets/images/Trophy-champo.png';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, ChevronRight, Star } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
type PrimaryLeagueCardProps = {
  leagueName: string;
  nickname: string;
  rank: number;
  points: number;
  pending: number;
  onPress?: () => void;
};
function TextX({
  children,
  className,
  numberOfLines,
}: {
  children: React.ReactNode;
  className?: string;
  numberOfLines?: number;
}) {
  return (
    <Text numberOfLines={numberOfLines} className={className}>
      {children}
    </Text>
  );
}

function Divider() {
  return <View className="mx-2 h-12 w-px bg-white/10" />;
}

function StatBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View className="overflow-hidden rounded-xl border border-[#223554] p-2">
      <View className="mb-1 flex-row items-center gap-2">
        {icon}
        <TextX className="text-xs font-semibold tracking-wide text-muted">{label}</TextX>
      </View>
      <TextX className="text-base text-center text-text">{value}</TextX>
    </View>
  );
}
export default function PrimaryLeagueCard({
  leagueName,
  nickname,
  rank,
  points,
  pending,
  onPress,
}: PrimaryLeagueCardProps) {
  const { t } = useTranslation();
  return (
    <View className="p-3">
      <LinearGradient
        colors={['#0B1B33', '#081325']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden rounded-3xl border border-[#223554]"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        {/* רקע תמונה חלש */}
        <Image
          source={stadiumBg}
          contentFit="cover"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.22,
          }}
        />

        <LinearGradient
          colors={['rgba(6,12,24,0.25)', 'rgba(6,12,24,0.35)', 'rgba(6,12,24,0.55)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        />

        {/* שכבה כהה חזקה באזור הגביע - משמאל לשקוף */}
        <LinearGradient
          colors={[
            'rgba(6,12,24,0.96)',
            'rgba(6,12,24,0.88)',
            'rgba(6,12,24,0.55)',
            'rgba(6,12,24,0.12)',
            'rgba(6,12,24,0)',
          ]}
          locations={[0, 0.5, 0.6, 0.82, 1]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '70%',
          }}
        />

        {/* Header */}

        {/* Content row */}
        <View className="flex-row items-center justify-center gap-5 p-3">
          <View className=" justify-center items-center w-40 h-40  gap-4 ">
            <View className="flex-row items-center gap-2">
              <Star size={18} color="#D5B13F" fill="#D5B13F" />
              <TextX className=" font-semibold uppercase tracking-wide text-[#D5B13F]">{t('Primary')}</TextX>
            </View>
            {/* Trophy circle */}
            <View className="w-28 h-28 items-center justify-center rounded-full border border-white/10 bg-[#091425]">
              <LinearGradient
                colors={['rgba(227,180,33,0.20)', 'rgba(227,180,33,0.02)']}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                }}
              />
              <Image source={Trophy} contentFit="contain" style={{ width: 140, height: 140 }} />
            </View>
          </View>

          {/* Right side */}
          <View className="min-w-0 flex-1">
            <View>
              <TextX className="text-2xl font-black text-white" numberOfLines={1}>
                {leagueName}
              </TextX>

              <TextX className="mt-1 text-base font-semibold text-[#97A7BF]" numberOfLines={1}>
                {nickname}
              </TextX>
            </View>

            {/* stats */}
            <View className="mt-2 flex-row items-center">
              <StatBlock icon={<BarChart3 size={14} color="#E3B421" />} label="RANK" value={`#${rank}`} />
              <Divider />
              <StatBlock
                icon={<Star size={14} color="#E3B421" fill="#E3B421" />}
                label="POINTS"
                value={`${points} pts`}
              />
            </View>

            {/* Button */}
            <Pressable
              onPress={onPress}
              className="mt-6 h-10 items-center justify-center rounded-2xl border border-[#B78818] px-5"
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <TextX className="text-base font-bold text-[#D9A629]">Enter league</TextX>

              <View className="absolute right-5">
                <ChevronRight size={24} color="#D9A629" />
              </View>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
