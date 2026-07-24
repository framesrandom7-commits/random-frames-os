import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-sans font-normal text-sm text-white transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-zinc-500 hover:border-white/20 focus-visible:border-[#E53935]/50 focus-visible:ring-4 focus-visible:ring-[#E53935]/20 focus-visible:bg-[#171A21] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
