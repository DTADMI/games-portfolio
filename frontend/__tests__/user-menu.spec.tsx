import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import * as nextAuth from "next-auth/react";
import { UserMenu } from "@/components/user-menu";

vi.mock("next-auth/react", async () => {
  const actual: any = await vi.importActual("next-auth/react");
  return {
    ...actual,
    useSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
});

describe("UserMenu", () => {
  it("shows Sign in when unauthenticated", () => {
    (nextAuth.useSession as any).mockReturnValue({ data: null, status: "unauthenticated" });
    render(<UserMenu />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it("shows Sign out when authenticated", () => {
    (nextAuth.useSession as any).mockReturnValue({ data: { user: { email: "a@b.c" } }, status: "authenticated" });
    render(<UserMenu />);
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });
});
