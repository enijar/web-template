const config = {
  apiUrl: process.env.API_URL ?? "http://localhost:3000",
} as const;

export default config;
