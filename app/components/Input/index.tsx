import { forwardRef, useId } from "react";

export type Props = {
  label: string;
  type?: "text" | "number" | "file";
};

export const Input = forwardRef<
  HTMLInputElement,
  Props & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, type = "text", ...field }, ref) => {
  const { value, ...rest } = field;

  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-gray-700 font-bold">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        type={type}
        accept={type === "file" ? ".csv" : undefined}
        className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-500"
        {...(type === "file" ? rest : { ...rest, value })}
      />
    </div>
  );
});

Input.displayName = "Input";
