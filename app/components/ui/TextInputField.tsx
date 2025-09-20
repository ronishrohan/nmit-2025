import React from "react";

interface TextInputFieldProps {
  type?: "text" | "email" | "password";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyPress,
  className = "",
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      className={`p-3 font-medium bg-card rounded-xl w-full mb-4 border-2 border-border lg:w-1/4 ${className}`}
    />
  );
};

export default TextInputField;
