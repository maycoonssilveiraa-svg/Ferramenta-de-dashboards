"""
Agente de IA — DashCreator
Usa o Claude (Anthropic) para interpretar o pedido do usuário
e gerar uma estrutura de dashboard em JSON.
"""

import os
import json
import anthropic
from typing import Optional

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """Você é o DashCreator AI, um especialista em análise de dados e visualização para o segmento de publicidade e marketing digital.

Você recebe:
1. Uma descrição dos dados disponíveis (colunas, amostra, estatísticas)
2. Um pedido em linguagem natural do que o usuário quer ver no dashboard

Você deve retornar APENAS um JSON válido (sem markdown, sem explicações) com a estrutura do dashboard.

## Fontes de dados suportadas
- Google Analytics, Meta Ads, Google Ads, TikTok Ads, Spotify Ads, Ibope Monitor, planilhas genéricas

## Frentes de análise disponíveis
- Concorrência: share of voice, investimento, presença
- Campanhas online: CTR, CPC, CPM, ROAS, impressões, cliques, conversões
- Campanhas offline: GRP, reach, cobertura, frequência
- Drops: análise de lançamentos, picos de performance

## Estrutura JSON esperada

```json
{
  "title": "Título do Dashboard",
  "subtitle": "Subtítulo ou contexto",
  "brand": "Nome da empresa/marca",
  "period": "Período analisado",
  "theme": "dark|light",
  "sections": [
    {
      "id": "section_id",
      "name": "Nome da Seção",
      "type": "overview|awareness|performance|competition|drops",
      "big_numbers": [
        {
          "label": "Impressões Totais",
          "value": "1.2M",
          "raw_value": 1200000,
          "change": "+12%",
          "change_direction": "up|down|neutral",
          "icon": "eye|click|money|percent|trending|users",
          "color": "blue|green|red|purple|orange|yellow"
        }
      ],
      "charts": [
        {
          "id": "chart_1",
          "type": "line|bar|pie|donut|area|scatter|funnel",
          "title": "Título do gráfico",
          "description": "O que este gráfico mostra",
          "x_axis": "Nome do eixo X",
          "y_axis": "Nome do eixo Y",
          "data": [
            {"name": "Jan", "value": 1200, "value2": 800, "category": "Meta"}
          ],
          "colors": ["#00D4FF", "#7B2FFF", "#FF6B6B"],
          "show_legend": true,
          "show_grid": true
        }
      ],
      "insights": [
        "Insight 1 baseado nos dados",
        "Insight 2 baseado nos dados"
      ],
      "recommendations": [
        "Recomendação estratégica 1"
      ]
    }
  ],
  "summary": "Resumo executivo do dashboard em 2-3 frases"
}
```

## Regras
- Gere dados REALISTAS e coerentes com o contexto da publicidade
- Se não houver dados reais nas planilhas, gere dados de exemplo plausíveis
- Sempre inclua pelo menos 3 big numbers por seção
- Sempre inclua pelo menos 1 gráfico por seção
- Insights devem ser específicos e acionáveis
- Use português brasileiro
- Retorne APENAS o JSON, sem mais nada
"""


def generate_dashboard(
    user_prompt: str,
    data_summary: Optional[dict] = None,
    conversation_history: Optional[list] = None,
) -> dict:
    """
    Gera a estrutura do dashboard com base no prompt do usuário
    e no resumo dos dados disponíveis.

    Args:
        user_prompt: O pedido do usuário em linguagem natural
        data_summary: Resumo dos dados da planilha (opcional)
        conversation_history: Histórico para edições iterativas

    Returns:
        dict: Estrutura completa do dashboard
    """

    # Monta o contexto de dados
    data_context = ""
    if data_summary:
        data_context = f"""
## Dados disponíveis
- Fonte: {data_summary.get('source', 'Planilha')}
- Linhas: {data_summary.get('rows', 0)}
- Colunas: {', '.join(data_summary.get('all_columns', []))}

### Amostra dos dados (primeiras linhas):
{json.dumps(data_summary.get('sample', [])[:5], ensure_ascii=False, indent=2)}

### Estatísticas numéricas:
{json.dumps(data_summary.get('statistics', {}), ensure_ascii=False, indent=2)}
"""

    # Monta mensagens
    messages = conversation_history or []

    user_message = f"""
{data_context}

## Pedido do usuário:
{user_prompt}

Gere o JSON do dashboard agora.
"""

    messages.append({"role": "user", "content": user_message})

    # Chama a API Claude
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    response_text = response.content[0].text.strip()

    # Remove blocos markdown caso apareçam
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    dashboard_json = json.loads(response_text)

    return {
        "dashboard": dashboard_json,
        "assistant_message": response_text,
        "usage": {
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
        },
    }


def refine_dashboard(
    current_dashboard: dict,
    user_request: str,
    conversation_history: list,
) -> dict:
    """
    Refina um dashboard existente com base em um pedido de ajuste.

    Args:
        current_dashboard: Dashboard atual (JSON)
        user_request: O que o usuário quer mudar
        conversation_history: Histórico da conversa

    Returns:
        dict: Dashboard atualizado
    """
    refine_message = f"""
## Dashboard atual:
{json.dumps(current_dashboard, ensure_ascii=False, indent=2)}

## Ajuste solicitado:
{user_request}

Retorne o dashboard COMPLETO atualizado em JSON (não apenas as partes alteradas).
"""

    conversation_history.append({"role": "user", "content": refine_message})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=conversation_history,
    )

    response_text = response.content[0].text.strip()

    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    updated_dashboard = json.loads(response_text)

    # Adiciona resposta ao histórico
    conversation_history.append({"role": "assistant", "content": response_text})

    return {
        "dashboard": updated_dashboard,
        "assistant_message": response_text,
        "usage": {
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
        },
    }
