import * as React from "react";
import { ModuleLayout, ModuleContent } from "./module-layout";
import { ModuleHeader } from "./module-header";
import { ModuleSummary, ModuleSummaryCard } from "./module-summary";
import { ModuleToolbar } from "./module-toolbar";
import { ModuleViewSwitcher } from "./module-view-switcher";
import { EntityConfig } from "./entity-config";

export interface ModulePageProps<T> {
  title: string;
  subtitle?: string;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  
  config: EntityConfig<T>;
  stats?: any; // Data for summary cards
  
  // URL state
  currentView?: string;
  
  children: React.ReactNode; // Typically ModuleDataView or custom view
}

export function ModulePage<T>({
  title,
  subtitle,
  primaryAction,
  secondaryActions,
  config,
  stats,
  currentView,
  children
}: ModulePageProps<T>) {
  
  return (
    <ModuleLayout>
      <ModuleHeader 
        title={title} 
        subtitle={subtitle} 
        primaryAction={primaryAction} 
        secondaryActions={secondaryActions} 
      />
      
      {config.summary && config.summary.length > 0 && stats && (
        <ModuleSummary className="px-4 md:px-6 lg:px-8 pb-2">
          {config.summary.map(card => (
            <ModuleSummaryCard 
              key={card.id}
              title={card.title}
              value={typeof card.value === "function" ? card.value(stats) : card.value}
              icon={card.icon ? <card.icon /> : null}
              trend={card.trend ? card.trend(stats) : undefined}
              trendDirection={card.trendDirection ? card.trendDirection(stats) : undefined}
              comparison={card.comparison}
            />
          ))}
        </ModuleSummary>
      )}

      {(config.filters.length > 0 || config.searchPlaceholder || config.views.length > 1) && (
        <ModuleToolbar 
          searchPlaceholder={config.searchPlaceholder}
          filters={config.filters}
          right={
            config.views.length > 1 ? (
              <ModuleViewSwitcher 
                views={config.views.map(v => ({ id: v.id, label: v.label }))} 
                defaultView={config.defaultView || config.views[0].id} 
              />
            ) : undefined
          }
        />
      )}

      <ModuleContent>
        {children}
      </ModuleContent>
    </ModuleLayout>
  );
}
