import * as React from 'react'

/**
 * @typedef {React.ComponentPropsWithoutRef<'input'>} InputProps
 */

/**
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<InputProps> & React.RefAttributes<HTMLInputElement>>}
 */
const Input = React.forwardRef(function Input(props, ref) {
  const { className = '', type = 'text', ...other } = /** @type {InputProps} */ (props)

  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...other}
    />
  )
})
Input.displayName = 'Input'

export { Input }
