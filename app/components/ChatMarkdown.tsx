import { Fragment, type ReactNode } from 'react'

/**
 * Minimal Markdown renderer for assistant chat replies.
 * Supports headings, bullet/numbered lists, paragraphs, **bold**, *italic*,
 * `code` and [links](https://…). Builds React nodes directly (no innerHTML),
 * so model output can never inject markup. Unclosed markers while streaming
 * simply render as plain text until the closing marker arrives.
 */

const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\s][^*\n]*\*|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`
    if (!part) return null
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={key} className="font-semibold">{renderInline(part.slice(2, -2), key)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={key} className="px-1 py-0.5 rounded bg-ink/5 text-[0.9em]">{part.slice(1, -1)}</code>
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/)
    if (link) {
      return (
        <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">
          {link[1]}
        </a>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{renderInline(part.slice(1, -1), key)}</em>
    }
    return <Fragment key={key}>{part}</Fragment>
  })
}

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'para'; lines: string[] }
  | { kind: 'ul' | 'ol'; items: string[] }

const BULLET = /^\s*[-*•]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/
const HEADING = /^\s*#{1,6}\s+(.*)$/
// A line that is only bold text, e.g. "**Official requirement**", acts as a heading.
const BOLD_LINE = /^\s*\*\*([^*]+)\*\*:?\s*$/

function parseBlocks(src: string): Block[] {
  const blocks: Block[] = []
  const last = () => blocks[blocks.length - 1]

  for (const raw of src.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd()
    if (!line.trim() || /^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ kind: 'para', lines: [] }) // paragraph break
      continue
    }
    const h = line.match(HEADING) ?? line.match(BOLD_LINE)
    if (h) { blocks.push({ kind: 'heading', text: h[1] }); continue }

    const ul = line.match(BULLET)
    const ol = !ul && line.match(NUMBERED)
    const item = ul ?? ol
    if (item) {
      const kind = ul ? 'ul' : 'ol'
      const prev = last()
      if (prev && prev.kind === kind) prev.items.push(item[1])
      else blocks.push({ kind, items: [item[1]] })
      continue
    }

    const prev = last()
    // Indented continuation of a list item
    if (prev && (prev.kind === 'ul' || prev.kind === 'ol') && /^\s{2,}/.test(raw)) {
      prev.items[prev.items.length - 1] += ' ' + line.trim()
    } else if (prev && prev.kind === 'para') {
      prev.lines.push(line)
    } else {
      blocks.push({ kind: 'para', lines: [line] })
    }
  }
  return blocks.filter(b => b.kind !== 'para' || b.lines.length > 0)
}

export default function ChatMarkdown({ text }: { text: string }) {
  const blocks = parseBlocks(text)
  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) => {
        const k = `b${i}`
        if (b.kind === 'heading') {
          return <p key={k} className="font-semibold text-ink pt-1 first:pt-0">{renderInline(b.text, k)}</p>
        }
        if (b.kind !== 'para') {
          const List = b.kind === 'ul' ? 'ul' : 'ol'
          return (
            <List key={k} className={`pl-5 space-y-1 ${b.kind === 'ul' ? 'list-disc' : 'list-decimal'} marker:text-ink-3`}>
              {b.items.map((it, j) => <li key={j}>{renderInline(it, `${k}-${j}`)}</li>)}
            </List>
          )
        }
        return (
          <p key={k}>
            {b.lines.map((l, j) => (
              <Fragment key={j}>{j > 0 && <br />}{renderInline(l, `${k}-${j}`)}</Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
