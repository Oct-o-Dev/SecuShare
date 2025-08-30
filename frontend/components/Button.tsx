// components/Button.tsx

import React from 'react';

// This interface allows the button to accept all standard button props
// like 'onClick', 'type', 'disabled', etc., plus a 'children' prop.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={`w-full bg-light-blue text-dark-blue font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-soft-beige disabled:bg-light-blue/50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;