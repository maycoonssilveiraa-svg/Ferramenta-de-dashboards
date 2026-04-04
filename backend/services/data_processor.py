"""
Serviço de processamento de dados.
Suporta: xlsx, csv, Google Sheets
"""

import io
import json
import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
from typing import Optional
import os


def parse_file(file_bytes: bytes, filename: str) -> dict:
    """
    Faz o parse de um arquivo xlsx ou csv e retorna
    um resumo estruturado dos dados.
    """
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "csv":
        df = pd.read_csv(io.BytesIO(file_bytes))
    elif ext in ("xlsx", "xlsm"):
        df = pd.read_excel(io.BytesIO(file_bytes), engine="openpyxl")
    elif ext == "xls":
        df = pd.read_excel(io.BytesIO(file_bytes), engine="xlrd")
    else:
        raise ValueError(f"Formato não suportado: {ext}")

    return _summarize_dataframe(df, filename)


def parse_google_sheets(sheet_url: str) -> dict:
    """
    Lê uma Google Sheet pública ou autenticada e retorna
    um resumo estruturado dos dados.
    """
    # Tenta acesso público via CSV export URL
    if "spreadsheets/d/" in sheet_url:
        sheet_id = sheet_url.split("spreadsheets/d/")[1].split("/")[0]
        csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
        df = pd.read_csv(csv_url)
        return _summarize_dataframe(df, f"Google Sheets ({sheet_id[:8]}...)")

    raise ValueError("URL do Google Sheets inválida. Use o link de compartilhamento.")


def _summarize_dataframe(df: pd.DataFrame, source_name: str) -> dict:
    """
    Gera um resumo do DataFrame para enviar ao agente de IA.
    Inclui: colunas, tipos, amostra e estatísticas básicas.
    """
    # Limpa colunas
    df.columns = [str(c).strip() for c in df.columns]
    df = df.dropna(how="all")

    # Estatísticas numéricas
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    stats = {}
    if numeric_cols:
        desc = df[numeric_cols].describe().round(2)
        stats = desc.to_dict()

    # Amostra (primeiras 10 linhas)
    sample = df.head(10).fillna("").to_dict(orient="records")

    # Colunas com tipos
    column_info = []
    for col in df.columns:
        col_type = str(df[col].dtype)
        unique_count = df[col].nunique()
        null_count = int(df[col].isna().sum())
        column_info.append({
            "name": col,
            "type": col_type,
            "unique_values": unique_count,
            "null_count": null_count,
        })

    return {
        "source": source_name,
        "rows": len(df),
        "columns": column_info,
        "sample": sample,
        "statistics": stats,
        "numeric_columns": numeric_cols,
        "all_columns": df.columns.tolist(),
    }
