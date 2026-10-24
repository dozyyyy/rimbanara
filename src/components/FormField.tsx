import type { ReactNode } from 'react'

import { errorTextClass, helperTextClass, labelClass } from './uiClasses.ts'

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/** Label + control + hint/error. The control is passed as children. */
export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </label>
      {children}
      {hint ? <p className={helperTextClass}>{hint}</p> : null}
      {error ? <p className={errorTextClass}>{error}</p> : null}
    </div>
  )
}
