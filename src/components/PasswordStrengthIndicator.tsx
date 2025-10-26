import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = 'weak' | 'medium' | 'strong';

interface PasswordRequirements {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

const calculateStrength = (password: string): StrengthLevel => {
  if (!password) return 'weak';

  const requirements = getPasswordRequirements(password);

  // Strong: all requirements met
  if (
    requirements.hasMinLength &&
    requirements.hasUppercase &&
    requirements.hasLowercase &&
    requirements.hasNumber
  ) {
    return 'strong';
  }

  // Medium: 8+ chars and has at least uppercase, lowercase, OR number (but not all)
  if (
    requirements.hasMinLength &&
    (requirements.hasUppercase || requirements.hasLowercase || requirements.hasNumber)
  ) {
    return 'medium';
  }

  // Weak: anything else (< 8 chars OR missing critical requirements)
  return 'weak';
};

const getPasswordRequirements = (password: string): PasswordRequirements => {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const requirements = useMemo(() => getPasswordRequirements(password), [password]);

  const strengthConfig = {
    weak: {
      label: 'Weak',
      className: 'bg-red-500',
      textClassName: 'text-red-600',
      width: '33%',
    },
    medium: {
      label: 'Medium',
      className: 'bg-yellow-500',
      textClassName: 'text-yellow-600',
      width: '66%',
    },
    strong: {
      label: 'Strong',
      className: 'bg-green-500',
      textClassName: 'text-green-600',
      width: '100%',
    },
  };

  const config = strengthConfig[strength];

  return (
    <div role="region" aria-label="Password strength indicator" className="space-y-2">
      {/* Strength label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password Strength:</span>
        <span
          className={`text-sm font-semibold ${config.textClassName}`}
          aria-live="polite"
        >
          {config.label}
        </span>
      </div>

      {/* Visual progress bar */}
      <div
        data-testid="strength-indicator"
        className={`h-2 rounded-full transition-all duration-300 ${config.className}`}
        style={{ width: config.width }}
        role="progressbar"
        aria-valuenow={strength === 'weak' ? 33 : strength === 'medium' ? 66 : 100}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Requirements checklist */}
      <ul className="mt-3 space-y-1 text-sm">
        <li
          className={
            requirements.hasMinLength
              ? 'text-green-600 font-medium'
              : 'text-gray-500'
          }
        >
          {requirements.hasMinLength ? '✓' : '○'} At least 8 characters
        </li>
        <li
          className={
            requirements.hasUppercase
              ? 'text-green-600 font-medium'
              : 'text-gray-500'
          }
        >
          {requirements.hasUppercase ? '✓' : '○'} One uppercase letter
        </li>
        <li
          className={
            requirements.hasLowercase
              ? 'text-green-600 font-medium'
              : 'text-gray-500'
          }
        >
          {requirements.hasLowercase ? '✓' : '○'} One lowercase letter
        </li>
        <li
          className={
            requirements.hasNumber
              ? 'text-green-600 font-medium'
              : 'text-gray-500'
          }
        >
          {requirements.hasNumber ? '✓' : '○'} One number
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
