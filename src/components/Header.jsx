import { useEffect, useState } from 'react'
import { Building2, Activity } from 'lucide-react'
import { checkHealth } from '../services/chatService.js'

export default function Header({ onOpenExplorer }) {
  const [serverState, setServerState] = useState({ checked: false, online: false, version: '' })

  useEffect(() => {
    let mounted = true

    const pollHealth = async () => {
      const res = await checkHealth()
      if (mounted) {
        setServerState({ checked: true, online: res.healthy, version: res.version || '' })
      }
    }

    pollHealth()
    const interval = setInterval(pollHealth, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <header className="border-b-2 border-ledger-ink bg-ledger-paper px-5 py-3.5 sm:px-8 sm:py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-lg font-semibold tracking-tight text-ledger-ink sm:text-xl">
              The College Register
            </h1>
            
            {/* Live Server Status Badge (GET /health) */}
            {serverState.checked && (
              <span
                title={serverState.online ? `API v${serverState.version} Online` : 'Server sleeping or waking up on Render'}
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                  serverState.online
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    serverState.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {serverState.online ? 'Online' : 'Waking Up'}
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate font-serif text-xs text-ledger-ink/70 sm:text-sm">
            Engineering admissions across Tamil Nadu, by district and by seat.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Explore Directory Button (GET /search_colleges) */}
          <button
            type="button"
            onClick={onOpenExplorer}
            className="flex items-center gap-1.5 rounded-lg border border-ledger-rule bg-white px-3 py-1.5 text-xs font-semibold text-ledger-ink shadow-sm transition hover:border-ledger-brass hover:text-ledger-brass"
          >
            <Building2 size={14} className="text-ledger-brass" />
            <span className="hidden sm:inline">Explore Directory</span>
            <span className="sm:hidden">Directory</span>
          </button>

          <span className="hidden shrink-0 font-mono text-xs text-ledger-brass md:block">
            Register No. TN-ENG
          </span>
        </div>

      </div>
    </header>
  )
}