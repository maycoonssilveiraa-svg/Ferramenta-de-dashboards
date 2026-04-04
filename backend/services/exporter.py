"""
Serviço de exportação do DashCreator.
Suporta: HTML, PDF (via HTML), PowerPoint (pptx)
"""

import io
import json
import os
from typing import Optional
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from jinja2 import Template


# ────────────────────────────────────────────────
# HTML Export
# ────────────────────────────────────────────────

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ dashboard.title }} — DashCreator</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: #0A0A0F;
    color: #E8E8F0;
    min-height: 100vh;
  }

  .header {
    padding: 40px 60px 30px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #00D4FF, #7B2FFF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .header .meta {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.4);
    text-align: right;
  }

  .section {
    padding: 40px 60px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 30px;
    color: #00D4FF;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .big-numbers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .big-number {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 24px 20px;
  }

  .big-number .label {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
  }

  .big-number .value {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #E8E8F0;
    margin-bottom: 6px;
  }

  .big-number .change {
    font-size: 0.8rem;
    font-weight: 500;
  }

  .change-up { color: #4ADE80; }
  .change-down { color: #F87171; }
  .change-neutral { color: rgba(255,255,255,0.4); }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 30px;
  }

  .chart-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 24px;
  }

  .chart-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .chart-desc {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.4);
    margin-bottom: 20px;
  }

  .chart-container { position: relative; height: 250px; }

  .insights {
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 12px;
    padding: 20px 24px;
    margin-top: 20px;
  }

  .insights h4 {
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    color: #00D4FF;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
  }

  .insights ul { list-style: none; }
  .insights li {
    font-size: 0.9rem;
    color: rgba(255,255,255,0.7);
    padding: 4px 0;
    padding-left: 16px;
    position: relative;
  }
  .insights li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #00D4FF;
  }

  .footer {
    padding: 30px 60px;
    text-align: center;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.2);
  }

  .badge {
    display: inline-block;
    background: linear-gradient(135deg, #00D4FF22, #7B2FFF22);
    border: 1px solid rgba(0, 212, 255, 0.3);
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.7rem;
    color: #00D4FF;
    margin-left: 12px;
    vertical-align: middle;
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>{{ dashboard.title }}</h1>
    <p style="margin-top:8px; color:rgba(255,255,255,0.4); font-size:0.9rem;">
      {{ dashboard.subtitle }}
      {% if dashboard.brand %}<span class="badge">{{ dashboard.brand }}</span>{% endif %}
    </p>
  </div>
  <div class="meta">
    <div>{{ dashboard.period or '' }}</div>
    <div style="margin-top:4px">Gerado por DashCreator AI</div>
  </div>
</div>

{% for section in dashboard.sections %}
<div class="section">
  <div class="section-title">{{ section.name }}</div>

  {% if section.big_numbers %}
  <div class="big-numbers">
    {% for bn in section.big_numbers %}
    <div class="big-number">
      <div class="label">{{ bn.label }}</div>
      <div class="value">{{ bn.value }}</div>
      {% if bn.change %}
      <div class="change change-{{ bn.change_direction or 'neutral' }}">
        {{ bn.change }}
      </div>
      {% endif %}
    </div>
    {% endfor %}
  </div>
  {% endif %}

  {% if section.charts %}
  <div class="charts-grid">
    {% for chart in section.charts %}
    <div class="chart-card">
      <div class="chart-title">{{ chart.title }}</div>
      {% if chart.description %}
      <div class="chart-desc">{{ chart.description }}</div>
      {% endif %}
      <div class="chart-container">
        <canvas id="chart-{{ section.id }}-{{ loop.index }}"></canvas>
      </div>
    </div>
    {% endfor %}
  </div>
  {% endif %}

  {% if section.insights %}
  <div class="insights">
    <h4>💡 Insights</h4>
    <ul>
      {% for insight in section.insights %}
      <li>{{ insight }}</li>
      {% endfor %}
    </ul>
  </div>
  {% endif %}
</div>
{% endfor %}

<div class="footer">
  Gerado automaticamente pelo DashCreator AI · Powered by Claude (Anthropic)
</div>

<script>
const dashboardData = {{ dashboard_json }};
const defaultColors = ['#00D4FF', '#7B2FFF', '#FF6B6B', '#4ADE80', '#FBBF24', '#F472B6'];

Chart.defaults.color = 'rgba(255,255,255,0.5)';
Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';

dashboardData.sections.forEach(section => {
  if (!section.charts) return;
  section.charts.forEach((chart, idx) => {
    const canvasId = `chart-${section.id}-${idx + 1}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const colors = chart.colors || defaultColors;
    const data = chart.data || [];
    const labels = data.map(d => d.name);
    const values = data.map(d => d.value);
    const values2 = data.map(d => d.value2).filter(v => v !== undefined);

    const datasets = [
      {
        label: chart.y_axis || 'Valor',
        data: values,
        borderColor: colors[0],
        backgroundColor: chart.type === 'line' || chart.type === 'area'
          ? colors[0] + '22'
          : colors.length > 1 ? colors : colors[0] + 'CC',
        fill: chart.type === 'area',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
      }
    ];

    if (values2.length) {
      datasets.push({
        label: 'Comparativo',
        data: values2,
        borderColor: colors[1] || defaultColors[1],
        backgroundColor: (colors[1] || defaultColors[1]) + '22',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
      });
    }

    const chartType = chart.type === 'area' ? 'line'
      : chart.type === 'donut' ? 'doughnut'
      : chart.type === 'funnel' ? 'bar'
      : chart.type;

    new Chart(canvas, {
      type: chartType,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: chart.show_legend !== false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: ['pie', 'doughnut'].includes(chartType) ? {} : {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.5)' },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.5)' },
          }
        }
      }
    });
  });
});
</script>
</body>
</html>
"""


def export_html(dashboard: dict) -> bytes:
    """Gera o HTML do dashboard."""
    template = Template(HTML_TEMPLATE)
    html = template.render(
        dashboard=dashboard,
        dashboard_json=json.dumps(dashboard, ensure_ascii=False),
    )
    return html.encode("utf-8")


# ────────────────────────────────────────────────
# PowerPoint Export
# ────────────────────────────────────────────────

def export_pptx(dashboard: dict) -> bytes:
    """Gera um arquivo PowerPoint com o dashboard."""
    prs = Presentation()
    prs.slide_width = Inches(13.33)
    prs.slide_height = Inches(7.5)

    # Cores
    COLOR_BG = RGBColor(10, 10, 15)
    COLOR_ACCENT = RGBColor(0, 212, 255)
    COLOR_PURPLE = RGBColor(123, 47, 255)
    COLOR_TEXT = RGBColor(232, 232, 240)
    COLOR_SUBTLE = RGBColor(100, 100, 120)

    def blank_slide():
        layout = prs.slide_layouts[6]  # blank
        slide = prs.slides.add_slide(layout)
        bg = slide.background.fill
        bg.solid()
        bg.fore_color.rgb = COLOR_BG
        return slide

    def add_text(slide, text, left, top, width, height,
                 font_size=14, bold=False, color=None, align=PP_ALIGN.LEFT):
        txBox = slide.shapes.add_textbox(
            Inches(left), Inches(top), Inches(width), Inches(height)
        )
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.alignment = align
        run = p.add_run()
        run.text = str(text)
        run.font.size = Pt(font_size)
        run.font.bold = bold
        run.font.color.rgb = color or COLOR_TEXT
        return txBox

    def add_rect(slide, left, top, width, height, color, alpha=None):
        shape = slide.shapes.add_shape(
            1,  # MSO_SHAPE_TYPE.RECTANGLE
            Inches(left), Inches(top), Inches(width), Inches(height)
        )
        shape.fill.solid()
        shape.fill.fore_color.rgb = color
        shape.line.fill.background()
        return shape

    # ── Slide de capa ──
    slide = blank_slide()
    add_rect(slide, 0, 0, 13.33, 7.5, COLOR_BG)
    # Barra de destaque
    add_rect(slide, 0, 0, 0.08, 7.5, COLOR_ACCENT)
    add_text(slide, dashboard.get("title", "Dashboard"), 0.5, 1.5, 10, 1.5,
             font_size=36, bold=True, color=COLOR_ACCENT)
    add_text(slide, dashboard.get("subtitle", ""), 0.5, 3.2, 10, 0.8,
             font_size=16, color=COLOR_TEXT)
    if dashboard.get("brand"):
        add_text(slide, dashboard["brand"], 0.5, 4.0, 6, 0.6,
                 font_size=12, color=COLOR_SUBTLE)
    if dashboard.get("period"):
        add_text(slide, dashboard["period"], 0.5, 4.6, 6, 0.6,
                 font_size=12, color=COLOR_SUBTLE)
    add_text(slide, "Gerado por DashCreator AI", 0.5, 6.5, 10, 0.5,
             font_size=9, color=COLOR_SUBTLE)

    # ── Slides por seção ──
    for section in dashboard.get("sections", []):
        # Slide de título da seção
        slide = blank_slide()
        add_rect(slide, 0, 0, 13.33, 0.08, COLOR_ACCENT)
        add_text(slide, section.get("name", ""), 0.6, 0.3, 12, 0.8,
                 font_size=22, bold=True, color=COLOR_ACCENT)

        # Big Numbers
        big_numbers = section.get("big_numbers", [])
        if big_numbers:
            cols = min(len(big_numbers), 4)
            card_w = (13.33 - 1.2) / cols
            for i, bn in enumerate(big_numbers[:4]):
                x = 0.6 + i * card_w
                add_rect(slide, x, 1.2, card_w - 0.2, 2.2, RGBColor(20, 20, 30))
                add_text(slide, bn.get("label", ""), x + 0.15, 1.35, card_w - 0.4, 0.5,
                         font_size=9, color=COLOR_SUBTLE)
                add_text(slide, bn.get("value", ""), x + 0.15, 1.85, card_w - 0.4, 0.8,
                         font_size=24, bold=True, color=COLOR_TEXT)
                change = bn.get("change", "")
                direction = bn.get("change_direction", "neutral")
                change_color = (
                    RGBColor(74, 222, 128) if direction == "up"
                    else RGBColor(248, 113, 113) if direction == "down"
                    else COLOR_SUBTLE
                )
                if change:
                    add_text(slide, change, x + 0.15, 2.7, card_w - 0.4, 0.4,
                             font_size=11, bold=True, color=change_color)

        # Insights
        insights = section.get("insights", [])
        if insights:
            slide2 = blank_slide()
            add_rect(slide2, 0, 0, 13.33, 0.08, COLOR_ACCENT)
            add_text(slide2, f"{section.get('name', '')} — Insights",
                     0.6, 0.3, 12, 0.6, font_size=16, bold=True, color=COLOR_ACCENT)
            y = 1.3
            for insight in insights[:6]:
                add_rect(slide2, 0.6, y, 0.06, 0.35, COLOR_PURPLE)
                add_text(slide2, insight, 0.85, y, 11, 0.5,
                         font_size=13, color=COLOR_TEXT)
                y += 0.75

        # Charts (descritivos, sem imagem real)
        charts = section.get("charts", [])
        if charts:
            slide3 = blank_slide()
            add_rect(slide3, 0, 0, 13.33, 0.08, COLOR_ACCENT)
            add_text(slide3, f"{section.get('name', '')} — Gráficos",
                     0.6, 0.3, 12, 0.6, font_size=16, bold=True, color=COLOR_ACCENT)
            y = 1.3
            for chart in charts[:4]:
                add_rect(slide3, 0.6, y, 12.1, 0.8, RGBColor(16, 16, 22))
                label = f"[{chart.get('type','').upper()}] {chart.get('title','')}  —  {chart.get('description','')}"
                add_text(slide3, label, 0.75, y + 0.1, 11.8, 0.6,
                         font_size=10, color=COLOR_TEXT)
                y += 1.0

    # Slide final
    slide = blank_slide()
    add_rect(slide, 0, 0, 13.33, 7.5, COLOR_BG)
    add_rect(slide, 0, 0, 0.08, 7.5, COLOR_PURPLE)
    if dashboard.get("summary"):
        add_text(slide, dashboard["summary"], 0.5, 1.5, 12, 2.5,
                 font_size=16, color=COLOR_TEXT)
    add_text(slide, "Projeto criado com sucesso! ✓",
             0.5, 4.5, 12, 1, font_size=28, bold=True, color=COLOR_ACCENT)
    add_text(slide, "DashCreator AI · Powered by Claude (Anthropic)",
             0.5, 6.5, 12, 0.5, font_size=9, color=COLOR_SUBTLE)

    buf = io.BytesIO()
    prs.save(buf)
    buf.seek(0)
    return buf.read()
