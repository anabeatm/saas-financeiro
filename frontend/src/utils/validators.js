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
