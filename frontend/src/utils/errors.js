// pega a msg de erro
export const getErrorMessage = (
  err,
  fallback = "Something went wrong. Please try again.",
) => (typeof err === "string" ? err : fallback);
