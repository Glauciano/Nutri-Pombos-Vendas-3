import { NextResponse } from "next/server";

/** 🔔 Devolve a chave PÚBLICA VAPID (o cliente precisa dela pra assinar as notificações) */
export async function GET() {
  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
}
