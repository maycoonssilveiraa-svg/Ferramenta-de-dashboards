# DashCreator

Crie dashboards profissionais de publicidade com IA em segundos.

## Fluxo do app

1. **Home** — tela inicial com "CRIE SEU PROJETO"
2. **Upload** — xlsx, csv ou Google Sheets
3. **Agente** — descreva o dashboard em linguagem natural
4. **Dashboard** — gerado pela IA com gráficos e insights
5. **Exportar** — HTML interativo, JSON, PDF, PowerPoint

## Stack

- **Frontend:** React + Vite + Recharts
- **Backend:** Python FastAPI
- **IA:** Claude (Anthropic)

## Como rodar localmente

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- Chave de API Anthropic → https://console.anthropic.com

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env e coloque sua ANTHROPIC_API_KEY
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

### Com Docker

```bash
docker-compose up --build
```

Acesse: http://localhost:3000

## Fontes de dados suportadas

- Google Analytics
- Meta Ads (Facebook/Instagram)
- Google Ads
- TikTok Ads
- Spotify Ads
- Ibope Monitor
- Qualquer planilha xlsx/csv

## Frentes de análise

- **Concorrência** — share of voice, investimento, presença
- **Campanhas online** — CTR, CPC, ROAS, conversões
- **Campanhas offline** — GRP, reach, cobertura (Ibope)
- **Drops** — lançamentos e picos de performance
