import { describe, it, expect, beforeEach } from "vitest";
import { useBookmarksStore } from "@/lib/stores/bookmarks-store";

describe("useBookmarksStore", () => {
  beforeEach(() => {
    useBookmarksStore.getState().clearAll();
  });

  it("can add and remove bookmarks", () => {
    const store = useBookmarksStore.getState();

    store.addBookmark({
      id: "cmd-1",
      type: "command",
      title: "nmap scan",
      category: "recon",
    });

    expect(useBookmarksStore.getState().bookmarks).toHaveLength(1);
    expect(useBookmarksStore.getState().bookmarks[0].id).toBe("cmd-1");
    expect(useBookmarksStore.getState().bookmarks[0].addedAt).toBeTruthy();

    store.removeBookmark("cmd-1");
    expect(useBookmarksStore.getState().bookmarks).toHaveLength(0);
  });

  it("isBookmarked returns correct state", () => {
    const store = useBookmarksStore.getState();

    expect(store.isBookmarked("cmd-1")).toBe(false);

    store.addBookmark({
      id: "cmd-1",
      type: "command",
      title: "nmap scan",
    });

    expect(useBookmarksStore.getState().isBookmarked("cmd-1")).toBe(true);
    expect(useBookmarksStore.getState().isBookmarked("cmd-2")).toBe(false);
  });

  it("getBookmarksByType filters correctly", () => {
    const store = useBookmarksStore.getState();

    store.addBookmark({ id: "cmd-1", type: "command", title: "nmap" });
    store.addBookmark({ id: "tool-1", type: "tool", title: "amass" });
    store.addBookmark({ id: "cmd-2", type: "command", title: "dig" });
    store.addBookmark({ id: "wf-1", type: "workflow", title: "recon flow" });

    const commands = useBookmarksStore.getState().getBookmarksByType("command");
    expect(commands).toHaveLength(2);
    expect(commands.map((b) => b.id)).toEqual(["cmd-1", "cmd-2"]);

    const tools = useBookmarksStore.getState().getBookmarksByType("tool");
    expect(tools).toHaveLength(1);

    const scenarios =
      useBookmarksStore.getState().getBookmarksByType("scenario");
    expect(scenarios).toHaveLength(0);
  });

  it("does not allow duplicate bookmarks", () => {
    const store = useBookmarksStore.getState();

    store.addBookmark({ id: "cmd-1", type: "command", title: "nmap" });
    store.addBookmark({ id: "cmd-1", type: "command", title: "nmap duplicate" });

    expect(useBookmarksStore.getState().bookmarks).toHaveLength(1);
    // Title should remain the original
    expect(useBookmarksStore.getState().bookmarks[0].title).toBe("nmap");
  });

  it("clearAll removes all bookmarks", () => {
    const store = useBookmarksStore.getState();

    store.addBookmark({ id: "cmd-1", type: "command", title: "nmap" });
    store.addBookmark({ id: "tool-1", type: "tool", title: "amass" });

    store.clearAll();
    expect(useBookmarksStore.getState().bookmarks).toHaveLength(0);
  });
});
