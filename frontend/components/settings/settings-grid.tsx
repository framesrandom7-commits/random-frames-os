"use client";

import React from "react";
import Link from "next/link";
import { 
  Building, 
  Palette, 
  Users, 
  Shield, 
  Receipt, 
  CreditCard, 
  Bell, 
  Calendar, 
  FileText, 
  HardDrive, 
  Plug, 
  Zap, 
  Lock 
} from "lucide-react";

import { FEATURES } from "@/lib/features";
import { RbacDomainService } from "@/domain/rbac/service";
import { SettingsTabId } from "@/domain/rbac/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsGridProps {
  userRoleName?: string | null;
}

export default function SettingsGrid({ userRoleName }: SettingsGridProps) {
  const canAccess = (tab: string) => RbacDomainService.canAccessSettingsTab(userRoleName, tab);

  const SETTING_TILES = [
    {
      id: SettingsTabId.BUSINESS,
      title: "Business",
      description: "Company details and address",
      icon: Building,
      href: "/settings/business",
      enabled: true,
    },
    {
      id: SettingsTabId.BRANDING,
      title: "Branding",
      description: "Logos, colors, and styling",
      icon: Palette,
      href: "/settings/branding",
      enabled: true,
    },
    {
      id: SettingsTabId.USERS,
      title: "Team Management",
      description: "Manage users and team access",
      icon: Users,
      href: "/settings/team",
      enabled: FEATURES.ENABLE_TEAM_MANAGEMENT,
    },
    {
      id: SettingsTabId.ROLES,
      title: "Roles & Permissions",
      description: "Configure role-based access",
      icon: Shield,
      href: "/settings/roles",
      enabled: FEATURES.ENABLE_ROLE_MANAGEMENT,
    },
    {
      id: SettingsTabId.INVOICE,
      title: "Invoice Settings",
      description: "Prefixes, terms, and defaults",
      icon: Receipt,
      href: "/settings/invoice",
      enabled: true,
    },
    {
      id: SettingsTabId.PAYMENT,
      title: "Payment Methods",
      description: "Bank details and UPI setup",
      icon: CreditCard,
      href: "/settings/payment",
      enabled: true,
    },
    {
      id: SettingsTabId.NOTIFICATIONS,
      title: "Notifications",
      description: "Email and SMS alerts",
      icon: Bell,
      href: "/settings/notifications",
      enabled: true,
    },
    {
      id: SettingsTabId.CALENDAR,
      title: "Calendar",
      description: "Calendar sync and scheduling",
      icon: Calendar,
      href: "/settings/calendar",
      enabled: true,
    },
    {
      id: SettingsTabId.FORMS,
      title: "Form Manager",
      description: "Custom fields for leads & clients",
      icon: FileText,
      href: "/settings/forms",
      enabled: true,
    },
    {
      id: SettingsTabId.BACKUP,
      title: "Backup & Restore",
      description: "Export data or wipe system",
      icon: HardDrive,
      href: "/settings/backup",
      enabled: true,
    },
    {
      id: SettingsTabId.INTEGRATIONS,
      title: "Integrations",
      description: "Connect external apps & services",
      icon: Plug,
      href: "/settings/integrations",
      enabled: true,
    },
    {
      id: SettingsTabId.WORKFLOW_AUTOMATION,
      title: "Workflow Automation",
      description: "Automate tasks and triggers",
      icon: Zap,
      href: "/settings/workflow",
      enabled: true,
    },
    {
      id: SettingsTabId.SECURITY,
      title: "Security",
      description: "Security pins and access logs",
      icon: Lock,
      href: "/settings/security",
      enabled: true,
    },
  ];

  const visibleTiles = SETTING_TILES.filter(tile => tile.enabled && canAccess(tile.id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {visibleTiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <Link key={tile.id} href={tile.href}>
            <Card className="h-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-zinc-400 group-hover:text-[#C1121F] group-hover:bg-[#C1121F]/10 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-white text-base">{tile.title}</CardTitle>
                  <CardDescription className="text-zinc-400">{tile.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
