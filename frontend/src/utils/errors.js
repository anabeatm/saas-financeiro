// The axios interceptor rejects with a plain message string when the API explains the failure.
export const getErrorMessage = (
  err,
  fallback = "Something went wrong. Please try again.",
) => (typeof err === "string" ? err : fallback);
