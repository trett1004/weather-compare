import {
  formatHourLabel,
  getWindDirectionArrow,
  formatLocationLabel,
} from "../formatters";

describe("formatHourLabel", () => {
  it("returns the hour as a string", () => {
    expect(formatHourLabel("2024-01-15T14:00")).toBe("14");
    expect(formatHourLabel("2024-01-15T00:00")).toBe("0");
  });
});

describe("getWindDirectionArrow", () => {
  it("returns a rotate transform style", () => {
    expect(getWindDirectionArrow(90)).toEqual({ transform: "rotate(90deg)" });
  });

  it("normalizes degrees over 360", () => {
    expect(getWindDirectionArrow(450)).toEqual({ transform: "rotate(90deg)" });
  });

  it("handles negative degrees", () => {
    expect(getWindDirectionArrow(-90)).toEqual({ transform: "rotate(270deg)" });
  });
});

describe("formatLocationLabel", () => {
  it("includes region and country when present", () => {
    expect(
      formatLocationLabel({ name: "Berlin", admin1: "Berlin", country: "DE" }),
    ).toBe("Berlin (Berlin, DE)");
  });

  it("falls back to name only when region fields are missing", () => {
    expect(formatLocationLabel({ name: "Berlin" })).toBe("Berlin");
  });
});
