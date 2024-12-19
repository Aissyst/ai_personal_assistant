import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['ReplicaLL'],
        mono: ['ReplicaLLMono'],
      },
      colors: {
        customBrown: {
          DEFAULT: '#A88E4F',    // Main color value
          50: '#F4EFE9',         // Lighter shades
          100: '#fcf5e2',
          200: '#D7C7B2',
          300: '#C8B396',
          400: '#BA9F7A',
          500: '#A88E4F',        // Original color
          600: '#8C763D',
          700: '#705E30',
          800: '#544622',
          900: '#382F15',
        },
      },
    },
  },
  plugins: [],
};
export default config;
