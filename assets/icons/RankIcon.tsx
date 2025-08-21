import { IconProps } from '@/types';
import Svg, { Path } from 'react-native-svg';
const RankIcon = ({ size, color }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
    <Path d="M11 501h117.8V301.9H11V501zm20.9-179.3H108v158.5H31.9V321.7zM197.6 501h117.8V220.6H197.6V501zm19.8-260.6h76.1v239.8h-76.1V240.4zM383.2 11v490H501V11H383.2zm96.9 469.1H404V31.9h76.1v448.2z" />
  </Svg>
);
export default RankIcon;
