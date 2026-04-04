import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Eye, MousePointer, DollarSign, Percent, Users, BarChart2 } from 'lucide-react'

// ── Palette ──────────────────────────────────────────
const PALETTE = ['#00D4FF', '#7B2FFF', '#4ADE80', '#FBBF24', '#F472B6', '#F87171', '#34D399', '#818CF8']

const ICON_MAP = {
  eye: Eye, click: MousePointer, money: DollarSign,
  percent: Percent, trending: TrendingUp, users: Users, default: BarChart2,
}

const COLOR_MAP = {
  blue: '#00D4FF', purple: '#7B2FFF', green: '#4ADE80',
  red: '#F87171', orange: '#FBBF24', yellow: '#FDE68A',
  pink: '#F472B6', default: '#00D4FF',
}

// ── Tooltip customizado ───────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs shadow-xl">
      {label && <p className="text-white/50 mb-1.5">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-mono">
          {entry.name}: {typeof entry.value === 'number'
            ? entry.value.toLocaleString('pt-BR')
            : entry.value}
        </p>
      ))}
    </div>
  )
}

// ── BigNumber card ────────────────────────────────────
function BigNumber({ bn }) {
  const Icon = ICON_MAP[bn.icon] || ICON_MAP.default
  const accentColor = COLOR_MAP[bn.color] || COLOR_MAP.default
  const isUp = bn.change_direction === 'up'
  const isDown = bn.change_direction === 'down'
  const ChangeIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const changeColor = isUp ? '#4ADE80' : isDown ? '#F87171' : 'rgba(255,255,255,0.3)'

  return (
    <div className="glass rounded-2xl p-5 hover:border-white/15 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}20` }}>
          <Icon size={16} style={{ color: accentColor }} />
        </div>
        {bn.change && (
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: changeColor }}>
            <ChangeIcon size={12} />
            {bn.change}
          </div>
        )}
      </div>
      <div className="font-mono text-2xl font-bold text-white mb-1 group-hover:text-accent-cyan transition-colors">
        {bn.value}
      </div>
      <div className="text-xs text-white/40 uppercase tracking-wide">{bn.label}</div>
    </div>
  )
}

// ── Chart wrapper ─────────────────────────────────────
function ChartCard({ chart }) {
  const colors = chart.colors?.length ? chart.colors : PALETTE
  const data   = chart.data || []

  // Descobre keys para múltiplas séries
  const valueKeys = data.length
    ? Object.keys(data[0]).filter(k => k !== 'name' && k !== 'category' && typeof data[0][k] === 'number')
    : ['value']

  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v.toLocaleString('pt-BR')} />
            <Tooltip content={<CustomTooltip />} />
            {chart.show_legend && <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />}
            {valueKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[i] || PALETTE[i]}
                strokeWidth={2} dot={{ r: 3, fill: colors[i] }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {valueKeys.map((key, i) => (
                <linearGradient key={key} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i] || PALETTE[i]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colors[i] || PALETTE[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v.toLocaleString('pt-BR')} />
            <Tooltip content={<CustomTooltip />} />
            {chart.show_legend && <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />}
            {valueKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={colors[i] || PALETTE[i]}
                fill={`url(#grad-${i})`} strokeWidth={2} />
            ))}
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v.toLocaleString('pt-BR')} />
            <Tooltip content={<CustomTooltip />} />
            {chart.show_legend && <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />}
            {valueKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i] || PALETTE[i]} radius={[4, 4, 0, 0]} maxBarSize={60} />
            ))}
          </BarChart>
        )

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chart.type === 'donut' ? '55%' : 0}
              outerRadius="75%"
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length] || PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {chart.show_legend && <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />}
          </PieChart>
        )

      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={colors[0] || PALETTE[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        )
    }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-1 font-syne font-bold text-sm text-white/85">{chart.title}</div>
      {chart.description && (
        <div className="text-xs text-white/35 mb-4">{chart.description}</div>
      )}
      <ResponsiveContainer width="100%" height={220}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

// ── Section ───────────────────────────────────────────
function Section({ section }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-white/05" />
        <h3 className="font-syne font-bold text-sm uppercase tracking-widest text-accent-cyan">
          {section.name}
        </h3>
        <div className="h-px flex-1 bg-white/05" />
      </div>

      {/* Big Numbers */}
      {section.big_numbers?.length > 0 && (
        <div className={`grid gap-4 mb-6 ${
          section.big_numbers.length === 1 ? 'grid-cols-1' :
          section.big_numbers.length === 2 ? 'grid-cols-2' :
          section.big_numbers.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' :
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}>
          {section.big_numbers.map((bn, i) => <BigNumber key={i} bn={bn} />)}
        </div>
      )}

      {/* Charts */}
      {section.charts?.length > 0 && (
        <div className={`grid gap-4 mb-6 ${
          section.charts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {section.charts.map((chart, i) => <ChartCard key={i} chart={chart} />)}
        </div>
      )}

      {/* Insights */}
      {section.insights?.length > 0 && (
        <div className="rounded-2xl px-5 py-4"
          style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}>
          <p className="text-xs text-accent-cyan uppercase tracking-widest mb-3 font-medium">
            💡 Insights
          </p>
          <ul className="space-y-2">
            {section.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/65 leading-relaxed">
                <span className="text-accent-cyan mt-0.5 flex-shrink-0">→</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {section.recommendations?.length > 0 && (
        <div className="rounded-2xl px-5 py-4 mt-4"
          style={{ background: 'rgba(123,47,255,0.05)', border: '1px solid rgba(123,47,255,0.15)' }}>
          <p className="text-xs text-accent-purple uppercase tracking-widest mb-3 font-medium">
            ✦ Recomendações
          </p>
          <ul className="space-y-2">
            {section.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/60 leading-relaxed">
                <span className="text-accent-purple mt-0.5 flex-shrink-0">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────
export default function DashboardRenderer({ dashboard }) {
  if (!dashboard) return null

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/05">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-syne font-extrabold text-2xl sm:text-3xl gradient-text mb-1">
              {dashboard.title}
            </h2>
            {dashboard.subtitle && (
              <p className="text-white/45 text-sm">{dashboard.subtitle}</p>
            )}
          </div>
          <div className="text-right text-xs text-white/25">
            {dashboard.brand && <div className="font-medium text-white/40">{dashboard.brand}</div>}
            {dashboard.period && <div className="mt-0.5">{dashboard.period}</div>}
          </div>
        </div>

        {dashboard.summary && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-white/[0.025] border border-white/06
            text-sm text-white/55 leading-relaxed italic">
            {dashboard.summary}
          </div>
        )}
      </div>

      {/* Sections */}
      {dashboard.sections?.map((section, i) => (
        <Section key={section.id || i} section={section} />
      ))}
    </div>
  )
}
