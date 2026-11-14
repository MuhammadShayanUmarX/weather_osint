import { cn } from './cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 disabled:cursor-not-allowed disabled:opacity-45';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'border-accent-cyan/30 bg-accent-cyan/12 text-accent-cyan hover:border-accent-cyan/50 hover:bg-accent-cyan/18',
  secondary:
    'border-line bg-white/[0.03] text-content-secondary hover:border-line-strong hover:bg-white/[0.06] hover:text-content',
  ghost:
    'border-transparent text-content-secondary hover:bg-white/[0.05] hover:text-content',
  danger:
    'border-signal-red/30 bg-signal-red/10 text-signal-red hover:bg-signal-red/16',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
};

export function buttonClasses(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'sm',
  className?: string,
): string {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function iconButtonClasses(className?: string): string {
  return cn(
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-content-muted transition-colors hover:bg-white/[0.05] hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40',
    className,
  );
}

export function inputClasses(className?: string): string {
  return cn(
    'h-9 w-full rounded-lg border border-line bg-black/25 px-3 text-sm text-content placeholder:text-content-faint transition-colors focus:border-accent-cyan/40 focus:outline-none focus:ring-1 focus:ring-accent-cyan/25',
    className,
  );
}

export function selectClasses(className?: string): string {
  return cn(
    'h-9 w-full appearance-none rounded-lg border border-line bg-black/25 px-3 text-sm text-content transition-colors focus:border-accent-cyan/40 focus:outline-none focus:ring-1 focus:ring-accent-cyan/25',
    className,
  );
}
