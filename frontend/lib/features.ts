/**
 * Feature Flags for Random Frames OS
 * 
 * Version 1 optimizes the experience for a single Owner.
 * The underlying RBAC and Team Management architecture remains intact.
 * To enable collaborative features for a growing team (Version 2),
 * simply toggle these flags to true.
 */

export const FEATURES = {
  // Enables the Team Management tab in Settings, allowing inviting users.
  ENABLE_TEAM_MANAGEMENT: process.env.NEXT_PUBLIC_ENABLE_TEAM_MANAGEMENT === "true" || false,
  
  // Enables the Roles & Permissions tab in Settings.
  ENABLE_ROLE_MANAGEMENT: process.env.NEXT_PUBLIC_ENABLE_ROLE_MANAGEMENT === "true" || false,
};
