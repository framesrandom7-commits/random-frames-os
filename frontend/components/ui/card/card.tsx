import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CardTitle as TypographyCardTitle, Body } from "@/components/ui/typography"

const cardVariants = cva(
  "group/card flex flex-col overflow-hidden text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-[#171A21]/50 backdrop-blur-sm border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
        dashboard: "bg-[#0F1115]/50 backdrop-blur-sm border border-white/5 shadow-md",
        compact: "bg-[#171A21]/80 border border-white/5 shadow-sm",
        interactive: "bg-[#171A21]/50 backdrop-blur-sm border border-white/5 shadow-md hover:shadow-xl hover:border-white/10 hover:-translate-y-1 cursor-pointer",
        elevated: "bg-[#171A21] border border-white/10 shadow-2xl",
        flat: "bg-[#171A21]/30 border-none",
        outline: "bg-transparent border-2 border-white/10",
      },
      size: {
        default: "rounded-[24px] p-6 gap-6",
        sm: "rounded-[16px] p-4 gap-4",
        lg: "rounded-[32px] p-8 gap-8",
        none: "rounded-[24px] p-0 gap-0",
      },
      responsive: {
        true: "p-4 sm:p-6 md:p-8 gap-4 sm:gap-6",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      responsive: false,
    },
  }
)

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, responsive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, responsive, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <TypographyCardTitle ref={ref} className={className} {...(props as any)} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Body ref={ref} className={cn("text-muted-foreground", className)} {...(props as any)} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-2", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }
