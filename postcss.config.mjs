const config = {
  plugins: ["@tailwindcss/postcss"],
};
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Define your custom color here
        'custom-red': '#ef4444', 
      },
    },
  },
  plugins: [],
};
export default config;
