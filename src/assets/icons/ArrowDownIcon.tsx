import { IconProps } from '@/types';
import { Path, Svg } from 'react-native-svg';

const ArrowDownIcon = ({ size, color }: IconProps) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <Path
      d="M12 20L20 12H16V4H8V12H4L12 20Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ArrowDownIcon;
