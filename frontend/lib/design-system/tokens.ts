import { colors } from "./colors";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { typography } from "./typography";
import { motion } from "./motion";

export const designTokens = {
  colors,
  spacing,
  radius,
  typography,
  motion,
};

export type DesignTokens = typeof designTokens;
