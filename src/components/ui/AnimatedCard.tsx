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

  // Usando fade-in e slide-in-from-bottom para um efeito moderno.
  // A classe 'opacity-0' garante que ele comece invisível.
  // 'fill-mode-forwards' garante que o estado final (opacity: 1) seja mantido.
  const animationClasses = "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards";

  return (
    <div 
      className={cn("opacity-0", animationClasses, className)} 
      style={style}
    >
      {children}
    </div>
  );
};