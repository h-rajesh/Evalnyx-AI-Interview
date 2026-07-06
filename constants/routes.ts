export const ROUTES = {
  HOME: "/",

  AUTH: {
    SIGN_IN: "/auth/signin",
    SIGN_UP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_NOTICE: "/verify-email-notice",
  },

  DASHBOARD: "/dashboard",

  PROFILE: "/profile",

  INTERVIEW: {
    ROOT: "/interview",
    CREATE: "/interview/create",
  },

  RESUME: "/resume",
} as const;