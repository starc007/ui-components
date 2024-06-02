export type ButtonVariant = "outline" | "solid" | "ghost";

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
