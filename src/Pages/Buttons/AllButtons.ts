export const AllButtons: Record<number, string> = {
  1: `export type ButtonVariant = "outline" | "solid" | "ghost";

export type ButtonSize = "small" | "medium" | "large";

export interface ButtonOptions {
  /**
   * Button display variants
   * @default "solid"
   * @type ButtonVariant
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default "medium"
   * @type ButtonSize
   */
  size?: ButtonSize;

  /**
   * Show loading spinner
   * @default false
   * @type boolean
   */
  showloading?: boolean;

  /**
   * Button icon
   * @type React.ReactNode
   */
  lefticon?: React.ReactNode;

  /**
   * Button icon
   * @type React.ReactNode
   */
  righticon?: React.ReactNode;
}

export type Ref = HTMLButtonElement;

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ButtonOptions;

    import clsx from "clsx";
import { forwardRef } from "react";

const colorMap = {
  outline:
    "text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white",
  solid: "text-white bg-gray-900 hover:bg-gray-700",
  ghost: "text-gray-900 hover:bg-gray-100",
} as Record<ButtonVariant, string>;

const sizeMap = {
  small: "px-3 py-1 text-sm",
  medium: "px-6 py-2 text-base",
  large: "px-10 py-3 text-lg",
} as Record<ButtonSize, string>;

const Button = forwardRef<Ref, ButtonProps>((props, ref) => {
  const {
    variant = "solid",
    className,
    children,
    size = "medium",
    ...rest
  } = props;

  const merged = clsx(
    "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed",
    colorMap[variant],
    sizeMap[size],
    className
  );

  return (
    <button ref={ref} className={merged} {...rest}>
      {props?.showloading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <>
          {props?.lefticon && props?.lefticon}
          {children}
          {props?.righticon && props?.righticon}
        </>
      )}
    </button>
  );
});

Button.displayName = "Button";
export default Button;

  `,
};
