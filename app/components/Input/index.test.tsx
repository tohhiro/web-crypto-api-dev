import { screen, render } from "@testing-library/react";
import { Input } from ".";
import userEvent from "@testing-library/user-event";

describe("Input", () => {
  const label = "Test Label";

  test("propsに渡したラベルとtext属性で表示される", () => {
    render(<Input label={label} />);
    const input = screen.getByLabelText(label);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  test("propsに渡したラベルとnumber属性で表示される", () => {
    render(<Input label={label} type="number" />);
    const input = screen.getByLabelText(label);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
  });

  test("propsに渡したラベルとfile属性で表示される", () => {
    render(<Input label={label} type="file" />);
    const input = screen.getByLabelText(label);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "file");
  });

  test("テキストの入力ができる", async () => {
    const user = userEvent.setup();
    render(<Input label={label} />);
    const input = screen.getByLabelText(label);
    await user.type(input, "test");
    expect(input).toHaveValue("test");
  });
});
