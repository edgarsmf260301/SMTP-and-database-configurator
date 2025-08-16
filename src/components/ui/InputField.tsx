import React from 'react';

interface InputFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    type={type}
    className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500 text-base font-semibold placeholder-gray-400 min-w-0"
  />
);

export default InputField;
