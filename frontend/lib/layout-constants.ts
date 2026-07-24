/**
 * Centralized layout constants for Random Frames OS.
 * Using these constants ensures consistency across the application
 * and makes future redesigns much simpler.
 */

export const LAYOUT = {
  // Page boundaries
  pageMaxWidth: "max-w-[1600px]",
  appMaxWidth: "max-w-[2000px]",

  // Padding definitions (responsive)
  padding: {
    app: "p-4 tablet:p-5 laptop:p-6 desktop:p-6",
    page: "p-4 tablet:p-6 laptop:p-8 desktop:p-8",
    card: "p-4 tablet:p-5 laptop:p-6",
    section: "py-6 tablet:py-8 laptop:py-10",
  },

  // Spacing (gaps between elements)
  spacing: {
    sm: "gap-2 tablet:gap-3",
    md: "gap-4 tablet:gap-5 laptop:gap-6",
    lg: "gap-6 tablet:gap-8 laptop:gap-10",
    section: "gap-8 tablet:gap-10 laptop:gap-12",
  },

  // Sidebar sizing
  sidebar: {
    collapsed: "w-20",
    expanded: "w-64",
  },

  // Border radius scale
  radius: {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    app: "rounded-[32px]",
  },
};
