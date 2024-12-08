const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
} as const;

export default config;
