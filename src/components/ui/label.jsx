import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * @typedef {React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>} LabelProps
 */

/**
 * @param {LabelProps} props
 * @param {React.ForwardedRef<HTMLLabelElement>} ref
 */
function LabelImpl(props, ref) {
  const { className, ...other } = /** @type {LabelProps} */ (props)
  return <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...other} />
}

/**
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<LabelProps> & React.RefAttributes<HTMLLabelElement>>}
 */
const Label = React.forwardRef(LabelImpl)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
