import { describe, it, expect } from 'vitest';
import {
  parseMarkdownString,
  extractTextContent,
  findHeadingsByDepth,
  getSectionContent,
  extractCodeBlocks,
  extractLinks,
} from '../../lib/content/parser';

describe('Markdown Parser', () => {
  const sampleMarkdown = `# Title

Some intro text.

## Section One

Content of section one with **bold** text.

### Subsection

More content here.

\`\`\`bash
echo "hello"
\`\`\`

## Section Two

- [Link One](https://example.com)
- [Link Two](https://example.org)

\`\`\`python
print("world")
\`\`\`
`;

  it('should parse markdown into AST', () => {
    const tree = parseMarkdownString(sampleMarkdown);
    expect(tree.type).toBe('root');
    expect(tree.children.length).toBeGreaterThan(0);
  });

  it('should extract text content from nodes', () => {
    const tree = parseMarkdownString(sampleMarkdown);
    const h1 = tree.children[0];
    expect(extractTextContent(h1)).toBe('Title');
  });

  it('should find headings by depth', () => {
    const tree = parseMarkdownString(sampleMarkdown);
    const h2s = findHeadingsByDepth(tree, 2);
    expect(h2s).toHaveLength(2);
    expect(extractTextContent(h2s[0])).toBe('Section One');
    expect(extractTextContent(h2s[1])).toBe('Section Two');
  });

  it('should get section content between headings', () => {
    const tree = parseMarkdownString(sampleMarkdown);
    const h2s = findHeadingsByDepth(tree, 2);
    const section1Content = getSectionContent(tree, h2s[0]);
    expect(section1Content.length).toBeGreaterThan(0);

    // Section 1 should not contain Section 2 content
    const textContent = section1Content
      .map(extractTextContent)
      .join(' ');
    expect(textContent).not.toContain('Link One');
  });

  it('should extract code blocks', () => {
    const tree = parseMarkdownString(sampleMarkdown);
    const h2s = findHeadingsByDepth(tree, 2);
    const section2Content = getSectionContent(tree, h2s[1]);
    const codeBlocks = extractCodeBlocks(section2Content);
    expect(codeBlocks).toHaveLength(1);
    expect(codeBlocks[0].language).toBe('python');
    expect(codeBlocks[0].code).toContain('print');
  });

  it('should extract links from nodes', () => {
    const tree = parseMarkdownString(sampleMarkdown);
    const h2s = findHeadingsByDepth(tree, 2);
    const section2Content = getSectionContent(tree, h2s[1]);
    const links = extractLinks(section2Content);
    expect(links).toHaveLength(2);
    expect(links[0].title).toBe('Link One');
    expect(links[0].url).toBe('https://example.com');
  });
});
