import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Root from "./root.component";
import * as statementApi from "@/api/statement.api";

// Mock the API
vi.mock("@/api/statement.api", () => ({
  fetchAccount: vi.fn().mockResolvedValue({
    id: "test-account-id",
    type: "checking",
  }),
}));

describe("Root component", () => {
  it("should render loading state initially", async () => {
    render(<Root />);

    // The component shows "Carregando..." while loading account
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();

    // Wait for account to load
    await waitFor(() => {
      expect(statementApi.fetchAccount).toHaveBeenCalled();
    });
  });
});
