// tailwind.config.js

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#021526',
        'navy-blue': '#03346E',
        'light-blue': '#6EACDA',
        'soft-beige': '#E2E2B6',
      },
    },
  },
  plugins: [],
};
export default config;