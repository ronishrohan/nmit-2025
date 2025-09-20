import React from "react";
import { cn } from "@/lib/utils"; // optional utility to merge classNames if you use it

type InputProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  defaultValue?: string;
};

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder = "Enter text",
  type = "text",
  icon,
  className,
  fullWidth = true,
  disabled = false,
  defaultValue,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl group border-2 focus-within:border-accent transition-colors duration-150 border-border flex items-center relative",
        fullWidth ? "w-full h-full" : "w-fit",
        className
      )}
    >
      {icon && <div className="absolute left-3 text-gray-500">{icon}</div>}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        defaultValue={defaultValue}
        className={cn(
          "outline-none py-4  px-6 h-full text-xl font-medium bg-transparent",
          fullWidth ? "w-full h-full" : ""
        )}
      />
    </div>
  );
};

export default Input;
