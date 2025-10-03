import { IconProps } from '@/types';
import { Path, Svg } from 'react-native-svg';

const ArrowLeftIcon = ({ size, color }: IconProps) => (
  <Svg viewBox="0 0 32 32" width={size} height={size} fill="none">
    <Path
      fill={color}
      fillRule="evenodd"
      d="M22 15H11.414l4.121-4.121a.999.999 0 1 0-1.414-1.414l-5.656 5.656a.981.981 0 0 0-.26.879.981.981 0 0 0 .26.879l5.656 5.661a1 1 0 0 0 1.414 0c.391-.39.391-1.03 0-1.42L11.414 17H22a1 1 0 1 0 0-2Zm8 13c0 1.1-.896 2-2 2H4c-1.104 0-2-.9-2-2V4a2 2 0 0 1 2-2h24a2 2 0 0 1 2 2v24ZM28 0H4a4 4 0 0 0-4 4v24a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4Z"
    />
  </Svg>
);
export default ArrowLeftIcon;
