"use client";

import { Button } from "../Button";
import { useForm } from "react-hook-form";

export const Form = () => {
  const { handleSubmit } = useForm();

  const onSubmit = (data: Record<string, string>) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Button label="Submit" type="submit" />
    </form>
  );
};
