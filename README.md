# DashCreator 🚀

> Gere dashboards profissionais a partir dos seus dados com o poder da IA.

DashCreator é uma plataforma web que permite criar dashboards e apresentações para o segmento de publicidade de forma automática. Conecte suas planilhas (xlsx/csv/Google Sheets), descreva o que quer ver e a IA gera o dashboard completo — pronto para exportar.

---

## ✨ Funcionalidades

- 📂 **Upload de dados** — xlsx, csv ou conexão direta com Google Sheets
- 🤖 **Agente de IA** — descreva seu dashboard em linguagem natural
- 📊 **Dashboards automáticos** — gráficos, big numbers e insights gerados pela IA
- 🔁 **Edição iterativa** — ajuste, troque gráficos e peça refinamentos
- 📤 **Exportação** — PNG, JPEG, PDF, HTML e PowerPoint

## 📦 Fontes de dados suportadas

- Google Analytics
- Meta Ads (Facebook/Instagram)
- Google Ads
- TikTok Ads
- Spotify Ads
- Ibope Monitor
- Qualquer planilha xlsx/csv

---

## 🏗️ Arquitetura

```
dashcreator/
├── backend/               # FastAPI (Python)
│   ├── main.py
│   ├── routes/
│   │   ├── upload.py      # Upload e parse de dados
│   │   ├── generate.py    # Agente de IA (Claude)
│   │   └── export.py      # Exportação
│   ├── services/
│   │   ├── data_processor.py
│   │   ├── ai_agent.py
│   │   └── exporter.py
│   └── requirements.txt
│
└── frontend/              # React + Vite + Tailwind
    └── src/
        ├── App.jsx
        └── components/
            ├── Landing.jsx
            ├── DataUpload.jsx
            ├── PromptInput.jsx
            ├── DashboardPreview.jsx
            └── ExportPanel.jsx
```

---

## 🚀 Como rodar

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- Chave de API Anthropic

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure variáveis de ambiente
cp ../.env.example .env
# Edite .env com sua ANTHROPIC_API_KEY

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🔑 Variáveis de ambiente

```env
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_SHEETS_API_KEY=         # Opcional
CORS_ORIGINS=http://localhost:5173
```

---

## 📤 Deploy (GitHub + Railway/Vercel)

```bash
# Backend → Railway
railway login
railway init
railway up

# Frontend → Vercel
vercel --prod
```

---

## 🎨 Frentes de análise

1. **Concorrência** — compare share of voice, investimento e presença de mercado
2. **Campanhas online** — performance digital (CTR, CPC, ROAS, conversões)
3. **Campanhas offline** — GRP, reach, cobertura (Ibope)
4. **Drops** — análise de lançamentos e picos de performance

---

Desenvolvido com ❤️ e Claude AI.
