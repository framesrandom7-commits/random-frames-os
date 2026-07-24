import * as React from "react"
import { cn } from "@/lib/utils"

const typographyVariants = {
  display: "font-heading text-5xl md:text-6xl font-bold tracking-tight leading-[110%]",
  pageTitle: "font-heading text-3xl font-bold tracking-tight leading-[120%]",
  sectionTitle: "font-heading text-2xl font-bold tracking-tight leading-[120%]",
  widgetTitle: "font-heading text-xl font-semibold tracking-tight leading-[120%]",
  cardTitle: "font-heading text-lg font-semibold tracking-tight leading-[120%]",
  body: "font-sans text-sm leading-[150%]",
  caption: "font-sans text-xs leading-[140%] text-zinc-400",
  metricLg: "font-heading text-5xl font-bold tracking-tight text-white",
  metricMd: "font-heading text-4xl font-bold tracking-tight text-white",
  metricSm: "font-heading text-2xl font-bold tracking-tight text-white",
  label: "font-sans text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  helperText: "font-sans text-sm text-zinc-400",
}

export function Display({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn(typographyVariants.display, className)} {...props} />
}

export function PageTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn(typographyVariants.pageTitle, className)} {...props} />
}

export function PageSubtitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-sans text-sm text-zinc-400 font-normal leading-[150%]", className)} {...props} />
}

export function SectionTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn(typographyVariants.sectionTitle, className)} {...props} />
}

export function WidgetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(typographyVariants.widgetTitle, className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(typographyVariants.cardTitle, className)} {...props} />
}

export function Body({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(typographyVariants.body, className)} {...props} />
}

export function Caption({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(typographyVariants.caption, className)} {...props} />
}

export function LabelText({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(typographyVariants.label, className)} {...props} />
}

export function HelperText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(typographyVariants.helperText, className)} {...props} />
}

interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "lg" | "md" | "sm"
}

export function Metric({ size = "md", className, ...props }: MetricProps) {
  const sizeClass = size === "lg" ? typographyVariants.metricLg 
                  : size === "sm" ? typographyVariants.metricSm 
                  : typographyVariants.metricMd
  return <div className={cn(sizeClass, className)} {...props} />
}
