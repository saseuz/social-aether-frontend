import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SidebarLeft from "./SidebarLeft";

// Mock the AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { displayName: "Aether Pilot", username: "aether_pilot", avatarText: "AP" },
    logout: vi.fn(),
  }),
}));

// Mock the NotificationContext
vi.mock("../context/NotificationContext", () => ({
  useNotifications: () => ({
    unreadCount: 3,
  }),
}));

describe("SidebarLeft Collapsible Behavior", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders expanded by default", () => {
    render(
      <MemoryRouter>
        <SidebarLeft />
      </MemoryRouter>
    );

    // Should have brand name "AETHER"
    const brand = screen.getByText("AETHER");
    expect(brand).toBeInTheDocument();
    expect(brand).not.toHaveClass("opacity-0");
    
    // Should show link labels
    const consoleLabel = screen.getByText("Console");
    expect(consoleLabel).toBeInTheDocument();
    expect(consoleLabel).not.toHaveClass("opacity-0");
    
    // Toggle button should be labeled for collapsing
    const toggleBtn = screen.getByLabelText("Collapse sidebar");
    expect(toggleBtn).toBeInTheDocument();
  });

  it("collapses when clicking the toggle button", () => {
    render(
      <MemoryRouter>
        <SidebarLeft />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByLabelText("Collapse sidebar");
    fireEvent.click(toggleBtn);

    // AETHER text should be hidden (opacity-0)
    expect(screen.getByText("AETHER")).toHaveClass("opacity-0");

    // Menu text labels should be hidden (opacity-0)
    expect(screen.getByText("Console")).toHaveClass("opacity-0");
    expect(screen.getByText("Explore")).toHaveClass("opacity-0");

    // Toggle button should now be labeled for expanding
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();

    // Collapse preference should be persisted in localStorage
    expect(localStorage.getItem("aether_sidebar_collapsed")).toBe("true");
  });

  it("loads collapsed state from localStorage", () => {
    localStorage.setItem("aether_sidebar_collapsed", "true");

    render(
      <MemoryRouter>
        <SidebarLeft />
      </MemoryRouter>
    );

    // Should immediately render in collapsed state
    expect(screen.getByText("AETHER")).toHaveClass("opacity-0");
    expect(screen.getByText("Console")).toHaveClass("opacity-0");
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
  });
});
