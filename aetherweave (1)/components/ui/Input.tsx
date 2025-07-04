
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full bg-brand-bg border border-brand-subtle/30 rounded-md px-3 py-2 text-brand-text placeholder-brand-subtle focus:outline-none focus:ring-2 focus:ring-brand-accent ${className}`}
      {...props}
    />
  );
});

Input.displayName = "Input";
export default Input;
