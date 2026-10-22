// Password rules shared by the sign-up, password reset and change password forms.
// They mirror the backend: at least MIN_LENGTH characters (and at most MAX_LENGTH).
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 100;

// Score from 0 (too short) to 3 (strong):
//   +1 minimum length, +1 upper and lower case letters, +1 a digit and a symbol.
// Below the minimum length the score is always 0.
export const getPasswordScore = (password) => {
  if (password.length < MIN_PASSWORD_LENGTH) return 0;
  let score = 1;
  if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) score += 1;
  if (/(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) score += 1;
  return score;
};

// A new password must have the minimum length and be at least "Medium".
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
