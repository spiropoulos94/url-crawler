import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddURL } from "../AddURL";
import { urlAPI } from "../../services/api";
import type { AxiosResponse } from "axios";
import type { URL } from "../../types";

// Mock the API
jest.mock("../../services/api", () => ({
  urlAPI: {
    add: jest.fn(),
  },
}));

const mockUrlAPI = urlAPI as jest.Mocked<typeof urlAPI>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("AddURL Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(<AddURL />, { wrapper: createWrapper() });

    expect(screen.getByText("Add New URL")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("https://example.com")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add url/i })
    ).toBeInTheDocument();
  });

  it("validates empty URL input", async () => {
    render(<AddURL />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole("button", { name: /add url/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("URL is required")).toBeInTheDocument();
    });
  });

  it("validates invalid URL format", async () => {
    render(<AddURL />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText("https://example.com");
    const submitButton = screen.getByRole("button", { name: /add url/i });

    fireEvent.change(input, { target: { value: "invalid-url" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
    });
  });

  it("successfully submits a valid URL", async () => {
    const mockResponse: AxiosResponse<URL> = {
      data: {
        id: 1,
        url: "https://example.com",
        title: "",
        status: "queued",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      status: 201,
      statusText: "Created",
      headers: {},
      config: {
        headers: undefined,
      },
      request: {},
    } as AxiosResponse<URL>;

    mockUrlAPI.add.mockResolvedValueOnce(mockResponse);

    render(<AddURL />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText("https://example.com");
    const submitButton = screen.getByRole("button", { name: /add url/i });

    fireEvent.change(input, { target: { value: "https://example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUrlAPI.add).toHaveBeenCalledWith({
        url: "https://example.com",
      });
    });
  });

  it("handles API errors gracefully", async () => {
    const errorResponse = {
      response: {
        data: {
          error: "URL already exists",
        },
      },
    };

    mockUrlAPI.add.mockRejectedValueOnce(errorResponse);

    render(<AddURL />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText("https://example.com");
    const submitButton = screen.getByRole("button", { name: /add url/i });

    fireEvent.change(input, { target: { value: "https://example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("URL already exists")).toBeInTheDocument();
    });
  });

  it("clears error when user starts typing again", async () => {
    render(<AddURL />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText("https://example.com");
    const submitButton = screen.getByRole("button", { name: /add url/i });

    // Trigger validation error
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("URL is required")).toBeInTheDocument();
    });

    // Start typing to clear error
    fireEvent.change(input, { target: { value: "h" } });

    expect(screen.queryByText("URL is required")).not.toBeInTheDocument();
  });
});
