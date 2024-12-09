import React from "react";
import "./sp-button.css";
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "sp-button": React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface ButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  disabled = false,
  onClick,
  children,
  style,
}) => {
  return (
    <sp-button
      {...(disabled ? { disabled: true } : {})}
      onClick={onClick}
      style={style}
    >
      {children}
    </sp-button>
  );
};

export default Button;
