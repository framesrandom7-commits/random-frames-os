import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("transition-colors duration-200", {
  variants: {
    variant: {
      display: "font-heading font-bold tracking-tight leading-[110%]",
      pageTitle: "font-heading font-bold tracking-tight leading-[130%]",
      sectionTitle: "font-heading font-bold tracking-tight leading-[130%]",
      widgetTitle: "font-heading font-semibold tracking-tight leading-[120%]",
      cardTitle: "font-heading font-semibold tracking-tight leading-[120%]",
      body: "font-sans leading-[150%]",
      caption: "font-sans leading-[140%]",
      label: "font-sans font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      code: "font-mono font-medium bg-white/5 rounded-md",
    },
    size: {
      default: "",
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
    },
    color: {
      default: "text-white",
      muted: "text-zinc-400",
      primary: "text-[#C1121F]",
    },
    responsive: {
      true: "",
      false: "",
    }
  },
  compoundVariants: [
    // Provide adaptive defaults based on variant when responsive=true
    { variant: "display", responsive: true, className: "text-5xl md:text-6xl" },
    { variant: "pageTitle", responsive: true, className: "text-3xl md:text-4xl font-extrabold" },
    { variant: "sectionTitle", responsive: true, className: "text-xl md:text-2xl" },
    { variant: "widgetTitle", responsive: true, className: "text-lg md:text-xl" },
    { variant: "cardTitle", responsive: true, className: "text-base md:text-lg" },
    { variant: "body", responsive: true, className: "text-sm md:text-base" },
    { variant: "caption", responsive: true, className: "text-xs md:text-sm" },
  ],
  defaultVariants: {
    variant: "body",
    size: "default",
    color: "default",
    responsive: true,
  },
});

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

export function Typography({ className, variant, size, color, responsive, as, ...props }: TypographyProps) {
  // Determine default element based on variant if `as` is not provided
  let Component: React.ElementType = as || "p";
  
  if (!as) {
    if (variant === "display" || variant === "pageTitle") Component = "h1";
    else if (variant === "sectionTitle") Component = "h2";
    else if (variant === "widgetTitle" || variant === "cardTitle") Component = "h3";
    else if (variant === "label") Component = "label";
    else if (variant === "code") Component = "code";
    else if (variant === "caption") Component = "span";
  }

  return (
    <Component
      className={cn(typographyVariants({ variant, size, color, responsive, className }))}
      {...props}
    />
  );
}

// -----------------------------------------------------------------------------
// Legacy Wrappers (Compatibility Export)
// -----------------------------------------------------------------------------

export function Display({ className, ...props }: Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">) {
  return <Typography variant="display" className={className} {...props} />
}

export function PageTitle({ className, ...props }: Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">) {
  return <Typography variant="pageTitle" className={className} {...props} />
}

export function PageSubtitle({ className, ...props }: Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">) {
  return <Typography variant="body" color="muted" className={className} {...props} />
}

export function SectionTitle({ className, ...props }: Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">) {
  return <Typography variant="sectionTitle" className={className} {...props} />
}

export function WidgetTitle({ className, ...props }: Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">) {
  return <Typography variant="widgetTitle" className={className} {...props} />
}

export function CardTitle({ className, ...props }: Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">) {
  return <Typography variant="cardTitle" className={className} {...props} />
}

export function Body({ className, ...props }: Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">) {
  return <Typography variant="body" className={className} {...props} />
}

export function Caption({ className, ...props }: Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">) {
  return <Typography variant="caption" color="muted" className={className} {...props} />
}

export function LabelText({ className, ...props }: Omit<React.HTMLAttributes<HTMLSpanElement>, "color">) {
  return <Typography variant="label" className={className} {...props} />
}

export function HelperText({ className, ...props }: Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">) {
  return <Typography variant="caption" color="muted" className={className} {...props} />
}

interface MetricProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  size?: "lg" | "md" | "sm"
}

export function Metric({ size = "lg", className, ...props }: MetricProps) {
  const sizeClasses = {
    lg: "text-5xl",
    md: "text-4xl",
    sm: "text-2xl"
  }
  
  return (
    <div className={cn("font-heading font-bold tracking-tight text-white", sizeClasses[size], className)} {...props} />
  )
}
