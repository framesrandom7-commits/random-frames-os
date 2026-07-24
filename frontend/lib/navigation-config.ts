import {
  LayoutDashboard,
  Users,
  UserCircle,
  Briefcase,
  Camera,
  Calendar,
  DollarSign,
  BarChart,
  PieChart,
  type LucideIcon,
} from "lucide-react";

export type NavigationCategory = "main" | "secondary" | "settings";

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
  category: NavigationCategory;
  sortOrder: number;
  
  // Visibility flags
  showOnMobile: boolean; // Should it appear in the mobile "More" sheet
  showInBottomNav: boolean; // Should it be one of the primary bottom tabs
  
  // Future compat
  permission?: string;
  featureFlag?: string;
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    route: "/",
    icon: LayoutDashboard,
    category: "main",
    sortOrder: 0,
    showOnMobile: true,
    showInBottomNav: false,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard",
    icon: PieChart,
    category: "main",
    sortOrder: 1,
    showOnMobile: true,
    showInBottomNav: true,
  },
  {
    id: "clients",
    label: "Clients",
    route: "/clients",
    icon: UserCircle,
    category: "main",
    sortOrder: 2,
    showOnMobile: true,
    showInBottomNav: true,
  },
  {
    id: "projects",
    label: "Projects",
    route: "/projects",
    icon: Briefcase,
    category: "main",
    sortOrder: 3,
    showOnMobile: true,
    showInBottomNav: true,
  },
  {
    id: "finance",
    label: "Finance",
    route: "/finance",
    icon: DollarSign,
    category: "main",
    sortOrder: 4,
    showOnMobile: true,
    showInBottomNav: true,
  },
  {
    id: "leads",
    label: "Leads",
    route: "/leads",
    icon: Users,
    category: "main",
    sortOrder: 5,
    showOnMobile: true,
    showInBottomNav: false,
  },
  {
    id: "shoots",
    label: "Shoots",
    route: "/shoots",
    icon: Camera,
    category: "main",
    sortOrder: 6,
    showOnMobile: true,
    showInBottomNav: false,
  },
  {
    id: "calendar",
    label: "Calendar",
    route: "/calendar",
    icon: Calendar,
    category: "secondary",
    sortOrder: 7,
    showOnMobile: true,
    showInBottomNav: false,
  },
  {
    id: "analytics",
    label: "Analytics",
    route: "/analytics",
    icon: BarChart,
    category: "secondary",
    sortOrder: 8,
    showOnMobile: true,
    showInBottomNav: false,
  }
];

export const BOTTOM_NAV_ITEMS = NAVIGATION_CONFIG
  .filter(item => item.showInBottomNav)
  .sort((a, b) => a.sortOrder - b.sortOrder);
