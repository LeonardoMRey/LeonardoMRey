import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number; // Delay in milliseconds
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, delay = 0, className }) => {
  const style = {
    animationDelay: `${delay}ms`,
  };

  // Usando a classe de animação customizada
  const animationClasses = "animate-card-entry";

  return (
    <div 
      className={cn("opacity-0", animationClasses, className)} 
      style={style}
    >
      {children}
    </div>
  );
};