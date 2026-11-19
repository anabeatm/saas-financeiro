// regras de senha (iguais às do back)
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 100;

// nota de 0 (curta demais) a 3 (forte)
export const getPasswordScore = (password) => {
  if (password.length < MIN_PASSWORD_LENGTH) return 0;
  let score = 1;
  if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) score += 1;
  if (/(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) score += 1;
  return score;
};

// válida se for pelo menos "Medium"
export const validateNewPassword = (password) => {
  if (!password) return "Required field";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Minimum of ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Maximum of ${MAX_PASSWORD_LENGTH} characters`;
  }
  if (getPasswordScore(password) < 2) {
    return "Too weak: mix upper and lower case letters, numbers or symbols";
  }
  return "";
};

export const validatePasswordConfirmation = (password, confirmation) => {
  if (!confirmation) return "Required field";
  if (password !== confirmation) return "Passwords do not match";
  return "";
};
