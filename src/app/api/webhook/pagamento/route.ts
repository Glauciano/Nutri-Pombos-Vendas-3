import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/db";
import { usuarios } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Webhook / Notificação de Pagamento (Asaas, Mercado Pago, Kiwify, Hotmart)
 * URL de destino na plataforma de cobrança: https://SEU-APP.vercel.app/api/webhook/pagamento
 */
export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Banco de dados não configurado" }, { status: 503 });
  }

  try {
    const body = await request.json();

    // Compatibilidade com diferentes gateways brasileiras (Mercado Pago, Kiwify, Hotmart, Asaas)
    const email = String(
      body.email ||
      body.customer_email ||
      body.Customer?.Email ||
      body.data?.customer?.email ||
      ""
    ).trim().toLowerCase();

    const status = String(
      body.status ||
      body.payment_status ||
      body.data?.status ||
      "approved"
    ).trim().toLowerCase();

    const planoRecebido = String(
      body.plano ||
      body.plan ||
      body.product_name ||
      "mensal"
    ).trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "E-mail não informado no webhook" }, { status: 400 });
    }

    // Apenas pagamentos aprovados / confirmados
    const isAprovado = status === "approved" || status === "paid" || status === "confirmed" || status === "success";

    if (!isAprovado) {
      // Se pagamento cancelado ou estornado, suspender acesso
      if (status === "cancelled" || status === "refunded" || status === "overdue") {
        await db.update(usuarios).set({ acessoAtivo: false }).where(eq(usuarios.email, email));
        return NextResponse.json({ ok: true, status: "acesso_suspenso", email });
      }
      return NextResponse.json({ ok: true, status: "ignorado", motivo: status });
    }

    // Definir plano e data de expiração
    let planoAcesso: "teste" | "mensal" | "anual" | "vitalicio" | "admin" = "anual";
    let diasAcesso = 365;

    if (planoRecebido.includes("mensal") || planoRecebido.includes("mês") || planoRecebido.includes("mes")) {
      planoAcesso = "mensal";
      diasAcesso = 35; // 30 dias + 5 dias de carência
    } else if (planoRecebido.includes("vitalicio") || planoRecebido.includes("forever")) {
      planoAcesso = "vitalicio";
      diasAcesso = 3650; // 10 anos
    }

    const acessoAte = new Date(Date.now() + diasAcesso * 86_400_000);

    // Verificar se usuário existe no banco
    const [existente] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1);

    if (existente) {
      // Atualizar plano do usuário existente
      await db.update(usuarios).set({
        plano: planoAcesso,
        acessoAtivo: true,
        acessoAte: acessoAte,
        updatedAt: new Date(),
      }).where(eq(usuarios.id, existente.id));

      return NextResponse.json({
        ok: true,
        acao: "assinatura_renovada",
        email,
        plano: planoAcesso,
        validade: acessoAte.toISOString(),
      });
    } else {
      // Se o cliente pagou antes de criar conta, podemos criar automaticamente ou aguardar cadastro
      return NextResponse.json({
        ok: true,
        acao: "aguardando_cadastro",
        email,
        mensagem: "Cliente pagou com sucesso. Ao se cadastrar com este e-mail, receberá o plano " + planoAcesso,
      });
    }
  } catch (err: any) {
    console.error("Erro no Webhook de pagamento:", err);
    return NextResponse.json({ error: "Falha ao processar webhook" }, { status: 500 });
  }
}
