import { FC } from "react";

type Props = {
  label: string;
  type?: "button" | "submit" | "reset";
} & React.HTMLProps<HTMLButtonElement>;

export const Button: FC<Props> = ({ label, type, ...rest }) => {
  return (
    <button
      className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
      {...rest}
      type={type || "button"}
    >
      {label}
    </button>
  );
};
