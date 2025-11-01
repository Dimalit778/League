import { IconProps } from '@/types';
import Svg, { Path } from 'react-native-svg';
const PlusSixIcon = ({ size, color }: IconProps) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <Path d="M18 5h1v1a1 1 0 0 0 2 0V5h1a1 1 0 0 0 0-2h-1V2a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2Zm-6.5 3h1a1 1 0 0 1 1 1 1 1 0 0 0 2 0 3 3 0 0 0-3-3h-1a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3h-2V9a1 1 0 0 1 1-1Zm1 5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2Zm9.1-4a1 1 0 0 0-.78 1.18 9 9 0 1 1-7-7 1 1 0 1 0 .4-2A10.8 10.8 0 0 0 12 1a11 11 0 1 0 11 11 10.8 10.8 0 0 0-.22-2.2A1 1 0 0 0 21.6 9Z" />
  </Svg>
);
export default PlusSixIcon;
