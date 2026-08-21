import { Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView } from 'react-native';

type TabOption<T extends string = string> = {
  value: T;
  label: string;
};

type TournamentView = 'groups' | 'knockout';

type HorizontalTabsProps<T extends string = string> = {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export const TournamentViewTabs = ({
  value,
  onChange,
  firstPhaseLabel,
}: {
  value: TournamentView;
  onChange: (value: TournamentView) => void;
  firstPhaseLabel?: string;
}) => {
  const { t } = useTranslation();
  const options: TabOption<TournamentView>[] = [
    { value: 'groups', label: firstPhaseLabel ?? t('Groups') },
    { value: 'knockout', label: t('Knockout') },
  ];

  return (
    <Row className="self-center gap-1 rounded-full border border-border bg-surface/60 p-0.5">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={cn('min-w-[104px] items-center rounded-full px-4 py-1.5', active && 'bg-muted')}
          >
            <Text numberOfLines={1} className={cn('font-semibold', active ? 'text-background' : 'text-muted')}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
};

export const HorizontalTabs = <T extends string>({ options, value, onChange }: HorizontalTabsProps<T>) => {
  const isRTL = useIsRTL();
  const scrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Partial<Record<T, { x: number; width: number }>>>({});
  const scrollViewWidthRef = useRef(0);
  const contentWidthRef = useRef(0);
  const scrollXRef = useRef(0);
  const lastScrolledValueRef = useRef<T | null>(null);
  const optionsKey = options.map((option) => option.value).join('|');

  useEffect(() => {
    lastScrolledValueRef.current = null;
  }, [optionsKey, isRTL]);

  const isTabFullyVisible = (layout: { x: number; width: number }) => {
    const padding = 12;
    const viewportWidth = scrollViewWidthRef.current;
    const contentWidth = contentWidthRef.current;

    if (viewportWidth <= 0) return true;
    if (contentWidth <= viewportWidth) return true;

    const tabStart = layout.x;
    const tabEnd = layout.x + layout.width;
    const visibleStart = scrollXRef.current + padding;
    const visibleEnd = scrollXRef.current + viewportWidth - padding;

    return tabStart >= visibleStart && tabEnd <= visibleEnd;
  };

  useEffect(() => {
    const layout = tabLayouts.current[value];
    if (!layout || !scrollRef.current) return;
    if (lastScrolledValueRef.current === value) return;
    if (isTabFullyVisible(layout)) {
      lastScrolledValueRef.current = value;
      return;
    }

    const padding = 12;
    const viewportWidth = scrollViewWidthRef.current;
    let targetX = Math.max(0, layout.x - padding);

    if (isRTL && viewportWidth > 0) {
      const tabEnd = layout.x + layout.width;
      targetX = Math.max(0, tabEnd - viewportWidth + padding);
    }

    const maxScrollX = Math.max(0, contentWidthRef.current - viewportWidth);
    targetX = Math.min(targetX, maxScrollX);

    if (Math.abs(scrollXRef.current - targetX) < 1) {
      lastScrolledValueRef.current = value;
      return;
    }

    lastScrolledValueRef.current = value;
    scrollRef.current.scrollTo({ x: targetX, animated: true });
  }, [value, isRTL]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(event) => {
        scrollViewWidthRef.current = event.nativeEvent.layout.width;
      }}
      onContentSizeChange={(width) => {
        contentWidthRef.current = width;
      }}
      onScroll={(event) => {
        scrollXRef.current = event.nativeEvent.contentOffset.x;
      }}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
      className="shrink-0 grow-0"
    >
      {options.map((option) => {
        const active = value === option.value;

        return (
          <Pressable
            key={option.value}
            onLayout={(event) => {
              tabLayouts.current[option.value] = {
                x: event.nativeEvent.layout.x,
                width: event.nativeEvent.layout.width,
              };
            }}
            onPress={() => onChange(option.value)}
            className={cn(
              'mx-1 min-w-[72px] items-center justify-center rounded-lg px-4 py-1.5',
              active ? 'bg-primary' : 'border border-border',
            )}
          >
            <Text
              variant="body"
              numberOfLines={1}
              className={cn('font-semibold', active ? 'text-background' : 'text-text')}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export const GroupTabs = ({
  groups,
  selectedGroup,
  onSelectGroup,
}: {
  groups: string[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}) => {
  const { t } = useTranslation();
  const options = groups.map((group) => ({
    value: group,
    label: `${t('Group')} ${group}`,
  }));
  return <HorizontalTabs options={options} value={selectedGroup} onChange={onSelectGroup} />;
};

export const KnockoutStageTabs = ({
  stages,
  selectedStage,
  onSelectStage,
  getLabel,
}: {
  stages: string[];
  selectedStage: string;
  onSelectStage: (stage: string) => void;
  getLabel: (stage: string) => string;
}) => {
  const { t } = useTranslation();
  const options = stages.map((stage) => ({
    value: stage,
    label: t(getLabel(stage)),
  }));

  return <HorizontalTabs options={options} value={selectedStage} onChange={onSelectStage} />;
};
