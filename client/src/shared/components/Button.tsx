import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Disables the button while a form action is in flight. */
  pending?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({
  pending = false,
  variant = 'primary',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');

  return (
    <button {...rest} className={classes} disabled={disabled || pending}>
      {children}
    </button>
  );
}
