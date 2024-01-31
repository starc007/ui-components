import clsx from "clsx";
import { forwardRef } from "react";
import { ButtonProps, ButtonSize, ButtonVariant, Ref } from "./button.types";

const colorMap = {
  outline: "text-gray-900 border-gray-900 hover:bg-gray-900",
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
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed",
    colorMap[variant],
    sizeMap[size],
    className
  );

  return (
    <button ref={ref} className={merged} {...rest}>
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
