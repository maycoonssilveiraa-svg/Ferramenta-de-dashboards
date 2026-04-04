import { useState, useCallback, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

const PALETTE = ["#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#BE185D","#65A30D"];

// ─── Anthropic API call ───────────────────────────────────────────────────────
async function callClaude(prompt, dataContext) {
  const systemPrompt = `Você é o DashCreator AI. Recebe um briefing de dashboard de publicidade/marketing e retorna APENAS JSON válido (sem markdown, sem texto extra) com esta estrutura:
{
  "title": "string",
  "brand": "string",
  "period": "string",
  "sections": [
    {
      "id": "string",
      "name": "string",
      "big_numbers": [
        {"label":"string","value":"string","change":"string","direction":"up|down|neutral","color":"blue|green|red|orange|purple"}
      ],
      "charts": [
        {
          "type": "bar|line|area|pie|donut",
          "title": "string",
          "data": [{"name":"string","valor":number,"valor2":number}],
          "colors": ["#hex"]
        }
      ],
      "insights": ["string"]
    }
  ]
}
Gere dados realistas e coerentes com publicidade/marketing. Retorne APENAS o JSON.`;

  const userMsg = dataContext
    ? `Dados disponíveis:\n${dataContext}\n\nPedido: ${prompt}`
    : prompt;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  const data = await res.json();
  let text = data.content?.[0]?.text || "";
  if (text.startsWith("```")) text = text.split("\n").slice(1, -1).join("\n");
  return JSON.parse(text);
}

// ─── TELA 1 — Home ────────────────────────────────────────────────────────────
function ScreenHome({ onStart }) {
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", textAlign:"center",
      padding:"2rem", background:"#f8f9fa"
    }}>
      <div style={{
        width:64, height:64, borderRadius:16, background:"#2563EB",
        display:"flex", alignItems:"center", justifyContent:"center",
        marginBottom:"1.5rem"
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="14" width="6" height="14" rx="2" fill="white" opacity="0.7"/>
          <rect x="13" y="8" width="6" height="20" rx="2" fill="white"/>
          <rect x="22" y="4" width="6" height="24" rx="2" fill="white" opacity="0.7"/>
        </svg>
      </div>

      <h1 style={{ fontSize:42, fontWeight:700, letterSpacing:"-0.03em", margin:"0 0 0.5rem", color:"#111827" }}>
        DashCreator
      </h1>

      <p style={{ fontSize:18, color:"#6B7280", margin:"0 0 2.5rem", maxWidth:400, lineHeight:1.5 }}>
        Conecte seus dados de publicidade e crie dashboards profissionais com IA em segundos.
      </p>

      <button
        onClick={onStart}
        style={{
          background:"#2563EB", color:"white", border:"none",
          borderRadius:12, padding:"16px 40px", fontSize:16,
          fontWeight:600, cursor:"pointer", letterSpacing:"0.01em"
        }}
      >
        CRIE SEU PROJETO
      </button>

      <p style={{ marginTop:"1.5rem", fontSize:13, color:"#9CA3AF" }}>
        Google Ads · Meta Ads · TikTok Ads · Ibope · Google Analytics · Spotify Ads
      </p>
    </div>
  );
}

// ─── TELA 2 — Upload ─────────────────────────────────────────────────────────
function ScreenUpload({ onNext, onSkip }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile]         = useState(null);
  const [sheets, setSheets]     = useState("");
  const [tab, setTab]           = useState("file");
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx","xls","csv"].includes(ext)) return alert("Use .xlsx, .xls ou .csv");
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const readFileAsText = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsText(f);
  });

  const handleContinue = async () => {
    if (tab === "file" && file) {
      const text = await readFileAsText(file);
      const preview = text.split("\n").slice(0, 6).join("\n");
      onNext(`Arquivo: ${file.name}\n\nPrimeiras linhas:\n${preview}`);
    } else {
      onNext(null);
    }
  };

  const tabStyle = (active) => ({
    flex:1, padding:"10px", border:"none", cursor:"pointer", fontSize:14,
    fontWeight: active ? 600 : 400,
    borderBottom: active ? "2px solid #2563EB" : "2px solid transparent",
    color: active ? "#2563EB" : "#6B7280",
    background: "transparent"
  });

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ width:"100%", maxWidth:520 }}>

        <div style={{ marginBottom:"2rem" }}>
          <div style={{ fontSize:13, color:"#9CA3AF", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>
            Passo 1 de 3
          </div>
          <h2 style={{ fontSize:28, fontWeight:700, margin:0, color:"#111827" }}>
            Conecte seus dados
          </h2>
          <p style={{ color:"#6B7280", marginTop:8, fontSize:15 }}>
            Faça upload de uma planilha ou conecte ao Google Sheets. Pode pular para usar dados de exemplo.
          </p>
        </div>

        <div style={{ background:"white", border:"1px solid #E5E7EB", borderRadius:12, overflow:"hidden" }}>

          <div style={{ display:"flex", borderBottom:"1px solid #E5E7EB" }}>
            <button style={tabStyle(tab==="file")} onClick={()=>setTab("file")}>Upload arquivo</button>
            <button style={tabStyle(tab==="sheets")} onClick={()=>setTab("sheets")}>Google Sheets</button>
          </div>

          <div style={{ padding:"1.5rem" }}>
            {tab === "file" && (
              <>
                <div
                  onDragOver={e=>{e.preventDefault();setDragging(true)}}
                  onDragLeave={()=>setDragging(false)}
                  onDrop={onDrop}
                  onClick={()=>inputRef.current?.click()}
                  style={{
                    border:`2px dashed ${dragging ? "#2563EB" : file ? "#059669" : "#D1D5DB"}`,
                    borderRadius:10, padding:"2.5rem 1rem", textAlign:"center",
                    cursor:"pointer", transition:"all .2s",
                    background: dragging ? "#EFF6FF" : file ? "#F0FDF4" : "#FAFAFA"
                  }}
                >
                  <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}}
                    onChange={e=>handleFile(e.target.files[0])} />
                  {file ? (
                    <>
                      <div style={{ fontSize:32, marginBottom:8 }}>✓</div>
                      <div style={{ fontWeight:600, color:"#059669" }}>{file.name}</div>
                      <div style={{ fontSize:13, color:"#6B7280", marginTop:4 }}>
                        {(file.size/1024).toFixed(0)} KB · clique para trocar
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
                      <div style={{ fontWeight:600, color:"#374151" }}>
                        {dragging ? "Solte aqui!" : "Arraste sua planilha"}
                      </div>
                      <div style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>
                        ou clique para selecionar · xlsx, xls, csv
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {tab === "sheets" && (
              <div>
                <label style={{ fontSize:13, color:"#6B7280", display:"block", marginBottom:8 }}>
                  URL do Google Sheets (compartilhado como "qualquer pessoa com o link")
                </label>
                <input
                  type="url"
                  value={sheets}
                  onChange={e=>setSheets(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #D1D5DB", fontSize:14, boxSizing:"border-box" }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ display:"flex", gap:12, marginTop:"1.5rem" }}>
          <button
            onClick={handleContinue}
            style={{
              flex:1, background:"#2563EB", color:"white", border:"none",
              borderRadius:10, padding:"13px", fontSize:15, fontWeight:600, cursor:"pointer"
            }}
          >
            Continuar →
          </button>
          <button
            onClick={()=>onSkip()}
            style={{
              padding:"13px 20px", background:"transparent", border:"1px solid #E5E7EB",
              borderRadius:10, fontSize:14, color:"#6B7280", cursor:"pointer"
            }}
          >
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TELA 3 — Agente ─────────────────────────────────────────────────────────
function ScreenAgent({ dataSummary, onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState("");
  const examples = [
    "Crie um dashboard para análise de performance de campanhas de marketing digital da empresa JOVI. Utilize dados do Google Ads, Meta Ads e TikTok Ads. Preciso de uma visão gerencial com os big numbers principais (impressões, cliques, investimento, conversões, ROAS) e uma tela de awareness com alcance, frequência e CPM.",
    "Monte um dashboard de concorrência no segmento de telecomunicações comparando Marca A, B e C. Métricas: share of voice, investimento em mídia, presença digital e engajamento.",
    "Dashboard de drops (lançamentos) do último trimestre. Pico de buscas, performance antes/durante/depois do lançamento e canais mais eficientes.",
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ width:"100%", maxWidth:600 }}>

        <div style={{ marginBottom:"2rem" }}>
          <div style={{ fontSize:13, color:"#9CA3AF", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>
            Passo 2 de 3
          </div>
          <h2 style={{ fontSize:28, fontWeight:700, margin:0, color:"#111827" }}>
            O que você quer no seu projeto?
          </h2>
          {dataSummary && (
            <div style={{ marginTop:10, padding:"8px 12px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, fontSize:13, color:"#166534" }}>
              ✓ Dados carregados — a IA vai usar sua planilha
            </div>
          )}
        </div>

        <textarea
          value={prompt}
          onChange={e=>setPrompt(e.target.value)}
          placeholder="Digite o que deseja no seu dashboard…&#10;&#10;Ex: Crie um dashboard para análise de performance de campanhas da marca ACME com dados de Google Ads e Meta Ads, mostrando impressões, cliques, ROAS e evolução semanal."
          rows={8}
          style={{
            width:"100%", boxSizing:"border-box", padding:"16px",
            border:"1px solid #D1D5DB", borderRadius:12, fontSize:15,
            lineHeight:1.6, resize:"vertical", fontFamily:"inherit",
            color:"#111827"
          }}
        />

        <div style={{ marginTop:"1rem", marginBottom:"1.5rem" }}>
          <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:8 }}>Exemplos de prompt:</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {examples.map((ex,i) => (
              <button
                key={i}
                onClick={()=>setPrompt(ex)}
                style={{
                  textAlign:"left", padding:"10px 12px", background:"#F9FAFB",
                  border:"1px solid #E5E7EB", borderRadius:8, fontSize:12,
                  color:"#374151", cursor:"pointer", lineHeight:1.5
                }}
              >
                {ex.slice(0,80)}…
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={()=>onGenerate(prompt, dataSummary)}
          disabled={!prompt.trim() || isLoading}
          style={{
            width:"100%", background: prompt.trim() ? "#2563EB" : "#D1D5DB",
            color:"white", border:"none", borderRadius:12, padding:"15px",
            fontSize:16, fontWeight:600, cursor: prompt.trim() ? "pointer" : "default",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8
          }}
        >
          {isLoading ? (
            <>
              <span style={{
                width:16, height:16, border:"2px solid rgba(255,255,255,0.4)",
                borderTopColor:"white", borderRadius:"50%",
                display:"inline-block", animation:"spin 0.8s linear infinite"
              }}/>
              Gerando dashboard com IA…
            </>
          ) : "✦ Gerar Dashboard com IA"}
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── TELA 4 — Dashboard output ────────────────────────────────────────────────
const COLORS_BY_NAME = {
  blue:"#2563EB", green:"#059669", red:"#DC2626",
  orange:"#D97706", purple:"#7C3AED"
};

function BigNumberCard({ bn }) {
  const c = COLORS_BY_NAME[bn.color] || "#2563EB";
  const arrow = bn.direction === "up" ? "↑" : bn.direction === "down" ? "↓" : "—";
  const arrowColor = bn.direction === "up" ? "#059669" : bn.direction === "down" ? "#DC2626" : "#9CA3AF";
  return (
    <div style={{
      background:"white", border:"1px solid #E5E7EB", borderRadius:12,
      padding:"1.25rem", borderTop:`3px solid ${c}`
    }}>
      <div style={{ fontSize:12, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>
        {bn.label}
      </div>
      <div style={{ fontSize:28, fontWeight:700, color:"#111827", marginBottom:4 }}>
        {bn.value}
      </div>
      {bn.change && (
        <div style={{ fontSize:13, color:arrowColor, fontWeight:500 }}>
          {arrow} {bn.change}
        </div>
      )}
    </div>
  );
}

function ChartCard({ chart }) {
  const colors = chart.colors?.length ? chart.colors : PALETTE;
  const data   = chart.data || [];
  const keys   = data.length
    ? Object.keys(data[0]).filter(k => k !== "name" && typeof data[0][k] === "number")
    : ["valor"];

  const tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:"white", border:"1px solid #E5E7EB", borderRadius:8, padding:"8px 12px", fontSize:12 }}>
        {label && <p style={{ color:"#6B7280", marginBottom:4 }}>{label}</p>}
        {payload.map((p,i) => (
          <p key={i} style={{ color:p.color, margin:0 }}>{p.name}: {Number(p.value).toLocaleString("pt-BR")}</p>
        ))}
      </div>
    );
  };

  const axisStyle = { tick:{ fill:"#9CA3AF", fontSize:11 }, axisLine:false, tickLine:false };
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>;

  const renderBody = () => {
    if (chart.type === "pie" || chart.type === "donut") {
      return (
        <PieChart>
          <Pie data={data} dataKey={keys[0]||"valor"} nameKey="name"
            cx="50%" cy="50%"
            innerRadius={chart.type==="donut"?"50%":0} outerRadius="70%"
            paddingAngle={3}>
            {data.map((_,i) => <Cell key={i} fill={colors[i%colors.length]}/>)}
          </Pie>
          <Tooltip content={tip}/>
          <Legend wrapperStyle={{fontSize:12,color:"#6B7280"}}/>
        </PieChart>
      );
    }
    if (chart.type === "line") return (
      <LineChart data={data}>
        {grid}<XAxis dataKey="name" {...axisStyle}/>
        <YAxis {...axisStyle} width={45} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
        <Tooltip content={tip}/>
        {keys.length>1&&<Legend wrapperStyle={{fontSize:12,color:"#6B7280"}}/>}
        {keys.map((k,i)=><Line key={k} type="monotone" dataKey={k} stroke={colors[i]||PALETTE[i]} strokeWidth={2} dot={{r:3}} name={k}/>)}
      </LineChart>
    );
    if (chart.type === "area") return (
      <AreaChart data={data}>
        <defs>{keys.map((k,i)=>(
          <linearGradient key={k} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[i]||PALETTE[i]} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={colors[i]||PALETTE[i]} stopOpacity={0}/>
          </linearGradient>
        ))}</defs>
        {grid}<XAxis dataKey="name" {...axisStyle}/>
        <YAxis {...axisStyle} width={45} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
        <Tooltip content={tip}/>
        {keys.map((k,i)=><Area key={k} type="monotone" dataKey={k} stroke={colors[i]||PALETTE[i]} fill={`url(#g${i})`} strokeWidth={2} name={k}/>)}
      </AreaChart>
    );
    return (
      <BarChart data={data} barGap={3}>
        {grid}<XAxis dataKey="name" {...axisStyle}/>
        <YAxis {...axisStyle} width={45} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
        <Tooltip content={tip}/>
        {keys.length>1&&<Legend wrapperStyle={{fontSize:12,color:"#6B7280"}}/>}
        {keys.map((k,i)=><Bar key={k} dataKey={k} fill={colors[i]||PALETTE[i]} radius={[3,3,0,0]} maxBarSize={50} name={k}/>)}
      </BarChart>
    );
  };

  return (
    <div style={{ background:"white", border:"1px solid #E5E7EB", borderRadius:12, padding:"1.25rem" }}>
      <div style={{ fontWeight:600, fontSize:14, color:"#111827", marginBottom:16 }}>{chart.title}</div>
      <ResponsiveContainer width="100%" height={200}>{renderBody()}</ResponsiveContainer>
    </div>
  );
}

function Section({ section }) {
  return (
    <div style={{ marginBottom:"2.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem" }}>
        <h3 style={{ fontSize:13, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color:"#2563EB", margin:0 }}>
          {section.name}
        </h3>
        <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
      </div>

      {section.big_numbers?.length > 0 && (
        <div style={{
          display:"grid", gap:12, marginBottom:"1.25rem",
          gridTemplateColumns:`repeat(${Math.min(section.big_numbers.length,4)},1fr)`
        }}>
          {section.big_numbers.map((bn,i) => <BigNumberCard key={i} bn={bn}/>)}
        </div>
      )}

      {section.charts?.length > 0 && (
        <div style={{
          display:"grid", gap:12, marginBottom:"1.25rem",
          gridTemplateColumns: section.charts.length===1 ? "1fr" : "repeat(2,1fr)"
        }}>
          {section.charts.map((c,i) => <ChartCard key={i} chart={c}/>)}
        </div>
      )}

      {section.insights?.length > 0 && (
        <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, padding:"1rem 1.25rem" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#1D4ED8", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            Insights
          </div>
          {section.insights.map((ins,i) => (
            <div key={i} style={{ fontSize:13, color:"#1E40AF", padding:"3px 0", display:"flex", gap:8 }}>
              <span>→</span><span>{ins}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScreenDashboard({ dashboard, onEdit, onExport, onRestart }) {
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!refineText.trim()) return;
    setIsRefining(true);
    try {
      const updated = await callClaude(
        `Dashboard atual:\n${JSON.stringify(dashboard)}\n\nAjuste solicitado:\n${refineText}\n\nRetorne o dashboard COMPLETO atualizado.`,
        null
      );
      onEdit(updated);
      setRefineText("");
      setRefineOpen(false);
    } catch(e) {
      alert("Erro ao ajustar. Tente novamente.");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F9FAFB" }}>

      {/* Top bar */}
      <div style={{
        position:"sticky", top:0, zIndex:10,
        background:"white", borderBottom:"1px solid #E5E7EB",
        padding:"0 1.5rem", display:"flex", alignItems:"center",
        justifyContent:"space-between", height:56
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontWeight:700, fontSize:16, color:"#111827" }}>DashCreator</span>
          <span style={{
            background:"#D1FAE5", color:"#065F46", fontSize:12, fontWeight:500,
            padding:"2px 10px", borderRadius:20
          }}>✓ Dashboard criado</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button
            onClick={()=>setRefineOpen(v=>!v)}
            style={{
              padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:500,
              border:`1px solid ${refineOpen ? "#2563EB" : "#E5E7EB"}`,
              background: refineOpen ? "#EFF6FF" : "white",
              color: refineOpen ? "#2563EB" : "#374151",
              cursor:"pointer"
            }}
          >
            ✎ Editar
          </button>
          <button
            onClick={onExport}
            style={{
              padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:600,
              border:"none", background:"#2563EB", color:"white", cursor:"pointer"
            }}
          >
            ↓ Exportar
          </button>
          <button
            onClick={onRestart}
            style={{
              padding:"7px 12px", borderRadius:8, fontSize:13,
              border:"1px solid #E5E7EB", background:"white",
              color:"#6B7280", cursor:"pointer"
            }}
          >
            ↺
          </button>
        </div>
      </div>

      <div style={{ display:"flex" }}>

        {/* Dashboard */}
        <div style={{ flex:1, padding:"2rem", maxWidth:refineOpen ? "calc(100% - 300px)" : "900px", margin:"0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom:"2rem" }}>
            <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", margin:"0 0 4px" }}>
              {dashboard.title}
            </h1>
            <div style={{ display:"flex", gap:16, fontSize:13, color:"#9CA3AF" }}>
              {dashboard.brand && <span>📍 {dashboard.brand}</span>}
              {dashboard.period && <span>📅 {dashboard.period}</span>}
            </div>
          </div>

          {dashboard.sections?.map((sec,i) => <Section key={sec.id||i} section={sec}/>)}
        </div>

        {/* Refinement panel */}
        {refineOpen && (
          <div style={{
            width:300, borderLeft:"1px solid #E5E7EB", background:"white",
            padding:"1.5rem", display:"flex", flexDirection:"column",
            position:"sticky", top:56, height:"calc(100vh - 56px)", overflow:"auto"
          }}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:"1rem", color:"#111827" }}>
              Ajustar dashboard
            </div>

            <div style={{ marginBottom:"1rem" }}>
              <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:8 }}>Ações rápidas:</p>
              {[
                "Troque gráficos de linha por barras",
                "Adicione mais insights",
                "Inclua seção de concorrência",
                "Adicione recomendações estratégicas",
              ].map(a => (
                <button key={a} onClick={()=>setRefineText(a)}
                  style={{
                    display:"block", width:"100%", textAlign:"left",
                    padding:"8px 10px", marginBottom:4, borderRadius:8,
                    border:"1px solid #E5E7EB", background:"#F9FAFB",
                    fontSize:12, color:"#374151", cursor:"pointer"
                  }}>
                  {a}
                </button>
              ))}
            </div>

            <textarea
              value={refineText}
              onChange={e=>setRefineText(e.target.value)}
              placeholder="Descreva o que quer mudar…"
              rows={5}
              style={{
                width:"100%", boxSizing:"border-box", padding:"10px",
                border:"1px solid #D1D5DB", borderRadius:8, fontSize:13,
                fontFamily:"inherit", resize:"vertical", marginBottom:10
              }}
            />

            <button
              onClick={handleRefine}
              disabled={!refineText.trim() || isRefining}
              style={{
                background: refineText.trim() ? "#2563EB" : "#D1D5DB",
                color:"white", border:"none", borderRadius:8, padding:"10px",
                fontSize:13, fontWeight:600, cursor: refineText.trim() ? "pointer" : "default",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6
              }}
            >
              {isRefining ? (
                <>
                  <span style={{width:12,height:12,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                  Ajustando…
                </>
              ) : "Aplicar ajuste"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TELA 5 — Exportar ────────────────────────────────────────────────────────
function ScreenExport({ dashboard, onBack, onRestart }) {
  const [done, setDone] = useState([]);

  const exportHTML = () => {
    const json = JSON.stringify(dashboard, null, 2);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${dashboard.title}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
<style>body{font-family:system-ui,sans-serif;margin:0;padding:2rem;background:#f9fafb;color:#111827}
h1{font-size:24px;margin:0 0 4px}h3{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#2563EB;margin:2rem 0 1rem}
.grid{display:grid;gap:12px;margin-bottom:1rem}.card{background:white;border:1px solid #E5E7EB;border-radius:12px;padding:1.25rem}
.label{font-size:11px;color:#9CA3AF;text-transform:uppercase;margin-bottom:6px}.value{font-size:26px;font-weight:700}
.insight{font-size:13px;color:#1E40AF;padding:3px 0}.chart-wrap{height:200px}footer{text-align:center;padding:2rem;font-size:12px;color:#9CA3AF}
</style></head><body>
<h1>${dashboard.title}</h1><p style="color:#9CA3AF;font-size:13px">${dashboard.brand||''} ${dashboard.period||''}</p>
${(dashboard.sections||[]).map(s=>`
<h3>${s.name}</h3>
<div class="grid" style="grid-template-columns:repeat(${Math.min(s.big_numbers?.length||1,4)},1fr)">
${(s.big_numbers||[]).map(bn=>`<div class="card"><div class="label">${bn.label}</div><div class="value">${bn.value}</div>${bn.change?`<div style="font-size:13px;color:${bn.direction==='up'?'#059669':bn.direction==='down'?'#DC2626':'#9CA3AF'}">${bn.change}</div>`:''}</div>`).join('')}
</div>
${(s.charts||[]).map((c,i)=>`<div class="card"><div style="font-weight:600;font-size:14px;margin-bottom:12px">${c.title}</div><div class="chart-wrap"><canvas id="chart-${s.id}-${i}"></canvas></div></div>`).join('')}
${s.insights?.length?`<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:1rem;margin-top:8px"><div style="font-size:11px;font-weight:600;color:#1D4ED8;margin-bottom:8px">INSIGHTS</div>${s.insights.map(ins=>`<div class="insight">→ ${ins}</div>`).join('')}</div>`:''}
`).join('')}
<footer>Gerado por DashCreator AI</footer>
<script>
const data=${json};
data.sections.forEach(s=>{
  (s.charts||[]).forEach((c,i)=>{
    const el=document.getElementById('chart-'+s.id+'-'+i);if(!el)return;
    const keys=c.data?.length?Object.keys(c.data[0]).filter(k=>k!=='name'&&typeof c.data[0][k]==='number'):['valor'];
    const colors=c.colors||['#2563EB','#7C3AED','#059669'];
    const type=c.type==='donut'?'doughnut':c.type==='area'?'line':c.type||'bar';
    new Chart(el,{type,data:{labels:c.data.map(d=>d.name),datasets:keys.map((k,ki)=>({label:k,data:c.data.map(d=>d[k]),backgroundColor:type==='bar'?colors[ki]:colors[ki]+'33',borderColor:colors[ki],borderWidth:2,fill:c.type==='area',tension:.4}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:keys.length>1}}}});
  });
});
<\/script></body></html>`;
    const blob = new Blob([html], {type:"text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(dashboard.title||"dashboard").replace(/\s+/g,"_")}.html`;
    a.click();
    setDone(d=>[...d,"html"]);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(dashboard,null,2)],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(dashboard.title||"dashboard").replace(/\s+/g,"_")}.json`;
    a.click();
    setDone(d=>[...d,"json"]);
  };

  const formats = [
    { id:"html", icon:"🌐", label:"HTML interativo", desc:"Dashboard com gráficos prontos para o navegador", action:exportHTML },
    { id:"json", icon:"{ }", label:"JSON dos dados", desc:"Estrutura completa para integrar ao seu sistema", action:exportJSON },
    { id:"pptx", icon:"📊", label:"PowerPoint", desc:"Disponível na versão Pro (backend necessário)", disabled:true },
    { id:"pdf",  icon:"📄", label:"PDF",          desc:"Disponível na versão Pro (backend necessário)", disabled:true },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ width:"100%", maxWidth:520 }}>

        {/* Success */}
        <div style={{
          textAlign:"center", padding:"2rem", background:"#F0FDF4",
          border:"1px solid #BBF7D0", borderRadius:16, marginBottom:"2rem"
        }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✓</div>
          <h2 style={{ fontSize:24, fontWeight:700, color:"#065F46", margin:"0 0 6px" }}>
            Projeto criado com sucesso!
          </h2>
          <p style={{ color:"#047857", fontSize:14, margin:0 }}>
            {dashboard.title} · {dashboard.sections?.length||0} seções geradas
          </p>
        </div>

        <h3 style={{ fontSize:16, fontWeight:600, color:"#111827", marginBottom:"1rem" }}>
          Exportar como:
        </h3>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:"1.5rem" }}>
          {formats.map(f => (
            <div key={f.id} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              background:"white", border:"1px solid #E5E7EB", borderRadius:12, padding:"1rem 1.25rem",
              opacity: f.disabled ? 0.5 : 1
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:20, width:32, textAlign:"center" }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{f.label}</div>
                  <div style={{ fontSize:12, color:"#9CA3AF" }}>{f.desc}</div>
                </div>
              </div>
              <button
                onClick={f.action}
                disabled={f.disabled}
                style={{
                  padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:500,
                  border:"1px solid #E5E7EB", cursor: f.disabled ? "default" : "pointer",
                  background: done.includes(f.id) ? "#D1FAE5" : f.disabled ? "#F3F4F6" : "#2563EB",
                  color: done.includes(f.id) ? "#065F46" : f.disabled ? "#9CA3AF" : "white"
                }}
              >
                {done.includes(f.id) ? "✓ Baixado" : f.disabled ? "Em breve" : "Baixar"}
              </button>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onBack}
            style={{ flex:1, padding:"11px", border:"1px solid #E5E7EB", borderRadius:10, background:"white", color:"#374151", cursor:"pointer", fontSize:14 }}>
            ← Voltar ao dashboard
          </button>
          <button onClick={onRestart}
            style={{ flex:1, padding:"11px", border:"none", borderRadius:10, background:"#111827", color:"white", cursor:"pointer", fontSize:14, fontWeight:600 }}>
            + Novo projeto
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App principal ─────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState("home");
  const [dataSummary, setData]    = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading]     = useState(false);

  const handleGenerate = async (prompt, data) => {
    setLoading(true);
    try {
      const dash = await callClaude(prompt, data);
      setDashboard(dash);
      setScreen("dashboard");
    } catch(e) {
      alert("Erro ao gerar dashboard. Verifique sua chave de API e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => { setScreen("home"); setData(null); setDashboard(null); };

  if (screen === "home")      return <ScreenHome onStart={()=>setScreen("upload")} />;
  if (screen === "upload")    return <ScreenUpload onNext={d=>{setData(d);setScreen("agent")}} onSkip={()=>setScreen("agent")} />;
  if (screen === "agent")     return <ScreenAgent dataSummary={dataSummary} onGenerate={handleGenerate} isLoading={loading} />;
  if (screen === "dashboard") return <ScreenDashboard dashboard={dashboard} onEdit={setDashboard} onExport={()=>setScreen("export")} onRestart={restart} />;
  if (screen === "export")    return <ScreenExport dashboard={dashboard} onBack={()=>setScreen("dashboard")} onRestart={restart} />;
}
