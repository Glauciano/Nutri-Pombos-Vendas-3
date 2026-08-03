import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { isDbConfigured } from "@/db";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL não configurada nas variáveis de ambiente" }, { status: 503 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        plano TEXT NOT NULL DEFAULT 'teste',
        acesso_ativo BOOLEAN NOT NULL DEFAULT true,
        acesso_ate TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessoes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pombos (
        id SERIAL PRIMARY KEY,
        anilha TEXT NOT NULL UNIQUE,
        nome TEXT,
        sexo TEXT NOT NULL,
        data_nascimento TIMESTAMP,
        cor TEXT,
        pai_id INTEGER,
        mae_id INTEGER,
        status TEXT DEFAULT 'ativo',
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS racoes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        descricao TEXT,
        composicao TEXT,
        preco_kg DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS alimentacoes (
        id SERIAL PRIMARY KEY,
        pombo_id INTEGER NOT NULL REFERENCES pombos(id),
        racao_id INTEGER NOT NULL REFERENCES racoes(id),
        data TIMESTAMP NOT NULL DEFAULT NOW(),
        quantidade_g INTEGER NOT NULL,
        observacoes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS saude (
        id SERIAL PRIMARY KEY,
        pombo_id INTEGER NOT NULL REFERENCES pombos(id),
        data TIMESTAMP NOT NULL DEFAULT NOW(),
        tipo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        medicamento TEXT,
        dosagem TEXT,
        observacoes TEXT
      );
    `;

    await sql`
      INSERT INTO usuarios (nome, email, senha_hash, plano, acesso_ativo)
      VALUES (
        'Admin',
        'admin@nutripombos.com',
        '$2b$10$8TgEZoJNbrw.TWwb.OSUMOcmSQOVyFzjZpSCxx7VVuXodC./sqssW',
        'admin',
        true
      )
      ON CONFLICT (email) DO NOTHING;
    `;

    return NextResponse.json({
      success: true,
      message: "✅ Todas as tabelas e a conta de Admin foram criadas com sucesso no banco de dados PostgreSQL!",
      tabelas: ["usuarios", "sessoes", "pombos", "racoes", "alimentacoes", "saude"],
      adminEmail: "admin@nutripombos.com",
    });
  } catch (error: any) {
    console.error("Erro na criação automática das tabelas:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Erro ao criar tabelas no PostgreSQL",
    }, { status: 500 });
  }
}
