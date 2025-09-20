"use client"
import React from "react";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
}: ButtonProps) => {
  const baseStyles =
    "rounded-xl  text-lg flex gap-2 items-center cursor-pointer transition-all duration-100";

  const variantStyles = {
    primary: "bg-accent text-white hover:bg-accent/90 border-2 border-accent",
    secondary: "bg-white text-inactive hover:text-black border-2 border-border hover:bg-zinc-200 ",
    outline:
      "",
  };

  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
