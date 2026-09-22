import { FileDown, ExternalLink } from 'lucide-react'
import SourceReferences from './SourceReferences.jsx'
import ResponseActions from './ResponseActions.jsx'

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://tnea-ai-eng.onrender.com' : 'http://localhost:8000')
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '')

function renderFormattedText(text) {
  if (!text) return null

  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    const label = match[1]
    let url = match[2]

    // Resolve relative backend export links to full API_BASE_URL
    if (url.startsWith('/export/') || url.startsWith('/')) {
      url = `${API_BASE_URL}${url}`
    }

    const isPdf = url.includes('.pdf') || label.toLowerCase().includes('pdf')

    if (isPdf) {
      parts.push(
        <span key={match.index} className="block my-2.5">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-3.5 py-1.5 font-sans text-xs font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-100 hover:border-blue-400 active:scale-95"
          >
            <FileDown className="h-4 w-4 text-blue-600" />
            <span>{label.replace(/^📥\s*/, '')}</span>
          </a>
        </span>
      )
    } else {
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-blue-600 underline hover:text-blue-800"
        >
          <span>{label}</span>
          <ExternalLink className="h-3 w-3 inline" />
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts
}

export default function MessageBubble({
  role,
  text,
  queryText,
  sources = [],
  onRegenerate,
}) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end py-2">
        <div className="max-w-[80%] sm:max-w-[65%]">
          <p className="mb-1 text-right font-mono text-[11px] text-ledger-ink/40">
            Query
          </p>

          <div className="border border-ledger-rule bg-white/70 px-4 py-2.5">
            <p className="font-serif text-[15px] leading-relaxed text-ledger-ink">
              {text}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start py-2">
      <div className="max-w-[80%] sm:max-w-[65%]">
        <p className="mb-1 font-mono text-[11px] text-ledger-brass">
          Entry
        </p>

        <div className="border-l-2 border-ledger-brass pl-4">
          <div className="font-serif text-[15px] leading-relaxed text-ledger-ink whitespace-pre-wrap">
            {renderFormattedText(text)}
          </div>

          <SourceReferences sources={sources} />

          <ResponseActions
            text={text}
            queryText={queryText}
            onRegenerate={onRegenerate}
          />
        </div>
      </div>
    </div>
  )
}