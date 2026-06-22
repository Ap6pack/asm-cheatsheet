import { Pencil } from "lucide-react";

const GITHUB_EDIT_BASE =
  "https://github.com/Ap6pack/asm-cheatsheet/edit/main/content";

interface EditOnGitHubProps {
  /** Path of the source file relative to the content/ directory */
  contentPath: string;
}

export function EditOnGitHub({ contentPath }: EditOnGitHubProps) {
  return (
    <a
      href={`${GITHUB_EDIT_BASE}/${contentPath}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
    >
      <Pencil className="h-3.5 w-3.5" />
      Edit this page on GitHub
    </a>
  );
}
