import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const EXAMPLES = [
  {
    label: 'Performance de campanhas',
    prompt: 'Crie um dashboard para análise de performance de campanhas de marketing digital da empresa JOVI.\nUtilize informações extraídas das ferramentas de advertising (Google Ads, Meta Ads, TikTok Ads).\nPrecisamos ter as seguintes telas:\n• Gerencial: Overview geral com os big numbers principais como: impressões, cliques, investimento, conversões e ROAS. Comparativo mês anterior.\n• Awareness: foco em alcance, frequência, CPM e share of voice.',
  },
  {
    label: 'Análise de concorrência',
    prompt: 'Monte um dashboard de análise de concorrência no segmento de telecomunicações.\nComparando as marcas: Marca A, Marca B e Marca C.\nMétricas: share of voice, investimento estimado em mídia, presença digital, engajamento em redes sociais.',
  },
  {
    label: 'Drops e lançamentos',
    prompt: 'Crie um dashboard de análise de drops (lançamentos) da marca para o último trimestre.\nQuero ver: pico de buscas, performance antes/durante/depois do drop, vendas correlacionadas com mídia paga, canais mais eficientes por drop.',
  },
  {
    label: 'Campanhas offline (Ibope)',
    prompt: 'Dashboard de campanhas offline com dados de Ibope Monitor.\nMétricas: GRP total, reach, frequência média, cobertura acumulada por veículo (TV aberta, TV por assinatura, rádio), investimento vs. GRP.',
  },
]

export default function PromptInput({ dataSummary, conversationHistory, isGenerating, onGenerating, onDashboardReady }) {
  const [prompt, setPrompt]           = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const charLimit = 2000

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      toast.error('Descreva melhor o dashboard que deseja.')
      return
    }
    onGenerating()

    try {
      const { data } = await axios.post('/api/generate/', {
        prompt: prompt.trim(),
        data_summary: dataSummary || null,
        conversation_history: conversationHistory || [],
      })

      const newHistory = [
        ...(conversationHistory || []),
        { role: 'user', content: prompt.trim() },
        { role: 'assistant', content: data.assistant_message },
      ]

      onDashboardReady(data.dashboard, newHistory)
      toast.success('Dashboard gerado com sucesso!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao gerar dashboard.')
      // Volta pro estado de prompt
      onGenerating()  // chama novamente para reverter — App.jsx trata isso
    }
  }

  if (isGenerating) {
    return <GeneratingScreen />
  }

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <h2 className="font-syne font-extrabold text-3xl mb-2">
            <span className="gradient-text">02.</span> Descreva seu dashboard
          </h2>
          <p className="text-white/45 text-base">
            Fale com a IA como se fosse um briefing. Quanto mais detalhes, melhor o resultado.
          </p>
          {dataSummary && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg
              bg-accent-green/8 border border-accent-green/20 text-accent-green text-xs">
              ✓ Dados carregados: {dataSummary.source} · {dataSummary.rows} linhas
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className="relative mb-4">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value.slice(0, charLimit))}
            placeholder={`Ex: Crie um dashboard de performance para a empresa ACME, com dados do Google Ads e Meta Ads.\n\nQuero ver:\n• Visão gerencial com impressões, cliques, ROAS e investimento\n• Análise por canal (Google vs. Meta)\n• Evolução semanal das métricas`}
            rows={10}
            className="w-full px-5 py-4 text-sm leading-relaxed resize-none"
            style={{ minHeight: 220 }}
          />
          <div className="absolute bottom-3 right-4 text-xs text-white/20 font-mono">
            {prompt.length}/{charLimit}
          </div>
        </div>

        {/* Examples */}
        <div className="mb-6">
          <button
            onClick={() => setShowExamples(v => !v)}
            className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors"
          >
            {showExamples ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Ver exemplos de prompt
          </button>

          {showExamples && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
              {EXAMPLES.map(ex => (
                <button
                  key={ex.label}
                  onClick={() => { setPrompt(ex.prompt); setShowExamples(false) }}
                  className="text-left px-4 py-3 rounded-xl border border-white/08 bg-white/[0.02]
                    hover:border-accent-cyan/25 hover:bg-accent-cyan/5 transition-all duration-200
                    text-xs text-white/50 hover:text-white/80"
                >
                  <span className="block font-syne font-bold text-white/70 mb-1">{ex.label}</span>
                  <span className="line-clamp-2 leading-relaxed">{ex.prompt.slice(0, 90)}...</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || prompt.trim().length < 10}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl
            font-syne font-bold text-base text-white disabled:opacity-35
            transition-all duration-300 btn-glow"
          style={{ background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)' }}
        >
          <Sparkles size={18} />
          Gerar Dashboard com IA
        </button>
      </div>
    </div>
  )
}

function GeneratingScreen() {
  const steps = [
    'Interpretando seu briefing...',
    'Analisando os dados disponíveis...',
    'Estruturando seções e métricas...',
    'Criando gráficos e big numbers...',
    'Gerando insights automáticos...',
    'Finalizando o dashboard...',
  ]
  const [currentStep] = useState(() => Math.floor(Math.random() * steps.length))

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center">
      <div className="text-center">
        {/* Animated orb */}
        <div className="relative mx-auto mb-10 w-24 h-24">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(0,212,255,0.15)' }}
          />
          <div
            className="absolute inset-2 rounded-full animate-ping"
            style={{ background: 'rgba(123,47,255,0.2)', animationDelay: '0.3s' }}
          />
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00D4FF22, #7B2FFF33)', border: '1px solid rgba(0,212,255,0.3)' }}
          >
            <Sparkles size={28} className="text-accent-cyan" />
          </div>
        </div>

        <h3 className="font-syne font-extrabold text-2xl mb-3 gradient-text">
          Gerando seu dashboard
        </h3>
        <p className="text-white/40 text-sm mb-8">{steps[currentStep]}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
