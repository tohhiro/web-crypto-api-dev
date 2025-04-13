import { FC } from "react";

type Props = {
  label: string;
  type?: "text" | "number" | "file";
} & React.HTMLProps<HTMLInputElement>;

export const Input: FC<Props> = ({ label, type }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-700 font-bold">{label}</label>
      <input
        type={type || "text"}
        accept={type === "file" ? ".csv" : undefined}
        className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-500"
      />
    </div>
  );
};
