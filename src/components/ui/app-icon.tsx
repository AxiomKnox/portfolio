import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"

export interface AppIconProps {
  icon: string
  className?: string
}

export function AppIcon({ icon, className, ...rest }: AppIconProps) {
  return (
    <Icon
      icon={icon}
      className={cn("inline-block shrink-0", className)}
      {...rest}
    />
  )
}
