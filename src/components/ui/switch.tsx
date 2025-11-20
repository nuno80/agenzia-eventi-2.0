'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const Switch = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <input type="checkbox" className="peer sr-only" ref={ref} {...props} />
        <div
          className={cn(
            'h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-checked:bg-primary transition-colors',
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white",
            className
          )}
        ></div>
      </div>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
