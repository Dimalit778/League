import { IconProps } from '@/types';
import Svg, { Path } from 'react-native-svg';

const EyeOpenIcon = ({ size = 24, color = '#000' }: IconProps) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default EyeOpenIcon;

