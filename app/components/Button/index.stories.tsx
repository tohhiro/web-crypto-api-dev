import { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Props } from ".";

export default {
  title: "app/components/Button",
  component: Button,
  parameters: {
    chromatic: {
      disableSnapshot: true,
    },
  },
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

const mockBaseData: Props = {
  label: "Buttonラベル",
  type: "button",
  onClick: () => {},
};

export const Default: Story = {
  args: mockBaseData,
};

export const Disabled: Story = {
  args: { ...mockBaseData, disabled: true },
};
