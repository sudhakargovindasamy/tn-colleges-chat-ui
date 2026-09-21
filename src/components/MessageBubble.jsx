import SourceReferences from './SourceReferences.jsx'
import ResponseActions from './ResponseActions.jsx'

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
            {text}
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