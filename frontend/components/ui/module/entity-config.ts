import { ColumnDef } from "./module-data-view";
import { FilterDef } from "./module-filters";
import { ReactNode } from "react";
import { z } from "zod";

import { ViewType } from "./module-view-switcher";

export interface EntitySummaryCard {
  id: string;
  title: string;
  value: (stats: any) => string | number;
  icon: any; // Lucide icon
  trend?: (stats: any) => string;
  trendDirection?: (stats: any) => "up" | "down" | "neutral";
  comparison?: string;
}

export interface EntityConfig<T> {
  metadata: {
    entityName: string;
    pluralName: string;
    icon: any; // Lucide icon
    routes: {
      list: string;
      create: string;
      edit: (id: string) => string;
      detail: (id: string) => string;
    };
  };

  views: {
    id: ViewType;
    label: string;
    icon?: any;
  }[];
  defaultView?: ViewType;

  columns: ColumnDef<T>[];

  cardRender: (item: T) => ReactNode;

  filters: FilterDef[];
  searchPlaceholder?: string;

  bulkActions?: (selectedIds: string[], onClearSelection: () => void) => ReactNode;

  summary: EntitySummaryCard[];

  defaultSort: {
    by: string;
    order: "asc" | "desc";
  };

  permissions?: {
    create?: string;
    edit?: string;
    delete?: string;
    view?: string;
  };

  formSchema?: z.ZodType<any, any>;
  validationSchema?: z.ZodType<any, any>;
}
