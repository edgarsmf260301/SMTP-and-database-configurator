import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) =>
  message ? (
    <div className="text-red-400 text-base font-semibold">{message}</div>
  ) : null;

export default ErrorMessage;
