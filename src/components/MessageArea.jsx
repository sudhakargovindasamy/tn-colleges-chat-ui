import MessageBubble from './MessageBubble.jsx'
import LoadingIndicator from './LoadingIndicator.jsx'
import StatusMessage from './StatusMessage.jsx'

const suggestedQuestions = [
  'Which colleges in Chennai offer Computer Science Engineering?',
  'List all autonomous colleges in Coimbatore with NAAC A grade',
  'What is the total intake for PSG College of Technology across all branches?',
]

export default function MessageArea({
  messages,
  onQuestionClick,
  onRegenerate,
  isLoading,
}) {
  const hasMessages = messages.length > 0

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-5 sm:px-8">
      {hasMessages ? (
        <div className="flex flex-col py-6">
          {messages.map((m, i) =>
            m.status === 'no-results' ? (
              <StatusMessage
                key={i}
                type="no-results"
                message={m.text}
              />
            ) : (
              <MessageBubble
                key={i}
                role={m.role}
                text={m.text}
                sources={m.sources}
                onRegenerate={() => onRegenerate(i)}
              />
            ),
          )}

          {isLoading && <LoadingIndicator />}
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center py-12 sm:py-16">
          <p className="font-serif text-2xl text-ledger-ink sm:text-3xl">
            TN Colleges Assistant
          </p>

          <p className="mt-3 font-serif text-base text-ledger-ink/60">
            Ask a question about Tamil Nadu engineering colleges.
          </p>

          <p className="mt-1 font-mono text-xs text-ledger-ink/40">
            Search by district, course, college type, intake and more.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onQuestionClick(question)}
                className="w-full rounded-lg border border-ledger-rule bg-white/50 px-4 py-3 text-left font-serif text-sm text-ledger-ink transition hover:border-ledger-brass hover:bg-white"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}