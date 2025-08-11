import Svg, { Circle, Defs, G, Path, SvgProps } from "react-native-svg";

const ArrowLeftIcon = ({
  color,
  width,
  height,
  ...props
}: SvgProps & { color: "dark" | "light" }) => (
  <Svg viewBox="0 0 512 512" width={width} height={height} {...props}>
    <G id="SVGRepo_iconCarrier">
      <Defs></Defs>
      <G id="Layer_2" data-name="Layer 2">
        <G
          id="E421_Back_buttons_multimedia_play_stop"
          data-name="E421, Back, buttons, multimedia, play, stop"
        >
          <Circle cx={256} cy={256} r={246} fill="#A9A9A9" />
          <Path
            d="M352.26 256H170.43M223.91 202.52 170.44 256l53.47 53.48"
            stroke={"#000"}
            strokeWidth={30}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>
      </G>
    </G>
  </Svg>
);

export default ArrowLeftIcon;
