import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Root from "./root.component";
import * as accountStorage from "../utils/accountStorage";

// Mock the accountStorage
vi.mock("@/utils/accountStorage", () => ({
  getAccountId: vi.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-expect-error - Vitest globals types
describe("Root component", () => {
  // @ts-expect-error - Vitest globals types
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // @ts-expect-error - Vitest globals types
  it("should render loading state initially", async () => {
    vi.mocked(accountStorage.getAccountId).mockReturnValue(null);

    render(<Root />);

    // The component shows "Carregando..." while loading account
    // @ts-expect-error - Vitest globals types
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();

    // Wait for account to load
    await waitFor(() => {
      // @ts-expect-error - Vitest globals types
      expect(accountStorage.getAccountId).toHaveBeenCalled();
    });
  });

  // @ts-expect-error - Vitest globals types
  it("should show error message when accountId is not found", async () => {
    vi.mocked(accountStorage.getAccountId).mockReturnValue(null);

    render(<Root />);

    await waitFor(() => {
      // @ts-expect-error - Vitest globals types
      expect(screen.getByText(/conta não identificada/i)).toBeInTheDocument();
      // @ts-expect-error - Vitest globals types
      expect(screen.getByText(/atualizar tela/i)).toBeInTheDocument();
    });
  });

  // @ts-expect-error - Vitest globals types
  it("should render Statement when accountId is found", async () => {
    vi.mocked(accountStorage.getAccountId).mockReturnValue("test-account-id");

    render(<Root />);

    await waitFor(() => {
      // @ts-expect-error - Vitest globals types
      expect(accountStorage.getAccountId).toHaveBeenCalled();
    });

    // Statement component should be rendered (it will show "Extrato" title)
    await waitFor(() => {
      // @ts-expect-error - Vitest globals types
      expect(screen.getByText(/extrato/i)).toBeInTheDocument();
    });
  });
});
