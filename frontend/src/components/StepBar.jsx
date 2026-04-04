import { Check } from 'lucide-react'

const STEPS = [
  { id: 'UPLOAD',     label: 'Dados' },
  { id: 'PROMPT',     label: 'Prompt' },
  { id: 'GENERATING', label: 'Gerando' },
  { id: 'DASHBOARD',  label: 'Dashboard' },
  { id: 'EXPORT',     label: 'Exportar' },
]

const ORDER = ['UPLOAD', 'PROMPT', 'GENERATING', 'DASHBOARD', 'EXPORT']

export default function StepBar({ currentStep }) {
  const currentIndex = ORDER.indexOf(currentStep)

  return (
    <div className="flex items-center justify-center gap-0 py-6 px-8 border-b border-white/5">
      {STEPS.map((step, i) => {
        const isDone    = i < currentIndex
        const isActive  = i === currentIndex
        const isPending = i > currentIndex

        return (
          <div key={step.id} className="flex items-center">
            {/* Connector */}
            {i > 0 && (
              <div
                className="h-px w-10 sm:w-16 transition-all duration-500"
                style={{
                  background: isDone
                    ? 'linear-gradient(90deg, #4ADE80, #00D4FF)'
                    : 'rgba(255,255,255,0.08)',
                }}
              />
            )}

            {/* Step */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-500
                  ${isDone
                    ? 'bg-accent-green/15 border border-accent-green/40 text-accent-green'
                    : isActive
                    ? 'text-white'
                    : 'bg-white/[0.04] border border-white/08 text-white/30'
                  }
                `}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
                  boxShadow: '0 0 16px rgba(0,212,255,0.35)',
                } : {}}
              >
                {isDone ? <Check size={14} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide hidden sm:block
                  ${isActive ? 'text-accent-cyan' : isDone ? 'text-accent-green' : 'text-white/25'}
                `}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
