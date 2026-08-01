import SliderBallAnimation from './Slider-ball.lottie';
import successAnimation from './Success-animation.lottie';

export const animations = {
  success: successAnimation,
  pending: SliderBallAnimation,
} as const;
