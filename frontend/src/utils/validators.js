const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each validator returns an error message, or an empty string when the value is valid.

export const validateEmail = (value) => {
  const email = value.trim();
  if (!email) return "Required field";
  if (!EMAIL_REGEX.test(email)) return "Invalid e-mail";
  return "";
};

export const validateLoginPassword = (value) => {
  if (!value) return "Required field";
  if (value.length < 6) return "Minimum of 6 characters";
  return "";
};

export const validateName = (value, max = 50) => {
  const name = value.trim();
  if (!name) return "Required field";
  if (name.length > max) return `Maximum of ${max} characters`;
  return "";
};

export const validateAmount = (value) => {
  if (value === "" || value === null || value === undefined) return "Required field";
  const amount = Number(value);
  if (Number.isNaN(amount) || amount <= 0) return "Must be greater than zero";
  return "";
};

// `today` is yyyy-MM-dd; the API does not accept dates in the future.
export const validatePastOrPresentDate = (value, today) => {
  if (!value) return "Required field";
  if (value > today) return "Date cannot be in the future";
  return "";
};

export const validateCategoryName = (value) => validateName(value, 80);

// Matches the backend rule for names: 2 to 100 characters.
export const validateFullName = (value) => {
  const name = value.trim();
  if (!name) return "Required field";
  if (name.length < 2) return "Minimum of 2 characters";
  if (name.length > 100) return "Maximum of 100 characters";
  return "";
};

export const validateRequired = (value) => (value ? "" : "Required field");
