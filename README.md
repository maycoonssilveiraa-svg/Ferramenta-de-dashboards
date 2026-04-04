# DashCreator

Crie dashboards profissionais de publicidade com IA em segundos.

## 🚀 Deploy no GitHub Pages

Após subir o repositório:

1. No GitHub, vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Dê um `git push` — o site builda e vai ao ar automaticamente

O link ficará em: `https://SEU_USUARIO.github.io/NOME_DO_REPO/`

---

## Fluxo do app

1. **Home** — tela inicial com "CRIE SEU PROJETO"
2. **Upload** — xlsx, csv ou Google Sheets
3. **Agente** — descreva o dashboard em linguagem natural
4. **Dashboard** — gerado pela IA com gráficos e insights
5. **Exportar** — HTML interativo, JSON

## Stack

- **Frontend:** React + Vite + Recharts (100% no browser)
- **IA:** Claude API (Anthropic)
- **Backend:** Python FastAPI (opcional, para PDF/PPTX)

---

## Rodar localmente

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173
