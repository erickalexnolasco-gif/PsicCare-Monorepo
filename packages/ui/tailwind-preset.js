/** Shared Tailwind preset — PsiCare design tokens (macOS + rosa pastel) */
module.exports = {
  theme: {
    extend: {
      colors: {
        psi: {
          bg: "#FFF6F6",
          blush: "#FCEAEA",
          rosa: "#F9D4D4",
          sidebar: "#FDE8F0",
          medio: "#E8A0BF",
          deep: "#D88AAB",
          text: "#3D2B35",
          soft: "#9B7B87",
          success: "#A8D5A2",
          pending: "#F4C6A0",
          alert: "#EF9A9A",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"DM Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        psi: "1rem",
        "psi-lg": "1.5rem",
      },
      boxShadow: {
        psi: "0 4px 24px rgba(200, 100, 130, 0.08)",
        "psi-lg": "0 12px 40px rgba(200, 100, 130, 0.12)",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: {
        "fade-up": "fadeUp 400ms ease both",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
};
