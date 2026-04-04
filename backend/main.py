"""
DashCreator — Backend API
FastAPI + Anthropic Claude
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.upload import router as upload_router
from routes.generate import router as generate_router
from routes.export import router as export_router

load_dotenv()

app = FastAPI(
    title="DashCreator API",
    description="API para geração de dashboards com IA",
    version="1.0.0",
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(generate_router, prefix="/api/generate", tags=["Geração"])
app.include_router(export_router, prefix="/api/export", tags=["Exportação"])


@app.get("/")
def root():
    return {"status": "ok", "app": "DashCreator API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
