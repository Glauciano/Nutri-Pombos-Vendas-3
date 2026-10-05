import { NextResponse } from "next/server";
import { vapidPublica } from "@/lib/vapid";

/** 🔔 Devolve a chave PÚBLICA VAPID (o cliente precisa dela pra assinar as notificações).
 *  Já sai LIMPA (sem enters/ espaços/ "=") — à prova de colagem errada na Vercel. */
export async function GET() {
  return NextResponse.json({ publicKey: vapidPublica() });
}
