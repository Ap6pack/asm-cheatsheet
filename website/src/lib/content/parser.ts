import { unified } from 'unified';
import remarkParse from 'remark-parse';
import * as fs from 'fs';
import * as path from 'path';
import type { Root, Content, Heading, Code, Text, Link } from 'mdast';

/**
 * Parse a markdown file and return its AST
 */
export function parseMarkdownFile(filePath: string): Root {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  return parseMarkdownString(content);
}

/**
 * Parse a markdown string and return its AST
 */
export function parseMarkdownString(content: string): Root {
  const processor = unified().use(remarkParse);
  return processor.parse(content);
}

/**
 * Recursively extract text content from AST nodes
 */
export function extractTextContent(node: Content | Root): string {
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }
  if ('children' in node && Array.isArray(node.children)) {
    return (node.children as Content[]).map(extractTextContent).join('');
  }
  return '';
}

/**
 * Find all headings at a specific depth
 */
export function findHeadingsByDepth(tree: Root, depth: number): Heading[] {
  const headings: Heading[] = [];
  for (const node of tree.children) {
    if (node.type === 'heading' && node.depth === depth) {
      headings.push(node);
    }
  }
  return headings;
}

/**
 * Get all content nodes between one heading and the next of same/higher level.
 * Returns the raw AST nodes between the heading and the next heading of
 * equal or lesser depth.
 */
export function getSectionContent(
  tree: Root,
  heading: Heading
): Content[] {
  const children = tree.children;
  const startIndex = children.indexOf(heading);
  if (startIndex === -1) return [];

  const sectionNodes: Content[] = [];
  for (let i = startIndex + 1; i < children.length; i++) {
    const node = children[i];
    if (node.type === 'heading' && node.depth <= heading.depth) {
      break;
    }
    sectionNodes.push(node);
  }
  return sectionNodes;
}

/**
 * Extract code blocks from an array of AST nodes
 */
export function extractCodeBlocks(
  nodes: Content[]
): { language: string; code: string }[] {
  const codeBlocks: { language: string; code: string }[] = [];
  for (const node of nodes) {
    if (node.type === 'code') {
      codeBlocks.push({
        language: (node as Code).lang || '',
        code: (node as Code).value,
      });
    }
  }
  return codeBlocks;
}

/**
 * Get the raw markdown text for a section (between heading and next heading of same/higher depth).
 * This reconstructs a simplified markdown from the AST nodes.
 */
export function getSectionMarkdown(
  tree: Root,
  heading: Heading
): string {
  const nodes = getSectionContent(tree, heading);
  return nodesToMarkdown(nodes);
}

/**
 * Convert AST nodes back to a simplified markdown string
 */
export function nodesToMarkdown(nodes: Content[]): string {
  const parts: string[] = [];
  for (const node of nodes) {
    parts.push(nodeToMarkdown(node));
  }
  return parts.join('\n\n');
}

function nodeToMarkdown(node: Content): string {
  switch (node.type) {
    case 'heading': {
      const h = node as Heading;
      const prefix = '#'.repeat(h.depth);
      return `${prefix} ${extractTextContent(h)}`;
    }
    case 'paragraph':
      return extractTextContent(node);
    case 'code': {
      const c = node as Code;
      return `\`\`\`${c.lang || ''}\n${c.value}\n\`\`\``;
    }
    case 'list':
      if ('children' in node) {
        return (node.children as Content[])
          .map((li) => `- ${extractTextContent(li)}`)
          .join('\n');
      }
      return '';
    case 'thematicBreak':
      return '---';
    default:
      return extractTextContent(node);
  }
}

/**
 * Find sub-headings within a section (headings of greater depth within the section content).
 */
export function findSubHeadings(
  sectionContent: Content[],
  depth: number
): Heading[] {
  return sectionContent.filter(
    (node): node is Heading =>
      node.type === 'heading' && node.depth === depth
  );
}

/**
 * Get content between two indices in a content array, stopping at a heading
 * of the specified depth or lower.
 */
export function getSubSectionContent(
  nodes: Content[],
  startHeading: Heading
): Content[] {
  const startIndex = nodes.indexOf(startHeading);
  if (startIndex === -1) return [];

  const result: Content[] = [];
  for (let i = startIndex + 1; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'heading' && node.depth <= startHeading.depth) {
      break;
    }
    result.push(node);
  }
  return result;
}

/**
 * Extract links from AST nodes
 */
export function extractLinks(
  nodes: Content[]
): { title: string; url: string }[] {
  const links: { title: string; url: string }[] = [];

  function walk(node: Content | Root) {
    if (node.type === 'link') {
      const linkNode = node as Link;
      links.push({
        title: extractTextContent(linkNode),
        url: linkNode.url,
      });
    }
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children as Content[]) {
        walk(child);
      }
    }
  }

  for (const node of nodes) {
    walk(node);
  }
  return links;
}
