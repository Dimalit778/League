// components/ui/card.tsx
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;

  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <View
      className={`
        bg-surface 
        border border-border 
        rounded-lg
      
        ${className || ''}
      `}
    >
      {children}
    </View>
  );
};

export default Card;
