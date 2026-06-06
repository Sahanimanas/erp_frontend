export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Plus Jakarta Sans","system-ui","sans-serif"] },
      animation: { "fade-in": "fadeIn 0.3s ease-in-out" },
      keyframes: { fadeIn: { "0%":{ opacity:"0" }, "100%":{ opacity:"1" } } }
    }
  },
  plugins: []
};
