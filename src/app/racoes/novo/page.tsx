"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NovaRacao() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("manutencao");
  const [descricao, setDescricao] = useState("");
  const [composicao, setComposicao] = useState("");
  const [precoKg, setPrecoKg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("/api/racoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        tipo,
        descricao,
        composicao,
        precoKg: precoKg ? parseFloat(precoKg) : null,
      }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      alert("Erro ao salvar ração");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto pt-12 px-6">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-8">
          ← Voltar ao início
        </Link>

        <div className="bg-white rounded-3xl shadow p-10">
          <h1 className="text-3xl font-bold mb-2">Nova Ração</h1>
          <p className="text-slate-500 mb-10">Adicione uma nova mistura ao seu estoque nutricional</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm text-slate-600 mb-2">Nome da Ração</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:outline-hidden focus:border-emerald-400"
                placeholder="Ex: Sport Premium"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-2">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:outline-hidden focus:border-emerald-400 bg-white"
              >
                <option value="manutencao">Manutenção</option>
                <option value="reproducao">Reprodução</option>
                <option value="competicao">Competição / Sport</option>
                <option value="muda">Muda de Plumagem</option>
                <option value="depurativa">Depurativa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-2">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-3xl px-5 py-4 focus:outline-hidden focus:border-emerald-400 resize-y"
                placeholder="Ração balanceada rica em proteína para fase de competição..."
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-2">Composição principal</label>
              <input
                type="text"
                value={composicao}
                onChange={(e) => setComposicao(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:outline-hidden focus:border-emerald-400"
                placeholder="Milho 40%, Ervilha 20%, Girassol..."
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-2">Preço por Kg (opcional)</label>
              <div className="relative">
                <span className="absolute left-5 top-4 text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={precoKg}
                  onChange={(e) => setPrecoKg(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl pl-10 pr-5 py-4 focus:outline-hidden focus:border-emerald-400"
                  placeholder="18.90"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 transition"
            >
              <Save className="w-5 h-5" />
              {isLoading ? "SALVANDO..." : "SALVAR RAÇÃO"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
