import { FC } from "react";

type Props = {
  label: string;
  type?: "button" | "submit" | "reset";
} & React.HTMLProps<HTMLButtonElement>;

export const Button: FC<Props> = ({ label, type }) => {
  return (
    <button
      className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
      type={type || "button"}
    >
      {label}
    </button>
  );
};
