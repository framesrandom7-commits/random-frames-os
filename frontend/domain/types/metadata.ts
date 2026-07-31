export interface StatusMetadata {
  label: string;
  color: string;
  icon: string;
  description: string;
  order: number;
  variant: "default" | "secondary" | "destructive" | "outline";
}
