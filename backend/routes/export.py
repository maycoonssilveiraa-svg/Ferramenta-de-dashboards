"""
Route: /api/export
Exporta o dashboard em diferentes formatos:
HTML, PDF, PowerPoint (pptx)
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Literal

from services.exporter import export_html, export_pptx

router = APIRouter()


class ExportRequest(BaseModel):
    dashboard: dict
    format: Literal["html", "pdf", "pptx"]


@router.post("/")
async def export(body: ExportRequest):
    """
    Exporta o dashboard no formato solicitado.

    Formats:
    - html  → arquivo HTML standalone com Chart.js
    - pdf   → PDF gerado a partir do HTML
    - pptx  → Apresentação PowerPoint
    """
    if not body.dashboard:
        raise HTTPException(status_code=400, detail="Dashboard não fornecido.")

    title = body.dashboard.get("title", "dashboard").replace(" ", "_").lower()

    try:
        if body.format == "html":
            content = export_html(body.dashboard)
            return Response(
                content=content,
                media_type="text/html",
                headers={
                    "Content-Disposition": f'attachment; filename="{title}.html"'
                },
            )

        elif body.format == "pptx":
            content = export_pptx(body.dashboard)
            return Response(
                content=content,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={
                    "Content-Disposition": f'attachment; filename="{title}.pptx"'
                },
            )

        elif body.format == "pdf":
            # PDF gerado via HTML + WeasyPrint
            try:
                from weasyprint import HTML as WeasyprintHTML
                html_content = export_html(body.dashboard).decode("utf-8")
                pdf_bytes = WeasyprintHTML(string=html_content).write_pdf()
                return Response(
                    content=pdf_bytes,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f'attachment; filename="{title}.pdf"'
                    },
                )
            except ImportError:
                raise HTTPException(
                    status_code=501,
                    detail="WeasyPrint não instalado. Use o formato HTML e converta para PDF no navegador (Ctrl+P)."
                )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao exportar: {str(e)}"
        )
