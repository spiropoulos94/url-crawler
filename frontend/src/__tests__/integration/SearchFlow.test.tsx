import React from "react";
import { render, screen, userEvent, act } from "../../test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { SearchInput } from "../../components/features/SearchInput";
import { usePagination } from "../../hooks/usePagination";

// Simple test component that uses search functionality
const SearchTestComponent = () => {
  const { params, handleSearch } = usePagination();

  return (
    <div>
      <SearchInput
        value={params.search || ""}
        onChange={handleSearch}
        placeholder="Search URLs..."
      />
      <div data-testid="search-params">
        Search: "{params.search}" | Page: {params.page}
      </div>
    </div>
  );
};

const IntegrationWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe("Search Flow Integration", () => {
  it("handles search input and resets page", async () => {
    const user = userEvent.setup();

    render(
      <IntegrationWrapper>
        <SearchTestComponent />
      </IntegrationWrapper>
    );

    // Initially should show empty search and page 1
    expect(screen.getByTestId("search-params")).toHaveTextContent(
      'Search: "" | Page: 1'
    );

    // Type in search input
    const searchInput = screen.getByPlaceholderText("Search URLs...");
    await user.type(searchInput, "example");

    // Wait for debounced search
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    // Should update search term and reset to page 1
    expect(screen.getByTestId("search-params")).toHaveTextContent(
      'Search: "example" | Page: 1'
    );
  });

  it("clears search when input is cleared", async () => {
    const user = userEvent.setup();

    render(
      <IntegrationWrapper>
        <SearchTestComponent />
      </IntegrationWrapper>
    );

    const searchInput = screen.getByPlaceholderText("Search URLs...");

    // Type and then clear
    await user.type(searchInput, "test");
    await user.clear(searchInput);

    // Wait for debounced search
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    // Should clear search
    expect(screen.getByTestId("search-params")).toHaveTextContent(
      'Search: "" | Page: 1'
    );
  });
});
