import { FC } from "react";

export type Props = {
  label: string;
  type?: "button" | "submit" | "reset";
} & React.HTMLProps<HTMLButtonElement>;

export const Button: FC<Props> = ({ label, type, ...rest }) => {
  return (
    <button
      className={`bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out ${
        rest.disabled ? "opacity-50 cursor-not-allowed" : " cursor-pointer"
      }`}
      {...rest}
      type={type || "button"}
    >
      {label}
    </button>
  );
};
