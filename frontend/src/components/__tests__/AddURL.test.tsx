import { render, screen } from "../../test-utils";
import { AddURL } from "../AddURL";
import { vi } from "vitest";

// Mock the API
vi.mock("../../services/api", () => ({
  urlAPI: {
    add: vi.fn(),
  },
}));

// Mock the hooks
vi.mock("../../hooks/useAddURLForm", () => ({
  useAddURLForm: () => ({
    formData: { url: '' },
    errors: {},
    isSubmitting: false,
    isSuccess: false,
    successMessage: '',
    isNewURL: true,
    setFieldValue: vi.fn(),
    handleSubmit: vi.fn(),
  }),
}));

describe("AddURL Component", () => {
  it("renders the form correctly", () => {
    render(<AddURL />);

    expect(screen.getByText("Add New URL")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("https://example.com or example.com")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add url/i })
    ).toBeInTheDocument();
  });

  it("renders form structure", () => {
    render(<AddURL />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it("displays header content", () => {
    render(<AddURL />);
    
    expect(screen.getByText("Add New URL")).toBeInTheDocument();
    expect(screen.getByText(/Enter a website URL to start crawling/)).toBeInTheDocument();
  });
});