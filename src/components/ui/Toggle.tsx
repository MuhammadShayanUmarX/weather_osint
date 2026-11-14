import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  ariaLabel,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 disabled:cursor-not-allowed disabled:opacity-40',
        checked
          ? 'border-accent-cyan/40 bg-accent-cyan/25'
          : 'border-line-strong bg-white/[0.04]',
        className,
      )}
    >
      <span
        className={cn(
          'block h-3.5 w-3.5 rounded-full shadow-sm transition-transform duration-150',
          checked
            ? 'translate-x-[18px] bg-accent-cyan'
            : 'translate-x-[3px] bg-content-muted',
        )}
      />
    </button>
  );
}
