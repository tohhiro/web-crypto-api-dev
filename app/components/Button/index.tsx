import { FC } from "react";

export type Props = {
  label: string;
  type?: "button" | "submit" | "reset";
} & React.HTMLProps<HTMLButtonElement>;

export const Button: FC<Props> = ({
  label,
  type = "button",
  disabled,
  ...rest
}) => {
  return (
    <button
      {...rest}
      className={`bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700  ${
        disabled ? "opacity-50 cursor-not-allowed" : " cursor-pointer"
      }`}
      type={type}
    >
      {label}
    </button>
  );
};
