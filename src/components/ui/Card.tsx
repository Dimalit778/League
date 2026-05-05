// components/ui/card.tsx
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;

  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <View
      className={`
        bg-surface 
        border border-border 
        rounded-xl
        
        ${className || ''}
      `}
    >
      {children}
    </View>
  );
};
