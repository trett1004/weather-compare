import { render, screen } from "@testing-library/react";
import { SearchResults } from "../SearchResults";

const mockResults = [
  { id: 1, name: "Berlin", country: "DE", admin1: "Berlin" },
];

describe("SearchResults", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(
      <SearchResults
        results={mockResults}
        isVisible={false}
        onSelect={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when results are empty", () => {
    const { container } = render(
      <SearchResults results={[]} isVisible={true} onSelect={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a listbox with results when visible", () => {
    render(
      <SearchResults
        results={mockResults}
        isVisible={true}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Berlin (Berlin, DE)")).toBeInTheDocument();
  });
});
