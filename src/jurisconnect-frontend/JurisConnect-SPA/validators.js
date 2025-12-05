// Form validation functions
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    strength: calculatePasswordStrength(password),
    errors: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    }
  };
}

function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength <= 2) return 'fraca';
  if (strength <= 4) return 'média';
  return 'forte';
}

export function validateRequired(value) {
  return value && value.trim().length > 0;
}

export function validateForm(formData, rules) {
  const errors = {};

  Object.entries(rules).forEach(([field, validators]) => {
    const value = formData[field];
    const fieldErrors = [];

    validators.forEach(validator => {
      if (validator.type === 'required' && !validateRequired(value)) {
        fieldErrors.push(validator.message || 'Campo obrigatório');
      }
      if (validator.type === 'email' && value && !validateEmail(value)) {
        fieldErrors.push(validator.message || 'Email inválido');
      }
      if (validator.type === 'password' && value) {
        const result = validatePassword(value);
        if (!result.isValid) {
          fieldErrors.push(validator.message || 'Senha fraca');
        }
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}