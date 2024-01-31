export type OptionProps = {
  label: string;
  value: string;
};

export type SelectDropdownProps = {
  showSelectDropdown: boolean;
  setShowSelectDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedOption: React.Dispatch<React.SetStateAction<OptionProps[]>>;
  options: OptionProps[];
  isMulti?: boolean;
  selectedOption: OptionProps[];
  onChange?: (selectedOption: OptionProps[]) => void;
};

export type SelectItemProps = {
  error: boolean;
  selectedOption: OptionProps[];
  showSelectDropdown: boolean;
  placeholder: string;
  defaultValue?: OptionProps[];
  isMulti?: boolean;
  setSelectedOption: React.Dispatch<React.SetStateAction<OptionProps[]>>;
  onChange?: (selectedOption: OptionProps[]) => void;
};

export interface SelectOptions {
  /**
   * Select wrapper class name
   * @default ""
   * @type string
   */
  wrapperClassName?: string;

  /**
   * Select label
   * @default ""
   * @type string
   */
  label?: string;

  /**
   * Select error state
   * @default false
   * @type boolean
   */
  error?: boolean;

  /**
   * Select error text
   * @default ""
   * @type string
   */
  errorText?: string;

  /**
   * Select required
   * @default false
   * @type boolean
   */
  required?: boolean;

  /**
   * Select options
   * @default []
   * @type string[]
   */
  options: {
    value: string;
    label: string;
  }[];

  /**
   * Select default value
   * @default undefined
   * @type function
   */
  defaultSelectValue?: {
    value: string;
    label: string;
  }[];

  /**
   * Select disabled
   * @default false
   * @type boolean
   */
  disabled?: boolean;

  /**
   * Select placeholder
   * @default ""
   * @type string
   */
  placeholder?: string;

  /**
   * Select isMulti
   * @default ""
   * @type string
   */
  isMulti?: boolean;

  /**
   * Select onSelectChange
   */
  onSelectChange?: (selectedOptions: OptionProps[]) => void;
}
