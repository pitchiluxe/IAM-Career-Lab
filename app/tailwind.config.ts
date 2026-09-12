import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        omari: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8ec1ff",
          400: "#599dff",
          500: "#3478f6",
          600: "#1f59db",
          700: "#1a47b0",
          800: "#1b3d8a",
          900: "#1b366e",
          950: "#142247",
        },
      },
    },
  },
  plugins: [],
};
export default config;
