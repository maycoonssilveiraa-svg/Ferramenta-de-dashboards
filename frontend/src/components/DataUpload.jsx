import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Link2, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, SkipForward, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const TAB = { FILE: 'file', SHEETS: 'sheets' }

export default function DataUpload({ onDataReady, onSkip }) {
  const [tab, setTab]             = useState(TAB.FILE)
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [status, setStatus]       = useState('idle')   // idle | uploading | success | error
  const [summary, setSummary]     = useState(null)
  const [error, setError]         = useState('')

  // ── Dropzone ──
  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return
    const file = accepted[0]
    setStatus('uploading')
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await axios.post('/api/upload/file', formData)
      setSummary(data.summary)
      setStatus('success')
      toast.success(`"${file.name}" carregado com sucesso!`)
    } catch (e) {
      setStatus('error')
      setError(e.response?.data?.detail || 'Erro ao processar arquivo.')
      toast.error('Falha no upload.')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: status === 'uploading',
  })

  // ── Google Sheets ──
  const handleSheets = async () => {
    if (!sheetsUrl.trim()) return
    setStatus('uploading')
    setError('')
    try {
      const { data } = await axios.post('/api/upload/sheets', { url: sheetsUrl })
      setSummary(data.summary)
      setStatus('success')
      toast.success('Google Sheets conectado!')
    } catch (e) {
      setStatus('error')
      setError(e.response?.data?.detail || 'Erro ao conectar com o Sheets.')
      toast.error('Falha na conexão.')
    }
  }

  const reset = () => { setStatus('idle'); setSummary(null); setError('') }

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <h2 className="font-syne font-extrabold text-3xl mb-2">
            <span className="gradient-text">01.</span> Conecte seus dados
          </h2>
          <p className="text-white/45 text-base">
            Faça upload de uma planilha ou conecte ao Google Sheets.
            Pode pular se quiser usar dados de exemplo.
          </p>
        </div>

        {/* Success state */}
        {status === 'success' && summary ? (
          <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-accent-green flex-shrink-0" />
                <div>
                  <div className="font-syne font-bold text-sm">{summary.source}</div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {summary.rows} linhas · {summary.columns?.length} colunas
                  </div>
                </div>
              </div>
              <button onClick={reset} className="text-white/25 hover:text-white/60 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Columns preview */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {summary.columns?.slice(0, 12).map(col => (
                <span key={col.name}
                  className="px-2.5 py-1 rounded-lg text-xs border border-white/08 text-white/50 bg-white/[0.02]">
                  {col.name}
                  <span className="ml-1 text-white/25">{col.type?.includes('int') || col.type?.includes('float') ? '#' : 'T'}</span>
                </span>
              ))}
              {summary.columns?.length > 12 && (
                <span className="px-2.5 py-1 rounded-lg text-xs text-white/25">
                  +{summary.columns.length - 12} mais
                </span>
              )}
            </div>

            <button
              onClick={() => onDataReady(summary)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-syne font-bold text-sm
                text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)' }}
            >
              Continuar com estes dados
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/08 mb-5">
              {[
                { id: TAB.FILE, label: 'Upload arquivo', icon: Upload },
                { id: TAB.SHEETS, label: 'Google Sheets', icon: Link2 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); reset() }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${tab === id ? 'bg-white/08 text-white' : 'text-white/35 hover:text-white/60'}`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* File drop */}
            {tab === TAB.FILE && (
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                  transition-all duration-300
                  ${isDragActive
                    ? 'border-accent-cyan bg-accent-cyan/5 scale-[1.01]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'
                  }
                  ${status === 'uploading' ? 'opacity-60 cursor-wait pointer-events-none' : ''}
                `}
              >
                <input {...getInputProps()} />
                <FileSpreadsheet size={36} className="mx-auto mb-4 text-white/25" />
                <p className="font-syne font-bold text-base mb-1 text-white/80">
                  {isDragActive ? 'Solte aqui!' : 'Arraste sua planilha'}
                </p>
                <p className="text-white/35 text-sm mb-4">ou clique para selecionar</p>
                <span className="px-3 py-1 rounded-full text-xs border border-white/08 text-white/30">
                  .xlsx · .xls · .csv · até 50MB
                </span>

                {status === 'uploading' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-bg/60 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-accent-cyan">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium text-sm">Processando...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sheets URL */}
            {tab === TAB.SHEETS && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-2 ml-1 uppercase tracking-wider">
                    URL do Google Sheets
                  </label>
                  <input
                    type="url"
                    value={sheetsUrl}
                    onChange={e => setSheetsUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-4 py-3 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleSheets()}
                  />
                  <p className="text-xs text-white/25 mt-2 ml-1">
                    A planilha precisa estar compartilhada como "Qualquer pessoa com o link pode visualizar"
                  </p>
                </div>
                <button
                  onClick={handleSheets}
                  disabled={!sheetsUrl.trim() || status === 'uploading'}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-syne font-bold
                    text-sm text-white disabled:opacity-40 transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)' }}
                >
                  {status === 'uploading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Link2 size={15} />
                      Conectar Sheets
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl
                bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={15} />
                {error}
              </div>
            )}
          </>
        )}

        {/* Skip */}
        {status !== 'success' && (
          <button
            onClick={onSkip}
            className="flex items-center gap-2 mx-auto mt-6 text-white/30 hover:text-white/60
              transition-colors text-sm"
          >
            <SkipForward size={14} />
            Pular — usar dados de exemplo
          </button>
        )}
      </div>
    </div>
  )
}
