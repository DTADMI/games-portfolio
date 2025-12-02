import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

// Mock next-auth to avoid requiring a real <SessionProvider /> in this unit test
vi.mock("next-auth/react", async () => {
  const actual: any = await vi.importActual("next-auth/react");
  return {
    ...actual,
    useSession: vi.fn().mockReturnValue({ data: null, status: "unauthenticated" }),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
});

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {ui}
    </ThemeProvider>,
  );
}

describe("Header", () => {
  it("renders theme toggle", () => {
    renderWithProviders(<Header />);
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });
});
