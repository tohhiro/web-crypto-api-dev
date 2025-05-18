import { renderHook } from "@testing-library/react";
import { useEncrypt } from ".";
import { KeyAndCsv } from "@/app/components/Form";

describe("useEncrypt", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:fake-url");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("encryptedData が null の場合、何もしない", () => {
    const { result } = renderHook(() => useEncrypt());
    expect(() => result.current.encrypt({ encryptedData: null })).not.toThrow();
  });

  it("encryptedData がある場合、ダウンロード可能なリンクが生成される", () => {
    const { result } = renderHook(() => useEncrypt());

    const encryptedData: KeyAndCsv = {
      encryptedCsv: btoa("test csv content"),
      encryptedKey: "dummy-key",
      iv: "dummy-iv",
    };

    const clickSpy = vi.fn();
    const anchor = document.createElement("a");
    anchor.click = clickSpy;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    result.current.encrypt({ encryptedData });

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
    expect(clickSpy).toHaveBeenCalled();
  });
});
