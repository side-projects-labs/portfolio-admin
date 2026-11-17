import { type RegisterOptions, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { cn } from '@/lib/utils';
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  register?: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  validation?: RegisterOptions<any>;
  className?: string;
}
function FormInput({ id, name, register, errors, validation, className, ...props }: FormInputProps) {
  const error = errors?.[id];
  const errorId = `${id}-error`;
  const description = [props['aria-describedby'], error && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">
        {name}
      </label>
      <input
        id={id}
        className={cn(
          'block min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground',
          className,
        )}
        {...(register ? register(id, validation) : {})}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={description}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-destructive">
          {error.message as string}
        </p>
      )}
    </>
  );
}
export { FormInput };
