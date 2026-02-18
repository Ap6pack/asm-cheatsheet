import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkButton } from "@/components/content/bookmark-button";

vi.mock("@/lib/stores", () => ({
  useBookmarksStore: vi.fn(),
  useHydration: vi.fn(),
}));

import { useHydration, useBookmarksStore } from "@/lib/stores";

const mockAdd = vi.fn();
const mockRemove = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useHydration as ReturnType<typeof vi.fn>).mockReturnValue(true);
  (useBookmarksStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    isBookmarked: vi.fn().mockReturnValue(false),
    addBookmark: mockAdd,
    removeBookmark: mockRemove,
  });
});

describe("BookmarkButton", () => {
  it("renders bookmark button when hydrated", () => {
    render(<BookmarkButton id="test" type="command" title="Test Cmd" />);
    expect(screen.getByLabelText("Add bookmark")).toBeDefined();
  });

  it("returns null when not hydrated", () => {
    (useHydration as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const { container } = render(<BookmarkButton id="test" type="command" title="Test" />);
    expect(container.innerHTML).toBe("");
  });

  it("calls addBookmark when clicked and not bookmarked", () => {
    render(<BookmarkButton id="test" type="command" title="Test Cmd" category="Recon" />);
    fireEvent.click(screen.getByLabelText("Add bookmark"));
    expect(mockAdd).toHaveBeenCalledWith({
      id: "test",
      type: "command",
      title: "Test Cmd",
      category: "Recon",
    });
  });

  it("calls removeBookmark when clicked and already bookmarked", () => {
    (useBookmarksStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isBookmarked: vi.fn().mockReturnValue(true),
      addBookmark: mockAdd,
      removeBookmark: mockRemove,
    });
    render(<BookmarkButton id="test" type="command" title="Test Cmd" />);
    fireEvent.click(screen.getByLabelText("Remove bookmark"));
    expect(mockRemove).toHaveBeenCalledWith("test");
  });
});
