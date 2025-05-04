import { Meta, StoryObj } from "@storybook/react-vite";
import { Form } from ".";

export default {
  title: "app/components/Form",
  component: Form,
  parameters: {
    chromatic: {
      disableSnapshot: true,
    },
  },
} satisfies Meta<typeof Form>;

type Story = StoryObj<typeof Form>;

export const Default: Story = {};
