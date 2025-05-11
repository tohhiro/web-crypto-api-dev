import { screen, render } from "@testing-library/react";
import { Button } from ".";
import userEvent from "@testing-library/user-event";

describe("Button", () => {
  const label = "Test Label";

  test("propsに渡したラベル、デフォルトはbutton属性で表示される", () => {
    render(<Button label={label} />);
    const buttonElement = screen.getByRole("button", { name: label });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveAttribute("type", "button");
  });

  test("propsに渡したラベルとsubmit属性で表示される", () => {
    render(<Button label={label} type="submit" />);
    const buttonElement = screen.getByRole("button", { name: label });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveAttribute("type", "submit");
  });

  test("propsに渡したラベルとreset属性で表示される", () => {
    render(<Button label={label} type="reset" />);
    const buttonElement = screen.getByRole("button", { name: label });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveAttribute("type", "reset");
  });

  test("ボタンが押下するとonClickが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button label={label} onClick={onClick} />);
    const buttonElement = screen.getByRole("button", { name: label });
    await user.click(buttonElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
