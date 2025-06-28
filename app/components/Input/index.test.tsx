import { screen, render } from "@testing-library/react";
import { Input } from ".";
import userEvent from "@testing-library/user-event";

describe("Input", () => {
  const label = "Test Label";

  test.each(["number", "text", "file"] as const)(
    "propsに渡した%s属性で表示されること",
    (attr) => {
      render(<Input label={label} type={attr} />);
      const input = screen.getByLabelText(label);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", attr);
    }
  );

  test("テキストの入力ができること", async () => {
    const user = userEvent.setup();
    render(<Input label={label} />);
    const input = screen.getByLabelText(label);
    await user.type(input, "test");
    expect(input).toHaveValue("test");
  });
});
