import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <html>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {ui}
        </ThemeProvider>
      </body>
    </html>
  );
}

describe("Header", () => {
  it("renders theme toggle", () => {
    renderWithProviders(<Header />);
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });
});
