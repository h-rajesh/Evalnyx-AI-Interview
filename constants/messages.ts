export const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS:
      "Registration successful. Please verify your email.",

    LOGIN_SUCCESS:
      "Login successful.",

    INVALID_CREDENTIALS:
      "Invalid email or password.",

    EMAIL_VERIFIED:
      "Email verified successfully.",

    PASSWORD_RESET_SENT:
      "If an account exists, a password reset email has been sent.",

    PASSWORD_RESET_SUCCESS:
      "Password updated successfully.",
  },

  COMMON: {
    INTERNAL_ERROR:
      "Internal server error.",

    UNAUTHORIZED:
      "Unauthorized.",

    FORBIDDEN:
      "Forbidden.",

    NOT_FOUND:
      "Resource not found.",
  },
} as const;