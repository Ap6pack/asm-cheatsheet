import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export async function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang: language,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  });

  return (
    <div className="group relative my-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-2">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          {language}
        </span>
        <CopyButton code={code} />
      </div>
      {/* Code content */}
      <div
        className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
