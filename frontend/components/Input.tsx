// components/Input.tsx

import React from 'react';

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`w-full bg-navy-blue border border-light-blue text-soft-beige placeholder-soft-beige placeholder-opacity-50 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue ${className}`}
      {...props}
    />
  );
};

export default Input;