import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @typedef {React.ComponentPropsWithoutRef<'textarea'>} TextareaProps
 */

/**
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<TextareaProps> & React.RefAttributes<HTMLTextAreaElement>>}
 */
const Textarea = React.forwardRef(function Textarea(props, ref) {
  const { className, ...other } = /** @type {TextareaProps} */ (props)
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...other}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
