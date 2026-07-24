export const motion = {
  durations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
  curves: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.32, 0.72, 0, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
  },
  presets: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, transform: "translateY(10px)" },
      animate: { opacity: 1, transform: "translateY(0)" },
      exit: { opacity: 0, transform: "translateY(10px)" },
    },
    scale: {
      initial: { opacity: 0, transform: "scale(0.95)" },
      animate: { opacity: 1, transform: "scale(1)" },
      exit: { opacity: 0, transform: "scale(0.95)" },
    }
  }
};
