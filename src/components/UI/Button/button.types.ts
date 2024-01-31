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
}

export type Ref = HTMLButtonElement;

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ButtonOptions;
