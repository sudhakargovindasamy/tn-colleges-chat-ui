import { useState } from 'react'
import { X, Search, Building2, MapPin, Award, ArrowRight, Loader2 } from 'lucide-react'
import { searchColleges } from '../services/chatService.js'

const DISTRICTS = [
  'All Districts',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Kancheepuram',
  'Chengalpattu',
  'Thiruvallur',
  'Erode',
  'Vellore',
  'Thanjavur',
  'Kanyakumari',
  'Dindigul',
  'Namakkal',
  'Virudhunagar',
  'Ramanathapuram',
  'Cuddalore',
  'Sivagangai',
  'Dharmapuri',
  'Krishnagiri',
  'Villupuram',
]

const POPULAR_BRANCHES = [
  { label: 'All Courses', code: '' },
  { label: 'Marine Engineering (MR)', code: 'MR' },
  { label: 'Computer Science (CSE / CS)', code: 'CS' },
  { label: 'Artificial Intelligence & Data Science (AD)', code: 'AD' },
  { label: 'AI & Machine Learning (AL)', code: 'AL' },
  { label: 'Information Technology (IT)', code: 'IT' },
  { label: 'Electronics & Communication (EC)', code: 'EC' },
  { label: 'Electrical & Electronics (EE)', code: 'EE' },
  { label: 'Mechanical Engineering (ME)', code: 'ME' },
  { label: 'Civil Engineering (CE)', code: 'CE' },
  { label: 'Aerospace Engineering (AO)', code: 'AO' },
  { label: 'Robotics & Automation (RM)', code: 'RM' },
  { label: 'Biomedical Engineering (BM)', code: 'BM' },
  { label: 'Chemical Engineering (CH)', code: 'CH' },
  { label: 'Food Technology (FD)', code: 'FD' },
]

export default function CollegeExplorerModal({ isOpen, onClose, onSelectCollege }) {
  const [district, setDistrict] = useState('All Districts')
  const [branchCode, setBranchCode] = useState('')
  const [autonomousOnly, setAutonomousOnly] = useState(false)
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setHasSearched(true)

    try {
      const data = await searchColleges({
        district: district === 'All Districts' ? null : district,
        branch_code: branchCode || null,
        autonomous: autonomousOnly ? true : null,
        limit: 20,
      })
      setResults(data.results || [])
    } finally {
      setLoading(false)
    }
  }

  const handleCollegeClick = (college) => {
    if (onSelectCollege) {
      const name = college.college_name || 'this college'
      onSelectCollege(`Tell me about ${name} (TNEA Code: ${college.tnea_code})`)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border-2 border-ledger-ink bg-ledger-paper shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ledger-rule px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Building2 className="text-ledger-brass" size={22} />
            <div>
              <h2 className="font-serif text-lg font-bold text-ledger-ink">
                TNEA College Directory Explorer
              </h2>
              <p className="text-xs text-ledger-ink/60">
                Direct catalog search powered by <code>/search_colleges</code> endpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ledger-ink/60 transition hover:bg-black/5 hover:text-ledger-ink"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 border-b border-ledger-rule bg-white/60 p-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ledger-ink/70">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-md border border-ledger-rule bg-white px-2.5 py-1.5 text-sm text-ledger-ink focus:border-ledger-brass focus:outline-none"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ledger-ink/70">Department / Course</label>
            <select
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="w-full rounded-md border border-ledger-rule bg-white px-2.5 py-1.5 text-sm text-ledger-ink focus:border-ledger-brass focus:outline-none"
            >
              {POPULAR_BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-ledger-rule bg-white px-3 text-xs font-medium text-ledger-ink">
              <input
                type="checkbox"
                checked={autonomousOnly}
                onChange={(e) => setAutonomousOnly(e.target.checked)}
                className="rounded text-ledger-brass focus:ring-0"
              />
              Autonomous
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-ledger-ink px-4 text-xs font-semibold text-white transition hover:bg-ledger-ink/90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              Search
            </button>
          </div>
        </form>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-ledger-ink/60">
              <Building2 size={40} className="mb-3 opacity-40" />
              <p className="font-serif text-sm">Select a district or course filter above and click Search.</p>
              <p className="mt-1 text-xs">Instantly filters across all 418 official TNEA institutions.</p>
            </div>
          )}

          {hasSearched && !loading && results.length === 0 && (
            <div className="py-10 text-center text-ledger-ink/60">
              <p className="font-serif text-sm">No colleges matched these exact filters.</p>
              <p className="mt-1 text-xs">Try selecting 'All Districts' or another department.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-ledger-ink/60">
                <span>Found {results.length} colleges</span>
                <span>Click any card to ask counselor</span>
              </div>

              {results.map((col, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCollegeClick(col)}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-ledger-rule bg-white p-3.5 transition hover:border-ledger-brass hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ledger-brass">
                        TNEA #{col.tnea_code}
                      </span>
                      {col.autonomous && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          <Award size={11} />
                          Autonomous
                        </span>
                      )}
                    </div>
                    <h4 className="mt-0.5 truncate text-sm font-semibold text-ledger-ink group-hover:text-ledger-brass">
                      {col.college_name}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ledger-ink/60">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {col.district || 'Tamil Nadu'}
                      </span>
                      {col.total_intake && (
                        <span>Intake: {col.total_intake} seats</span>
                      )}
                    </div>
                  </div>

                  <ArrowRight size={16} className="text-ledger-ink/30 transition group-hover:translate-x-1 group-hover:text-ledger-brass" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

