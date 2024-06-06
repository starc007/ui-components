export interface InputOptions
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  /**
   * Input wrapper class name
   * @default ""
   * @type string
   */
  wrapperClassName?: string;

  /**
   * Input class name
   * @default ""
   * @type string
   */
  inputClassName?: string;

  /**
   * label class name
   * @default ""
   * @type string
   */
  labelClassName?: string;

  /**
   * Input placeholder
   * @default ""
   * @type string
   */
  placeholder?: string;

  /**
   * Input label
   * @default ""
   * @type string
   */
  label?: string;

  /**
   * Input type
   * @default "text"
   * @type string
   */
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "file";

  /**
   * Input error state
   * @default false
   * @type boolean
   */
  error?: boolean;

  /**
   * Input error text
   * @default ""
   * @type string
   */
  errorText?: string;

  /**
   * Input required
   * @default false
   * @type boolean
   */
  isInputRequired?: boolean;
}
