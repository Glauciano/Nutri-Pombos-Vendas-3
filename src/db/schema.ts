import { pgTable, text, serial, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  plano: text("plano", { enum: ["teste", "anual", "vitalicio", "admin"] }).notNull().default("teste"),
  acessoAtivo: boolean("acesso_ativo").notNull().default(true),
  acessoAte: timestamp("acesso_ate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessoes = pgTable("sessoes", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id, { onDelete: "cascade" }).notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pombos = pgTable("pombos", {
  id: serial("id").primaryKey(),
  anilha: text("anilha").notNull().unique(),
  nome: text("nome"),
  sexo: text("sexo", { enum: ["macho", "femea"] }).notNull(),
  dataNascimento: timestamp("data_nascimento"),
  cor: text("cor"),
  paiId: integer("pai_id"),
  maeId: integer("mae_id"),
  status: text("status", { enum: ["ativo", "inativo", "vendido", "morto"] }).default("ativo"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const racoes = pgTable("racoes", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  tipo: text("tipo", { enum: ["manutencao", "reproducao", "competicao", "muda", "depurativa"] }).notNull(),
  descricao: text("descricao"),
  composicao: text("composicao"),
  precoKg: decimal("preco_kg", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alimentacoes = pgTable("alimentacoes", {
  id: serial("id").primaryKey(),
  pomboId: integer("pombo_id").references(() => pombos.id).notNull(),
  racaoId: integer("racao_id").references(() => racoes.id).notNull(),
  data: timestamp("data").defaultNow().notNull(),
  quantidadeG: integer("quantidade_g").notNull(),
  observacoes: text("observacoes"),
});

export const saude = pgTable("saude", {
  id: serial("id").primaryKey(),
  pomboId: integer("pombo_id").references(() => pombos.id).notNull(),
  data: timestamp("data").defaultNow().notNull(),
  tipo: text("tipo", { enum: ["vacina", "vermifugo", "tratamento", "checkup"] }).notNull(),
  descricao: text("descricao").notNull(),
  medicamento: text("medicamento"),
  dosagem: text("dosagem"),
  observacoes: text("observacoes"),
});

export const pombosRelations = relations(pombos, ({ one, many }) => ({
  pai: one(pombos, {
    fields: [pombos.paiId],
    references: [pombos.id],
  }),
  mae: one(pombos, {
    fields: [pombos.maeId],
    references: [pombos.id],
  }),
  alimentacoes: many(alimentacoes),
  registrosSaude: many(saude),
}));

export const alimentacoesRelations = relations(alimentacoes, ({ one }) => ({
  pombo: one(pombos),
  racao: one(racoes),
}));

export const saudeRelations = relations(saude, ({ one }) => ({
  pombo: one(pombos),
}));
