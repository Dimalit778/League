import { IconProps } from '@/types';
import { Path, Svg } from 'react-native-svg';

const ArrowUpIcon = ({ size, color }: IconProps) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <Path
      d="M12 4L4 12H8V20H16V12H20L12 4Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ArrowUpIcon;
