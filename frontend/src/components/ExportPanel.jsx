import { useState } from 'react'
import { FileCode2, FileType2, Presentation, Image, CheckCircle, ArrowLeft, RotateCcw, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const FORMATS = [
  {
    id: 'html',
    icon: FileCode2,
    label: 'HTML',
    desc: 'Dashboard interativo standalone com gráficos Chart.js',
    accent: '#00D4FF',
    available: true,
  },
  {
    id: 'pptx',
    icon: Presentation,
    label: 'PowerPoint',
    desc: 'Apresentação .pptx editável, pronta para reuniões',
    accent: '#FF6B6B',
    available: true,
  },
  {
    id: 'pdf',
    icon: FileType2,
    label: 'PDF',
    desc: 'Documento PDF para compartilhamento e impressão',
    accent: '#FBBF24',
    available: true,
  },
]

export default function ExportPanel({ dashboard, onBack, onRestart }) {
  const [downloading, setDownloading] = useState(null)
  const [done, setDone]               = useState([])

  const handleExport = async (format) => {
    setDownloading(format)
    try {
      const response = await axios.post(
        '/api/export/',
        { dashboard, format },
        { responseType: 'blob' }
      )

      // Cria link de download
      const mimeMap = {
        html: 'text/html',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        pdf:  'application/pdf',
      }
      const extMap = { html: '.html', pptx: '.pptx', pdf: '.pdf' }
      const title = dashboard?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'dashboard'

      const blob = new Blob([response.data], { type: mimeMap[format] })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `${title}${extMap[format]}`
      link.click()
      URL.revokeObjectURL(url)

      setDone(prev => [...prev, format])
      toast.success(`${format.toUpperCase()} exportado com sucesso!`)
    } catch (e) {
      const errText = e.response?.data
        ? await new Response(e.response.data).text().catch(() => '')
        : ''
      let detail = 'Erro ao exportar.'
      try { detail = JSON.parse(errText).detail || detail } catch {}
      toast.error(detail)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-accent-green mb-4">
            <CheckCircle size={20} />
            <span className="font-syne font-bold text-sm">Projeto criado com sucesso!</span>
          </div>
          <h2 className="font-syne font-extrabold text-3xl mb-2">
            <span className="gradient-text">04.</span> Exportar
          </h2>
          <p className="text-white/45 text-base">
            Escolha o formato de exportação. Você pode baixar em vários formatos.
          </p>
        </div>

        {/* Dashboard preview badge */}
        <div className="glass rounded-2xl px-4 py-3 mb-6 flex items-center justify-between">
          <div>
            <div className="font-syne font-bold text-sm text-white/85">
              {dashboard?.title || 'Dashboard'}
            </div>
            <div className="text-xs text-white/35 mt-0.5">
              {dashboard?.sections?.length || 0} seções ·{' '}
              {dashboard?.sections?.reduce((acc, s) => acc + (s.charts?.length || 0), 0)} gráficos ·{' '}
              {dashboard?.sections?.reduce((acc, s) => acc + (s.big_numbers?.length || 0), 0)} métricas
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
        </div>

        {/* Format cards */}
        <div className="space-y-3 mb-8">
          {FORMATS.map(({ id, icon: Icon, label, desc, accent }) => {
            const isDone        = done.includes(id)
            const isDownloading = downloading === id

            return (
              <div
                key={id}
                className="glass rounded-2xl p-4 flex items-center justify-between gap-4
                  hover:border-white/15 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}>
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <div>
                    <div className="font-syne font-bold text-sm flex items-center gap-2">
                      {label}
                      {isDone && <CheckCircle size={13} className="text-accent-green" />}
                    </div>
                    <div className="text-xs text-white/35 mt-0.5 leading-snug">{desc}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleExport(id)}
                  disabled={isDownloading || !!downloading}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
                    text-white disabled:opacity-40 transition-all duration-200 whitespace-nowrap"
                  style={{
                    background: isDone
                      ? 'rgba(74,222,128,0.15)'
                      : `linear-gradient(135deg, ${accent}CC, ${accent}88)`,
                    border: isDone ? '1px solid rgba(74,222,128,0.3)' : 'none',
                    color: isDone ? '#4ADE80' : 'white',
                  }}
                >
                  {isDownloading ? (
                    <><Loader2 size={12} className="animate-spin" />Gerando...</>
                  ) : isDone ? (
                    <>✓ Baixado</>
                  ) : (
                    <>Baixar {label}</>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/45
              hover:text-white border border-white/08 hover:border-white/16 transition-all"
          >
            <ArrowLeft size={14} />
            Voltar ao dashboard
          </button>

          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/45
              hover:text-white border border-white/08 hover:border-white/16 transition-all"
          >
            <RotateCcw size={14} />
            Novo dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
