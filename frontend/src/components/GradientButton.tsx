import React from 'react';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="font-mono w-full py-3 px-6 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-accent to-purple-accent transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,229,255,0.3)]">
      {children}
    </button>
  );
};

export default GradientButton;