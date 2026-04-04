import { useState } from 'react'
import Landing from './components/Landing.jsx'
import DataUpload from './components/DataUpload.jsx'
import PromptInput from './components/PromptInput.jsx'
import DashboardPreview from './components/DashboardPreview.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import StepBar from './components/StepBar.jsx'

// Fluxo do app:
// LANDING → UPLOAD → PROMPT → GENERATING → DASHBOARD → EXPORT

export default function App() {
  const [step, setStep] = useState('LANDING')
  const [dataSummary, setDataSummary] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])

  const goTo = (s) => setStep(s)

  // Handlers
  const handleDataReady = (summary) => {
    setDataSummary(summary)
    setStep('PROMPT')
  }

  const handleDashboardReady = (dash, history) => {
    setDashboard(dash)
    setConversationHistory(history)
    setStep('DASHBOARD')
  }

  const handleRefinement = (dash, history) => {
    setDashboard(dash)
    setConversationHistory(history)
  }

  const handleExport = () => setStep('EXPORT')
  const handleRestart = () => {
    setStep('LANDING')
    setDataSummary(null)
    setDashboard(null)
    setConversationHistory([])
  }

  const showStepBar = ['UPLOAD', 'PROMPT', 'GENERATING', 'DASHBOARD', 'EXPORT'].includes(step)

  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />

      <div className="relative z-10">
        {showStepBar && (
          <StepBar currentStep={step} />
        )}

        {step === 'LANDING' && (
          <Landing onStart={() => setStep('UPLOAD')} />
        )}

        {step === 'UPLOAD' && (
          <DataUpload
            onDataReady={handleDataReady}
            onSkip={() => setStep('PROMPT')}
          />
        )}

        {(step === 'PROMPT' || step === 'GENERATING') && (
          <PromptInput
            dataSummary={dataSummary}
            conversationHistory={conversationHistory}
            isGenerating={step === 'GENERATING'}
            onGenerating={() => setStep('GENERATING')}
            onDashboardReady={handleDashboardReady}
          />
        )}

        {step === 'DASHBOARD' && (
          <DashboardPreview
            dashboard={dashboard}
            conversationHistory={conversationHistory}
            onRefinement={handleRefinement}
            onExport={handleExport}
            onRestart={handleRestart}
          />
        )}

        {step === 'EXPORT' && (
          <ExportPanel
            dashboard={dashboard}
            onBack={() => setStep('DASHBOARD')}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  )
}
