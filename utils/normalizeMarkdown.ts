import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";

/**
 * Normalize LLM-generated Markdown for react-markdown
 * - Converts 1) → 1.
 * - Ensures blank line before ordered lists
 * - Normalizes line endings
 */
export function normalizeMarkdown(input: string): string {
  if (!input) return "";

  // 1) Normalize line endings
  let text = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2) Convert 1) style to 1.
  text = text.replace(/^(\s*)(\d+)\)/gm, "$1$2.");

  // 3) Ensure a blank line before ordered lists
  text = text.replace(/([^\n])\n(\s*\d+\.)/g, "$1\n\n$2");

  // 4) Optionally, ensure blank line before bullets
  text = text.replace(/([^\n])\n(\s*[-*+]\s)/g, "$1\n\n$2");

  // Optional: pass through remark to clean up
  const processed = unified()
    .use(remarkParse)
    .use(remarkStringify, { bullet: "-", listItemIndent: "one" })
    .processSync(text)
    .toString();

  return processed;
}