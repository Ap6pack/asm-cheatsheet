import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { CodeBlock } from "./code-block";

interface MDXRendererProps {
  content: string;
}

function extractCodeBlocks(markdown: string): {
  segments: Array<{ type: "html"; html: string } | { type: "code"; language: string; code: string }>;
} {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const segments: Array<{ type: "html"; html: string } | { type: "code"; language: string; code: string }> = [];
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    // Text before this code block
    if (match.index > lastIndex) {
      segments.push({
        type: "html",
        html: markdown.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: "code",
      language: match[1] || "bash",
      code: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last code block
  if (lastIndex < markdown.length) {
    segments.push({
      type: "html",
      html: markdown.slice(lastIndex),
    });
  }

  return { segments };
}

async function markdownToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md);
  return String(result);
}

export async function MDXRenderer({ content }: MDXRendererProps) {
  const { segments } = extractCodeBlocks(content);

  const rendered = await Promise.all(
    segments.map(async (segment, index) => {
      if (segment.type === "code") {
        return (
          <CodeBlock
            key={`code-${index}`}
            code={segment.code}
            language={segment.language}
          />
        );
      }
      const html = await markdownToHtml(segment.html);
      return (
        <div
          key={`html-${index}`}
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    })
  );

  return <div className="space-y-4">{rendered}</div>;
}
