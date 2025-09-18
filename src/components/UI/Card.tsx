import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
}

export const Card = ({ variant = 'default', className, children, ...props }: CardProps) => {
  const variants = {
    default: 'bg-white rounded-xl border border-gray-200',
    elevated: 'bg-white rounded-xl shadow-lg border border-gray-100',
    bordered: 'bg-white rounded-xl border-2 border-gray-200'
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
};