import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, getHarmonicStateTextColor } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md',
        outline: 'border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'text-blue-600 underline-offset-4 hover:underline',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        gradient: 'bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]',
        emotion: 'text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        xl: 'h-14 px-12 text-base font-medium',
        icon: 'h-10 w-10',
      },
      rounded: {
        default: 'rounded-md',
        full: 'rounded-full',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  emotionColor?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, emotionColor, ...props }, ref) => {
    // Apply emotion color as background and appropriate text color if provided and variant is 'emotion'
    const style: React.CSSProperties = {};
    let emotionTextColorClass = '';
    
    if (variant === 'emotion' && emotionColor) {
      style.backgroundColor = emotionColor;
      emotionTextColorClass = getHarmonicStateTextColor(emotionColor);
      
      // Convert hex to RGB for the glow effect
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
          `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
          '79, 70, 229'; // Default blue if parsing fails
      };
      style.boxShadow = `0 4px 14px 0 rgba(${hexToRgb(emotionColor)}, 0.39)`;
    }

    // Combine the base className with emotion text color if applicable
    const finalClassName = variant === 'emotion' && emotionTextColorClass 
      ? cn(buttonVariants({ variant, size, rounded }), emotionTextColorClass, className)
      : cn(buttonVariants({ variant, size, rounded, className }));

    return (
      <button
        className={finalClassName}
        ref={ref}
        style={style}
        {...props}
      >
        {variant === 'gradient' && (
          <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></span>
        )}
        {props.children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };