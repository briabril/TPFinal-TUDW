export const ENV = {
  isDev: process.env.NODE_ENV !== "production",

  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  MOBILE_SCHEME: process.env.NEXT_PUBLIC_MOBILE_SCHEME,
};
