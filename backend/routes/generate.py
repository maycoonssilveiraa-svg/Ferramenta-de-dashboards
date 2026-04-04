"""
Route: /api/generate
Recebe o prompt do usuário + dados e gera/refina o dashboard via Claude.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List

from services.ai_agent import generate_dashboard, refine_dashboard

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str
    data_summary: Optional[dict] = None
    conversation_history: Optional[List[dict]] = None


class RefineRequest(BaseModel):
    current_dashboard: dict
    user_request: str
    conversation_history: List[dict] = []


@router.post("/")
async def generate(body: GenerateRequest):
    """
    Gera um dashboard completo a partir de um prompt e dados.

    Body:
    - prompt: O que o usuário quer ver no dashboard
    - data_summary: Resumo dos dados (da rota /upload)
    - conversation_history: Histórico de mensagens anteriores (opcional)
    """
    if not body.prompt or len(body.prompt.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Prompt muito curto. Descreva o dashboard que deseja."
        )

    try:
        result = generate_dashboard(
            user_prompt=body.prompt,
            data_summary=body.data_summary,
            conversation_history=body.conversation_history,
        )
        return JSONResponse(content={"success": True, **result})

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar dashboard: {str(e)}"
        )


@router.post("/refine")
async def refine(body: RefineRequest):
    """
    Refina um dashboard existente com base em um pedido de ajuste.

    Body:
    - current_dashboard: O JSON do dashboard atual
    - user_request: O que o usuário quer mudar
    - conversation_history: Histórico da conversa
    """
    if not body.user_request:
        raise HTTPException(status_code=400, detail="Informe o que deseja ajustar.")

    try:
        result = refine_dashboard(
            current_dashboard=body.current_dashboard,
            user_request=body.user_request,
            conversation_history=body.conversation_history,
        )
        return JSONResponse(content={"success": True, **result})

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao refinar dashboard: {str(e)}"
        )
