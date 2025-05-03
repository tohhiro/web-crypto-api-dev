import { Meta, StoryObj } from "@storybook/react-vite";
import { Input, Props } from ".";

export default {
  title: "app/components/Input",
  component: Input,
  parameters: {
    chromatic: {
      disableSnapshot: true,
    },
  },
} satisfies Meta<typeof Input>;

type Story = StoryObj<typeof Input>;

const mockBaseData: Props = {
  label: "Inputラベル",
};

export const Default: Story = {
  args: mockBaseData,
};

export const Number: Story = {
  args: { ...mockBaseData, type: "number" },
};

export const File: Story = {
  args: { ...mockBaseData, type: "file" },
};
