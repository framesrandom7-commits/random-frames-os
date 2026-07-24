import * as React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Typography } from "@/components/ui/typography"
import { Badge } from "@/components/ui/feedback/badge"
import { cn } from "@/lib/utils"

export interface QuickActionDef {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  permission?: string;
  badge?: string;
  shortcut?: string;
}

export interface QuickActionCardProps {
  action: QuickActionDef;
  className?: string;
}

export function QuickActionCard({ action, className }: QuickActionCardProps) {
  const { title, description, icon: Icon, href, onClick, disabled, badge, shortcut } = action;
  
  const content = (
    <Card 
      variant="interactive" 
      className={cn(
        "h-full p-4 flex items-start gap-4", 
        disabled && "opacity-50 pointer-events-none grayscale",
        className
      )}
      onClick={!href && !disabled ? onClick : undefined}
    >
      <div className="p-2 rounded-lg bg-white/5 text-foreground shrink-0 mt-1">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Typography variant="body" className="font-medium truncate">{title}</Typography>
          {badge && <Badge variant="secondary" className="shrink-0">{badge}</Badge>}
        </div>
        {description && (
          <Typography variant="caption" color="muted" className="line-clamp-2">
            {description}
          </Typography>
        )}
      </div>
      {shortcut && (
        <div className="hidden sm:flex shrink-0">
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-muted-foreground font-mono">
            {shortcut}
          </kbd>
        </div>
      )}
    </Card>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[24px]">
        {content}
      </Link>
    )
  }

  return content;
}

export interface QuickActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: QuickActionDef[];
}

export function QuickActions({ actions, className, ...props }: QuickActionsProps) {
  // Filter out any actions that the user does not have permission for here (if we had a usePermissions hook)
  const visibleActions = actions; // placeholder for permission filtering

  return (
    <div 
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
      {...props}
    >
      {visibleActions.map(action => (
        <QuickActionCard key={action.id} action={action} />
      ))}
    </div>
  )
}
