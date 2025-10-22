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

  // Using a simple fade-in and slight scale up effect
  const animationClasses = "animate-in fade-in duration-500 ease-out fill-mode-forwards";

  return (
    <div 
      className={cn("opacity-0", animationClasses, className)} 
      style={style}
    >
      {children}
    </div>
  );
};