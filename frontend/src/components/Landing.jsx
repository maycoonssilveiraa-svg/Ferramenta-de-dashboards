import { ArrowRight, BarChart2, Cpu, Zap, FileSpreadsheet, Download } from 'lucide-react'

const FEATURES = [
  { icon: FileSpreadsheet, label: 'Conecte sua planilha',  desc: 'xlsx, csv ou Google Sheets' },
  { icon: Cpu,             label: 'Descreva o dashboard',  desc: 'Em linguagem natural' },
  { icon: BarChart2,       label: 'IA gera tudo',          desc: 'Gráficos, métricas, insights' },
  { icon: Download,        label: 'Exporte',               desc: 'PNG, PDF, HTML, PPTX' },
]

const SOURCES = ['Google Ads', 'Meta Ads', 'TikTok Ads', 'Spotify Ads', 'Google Analytics', 'Ibope Monitor']

export default function Landing({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="font-syne font-extrabold text-xl gradient-text tracking-tight">
          DashCreator
        </span>
        <button
          onClick={onStart}
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Começar →
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-24">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8
          border border-accent-cyan/20 bg-accent-cyan/5 text-accent-cyan text-xs font-medium
          animate-fade-in">
          <Zap size={12} fill="currentColor" />
          Powered by Claude AI (Anthropic)
        </div>

        {/* Headline */}
        <h1 className="font-syne font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-6
          animate-slide-up max-w-4xl">
          Crie dashboards{' '}
          <span className="gradient-text">profissionais</span>
          {' '}com IA
        </h1>

        <p className="text-white/50 text-lg sm:text-xl max-w-xl mb-10 animate-slide-up leading-relaxed"
          style={{ animationDelay: '0.1s' }}>
          Conecte seus dados de publicidade, descreva o que quer ver
          e a IA gera o dashboard completo — em segundos.
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="btn-glow group flex items-center gap-3 px-8 py-4 rounded-2xl font-syne font-bold
            text-base tracking-wide text-white transition-all duration-300 animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
            animationDelay: '0.2s',
          }}
        >
          Criar meu Dashboard
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-4 text-white/20 text-xs animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Gratuito para testar · Sem cadastro
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl w-full
          animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className="glass rounded-2xl p-5 text-left hover:border-white/15 transition-all duration-300
                hover:-translate-y-1"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <Icon size={16} className="text-accent-cyan" />
              </div>
              <div className="font-syne font-bold text-sm text-white/90 mb-1">{label}</div>
              <div className="text-xs text-white/35">{desc}</div>
            </div>
          ))}
        </div>

        {/* Sources strip */}
        <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-xs text-white/25 mb-4 uppercase tracking-widest">
            Fontes de dados suportadas
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SOURCES.map(src => (
              <span key={src}
                className="px-3 py-1 rounded-full text-xs text-white/40 border border-white/08 bg-white/[0.02]">
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
