import { useState, useRef } from 'react'
import { Send, Download, RotateCcw, MessageSquare, X, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import DashboardRenderer from './DashboardRenderer.jsx'

const QUICK_ACTIONS = [
  'Troque todos os gráficos de linha por barras',
  'Adicione mais insights detalhados',
  'Inclua uma seção de concorrência',
  'Deixe os títulos em inglês',
  'Adicione uma seção de recomendações estratégicas',
]

export default function DashboardPreview({ dashboard, conversationHistory, onRefinement, onExport, onRestart }) {
  const [chatOpen, setChatOpen]     = useState(false)
  const [refineText, setRefineText] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const chatRef = useRef(null)

  const handleRefine = async (text) => {
    const request = text || refineText.trim()
    if (!request) return

    setIsRefining(true)
    setRefineText('')

    try {
      const { data } = await axios.post('/api/generate/refine', {
        current_dashboard: dashboard,
        user_request: request,
        conversation_history: conversationHistory,
      })

      onRefinement(data.dashboard, data.conversation_history || conversationHistory)
      toast.success('Dashboard atualizado!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao refinar dashboard.')
    } finally {
      setIsRefining(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-88px)] flex flex-col">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/05 bg-bg/80 backdrop-blur-sm sticky top-[88px] z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs text-white/40 font-medium">Dashboard gerado</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatOpen(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all
              ${chatOpen
                ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25'
                : 'text-white/45 hover:text-white border border-transparent hover:border-white/10'
              }`}
          >
            <MessageSquare size={13} />
            Ajustar
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white
              transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)' }}
          >
            <Download size={13} />
            Exportar
          </button>

          <button
            onClick={onRestart}
            className="p-2 rounded-xl text-white/25 hover:text-white/60 border border-transparent
              hover:border-white/08 transition-all"
            title="Recomeçar"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Dashboard content */}
        <div className={`flex-1 overflow-y-auto px-6 py-8 transition-all duration-300 ${chatOpen ? 'pr-4' : ''}`}>
          <div className="max-w-5xl mx-auto">
            <DashboardRenderer dashboard={dashboard} />
          </div>
        </div>

        {/* Refinement panel */}
        {chatOpen && (
          <div className="w-80 flex-shrink-0 border-l border-white/08 flex flex-col bg-bg-card animate-fade-in">

            <div className="flex items-center justify-between px-4 py-3 border-b border-white/06">
              <span className="font-syne font-bold text-sm text-white/80">Ajustar dashboard</span>
              <button onClick={() => setChatOpen(false)} className="text-white/25 hover:text-white/60 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Quick actions */}
            <div className="px-4 py-3 border-b border-white/05">
              <p className="text-xs text-white/30 mb-2">Ações rápidas</p>
              <div className="space-y-1.5">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action}
                    onClick={() => handleRefine(action)}
                    disabled={isRefining}
                    className="w-full text-left text-xs text-white/45 hover:text-white/75 px-3 py-2
                      rounded-lg border border-white/06 hover:border-white/12 hover:bg-white/[0.02]
                      transition-all disabled:opacity-40 leading-snug"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Free-form input */}
            <div className="flex-1 flex flex-col p-4 gap-3">
              <p className="text-xs text-white/30">Ou descreva o que quer mudar</p>
              <textarea
                ref={chatRef}
                value={refineText}
                onChange={e => setRefineText(e.target.value)}
                placeholder="Ex: Troque o gráfico de barras por pizza, adicione o CTR como big number..."
                rows={5}
                className="flex-1 px-3 py-3 text-xs leading-relaxed resize-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleRefine()
                }}
              />
              <button
                onClick={() => handleRefine()}
                disabled={!refineText.trim() || isRefining}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                  text-xs font-bold text-white disabled:opacity-35 transition-all"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)' }}
              >
                {isRefining ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Ajustando...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Aplicar ajuste
                    <span className="text-white/40 font-normal">⌘↵</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
