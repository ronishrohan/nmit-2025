import React from "react";
import { cn } from "@/lib/utils"; // utility to merge classNames

interface TextInputFieldProps {
  type?: "text" | "email" | "password";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  type = "text",
  placeholder = "Enter text",
  value,
  onChange,
  onKeyPress,
  className,
  icon,
  fullWidth = true,
  disabled = false,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl overflow-hidden group border-2 focus-within:border-accent transition-colors duration-150 border-border flex items-center relative",
        fullWidth ? "w-full h-full" : "w-fit",
        className
      )}
    >
      {icon && <div className="absolute left-3 text-gray-500">{icon}</div>}

      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "outline-none py-4 px-6 h-full text-xl font-medium bg-transparent",
          fullWidth ? "w-full h-full" : "",
          icon ? "pl-10" : ""
        )}
      />
    </div>
  );
};

export default TextInputField;
