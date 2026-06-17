/**
 * Strip emojis and variation selectors from a string.
 * ClearAid keeps a clean, professional look, so emojis are removed both
 * server-side and again here as a defensive client-side pass.
 */
const EMOJI =
  /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}]/gu;

export function stripEmoji(input: string): string {
  return input.replace(EMOJI, "").replace(/[ \t]{2,}/g, " ");
}

/**
 * Convert Markdown to readable plain text for text-to-speech / clipboard.
 * Removes formatting markers (headings, emphasis, list bullets, links, code)
 * while keeping the words and sentence flow intact.
 */
export function markdownToPlainText(md: string): string {
  return stripEmoji(md)
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/^\s*[-*+]\s+/gm, "") // bullet markers
    .replace(/^\s*\d+\.\s+/gm, "") // numbered markers
    .replace(/^\s*>\s?/gm, "") // blockquotes
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italics
    .replace(/^\s*([-*_]\s*){3,}$/gm, " ") // horizontal rules
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
