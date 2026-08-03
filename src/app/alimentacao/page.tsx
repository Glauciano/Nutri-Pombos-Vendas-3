"use client";

import { useState, useEffect } from "react";
import { Bird, Apple, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Pombo {
  id: number;
  anilha: string;
  nome?: string;
  sexo: string;
}

interface Racao {
  id: number;
  nome: string;
  tipo: string;
}

export default function AlimentacaoPage() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [racoes, setRacoes] = useState<Racao[]>([]);
  const [selectedPomboId, setSelectedPomboId] = useState<number | null>(null);
  const [selectedRacaoId, setSelectedRacaoId] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState(30);
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/pombos").then(r => r.json()).then(setPombos);
    fetch("/api/racoes").then(r => r.json()).then(setRacoes);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPomboId || !selectedRacaoId) {
      setMessage("Selecione um pombo e uma ração");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const res = await fetch("/api/alimentacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pomboId: selectedPomboId,
        racaoId: selectedRacaoId,
        quantidadeG: quantidade,
        observacoes: observacoes || undefined,
      }),
    });

    if (res.ok) {
      setMessage("✅ Alimentação registrada com sucesso!");
      setSelectedPomboId(null);
      setSelectedRacaoId(null);
      setQuantidade(30);
      setObservacoes("");
    } else {
      setMessage("Erro ao registrar. Tente novamente.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-b px-8 py-6 flex items-center gap-4 sticky top-0 z-10">
          <Link href="/" className="text-slate-400 hover:text-emerald-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de Alimentação</h1>
            <p className="text-sm text-slate-500">Controle preciso do que cada pombo come</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Seleção de Pombo */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
                <Bird className="w-5 h-5" /> Qual pombo está sendo alimentado?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {pombos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPomboId(p.id)}
                    className={`p-6 rounded-3xl border text-left transition-all hover:shadow-sm ${
                      selectedPomboId === p.id 
                        ? "border-emerald-600 bg-emerald-50 shadow-sm" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="font-mono text-xl font-semibold text-slate-900">{p.anilha}</div>
                    <div className="text-sm text-slate-500 mt-1 line-clamp-1">{p.nome || "—"}</div>
                    <div className="text-[10px] mt-4 uppercase tracking-widest text-slate-400">
                      {p.sexo === "macho" ? "Macho" : "Fêmea"}
                    </div>
                  </button>
                ))}
              </div>
              {pombos.length === 0 && (
                <p className="text-amber-600 text-sm mt-3">Cadastre pombos primeiro na aba &quot;Meus Pombos&quot;</p>
              )}
            </div>

            {/* Seleção de Ração */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-4 flex items-center gap-2">
                <Apple className="w-5 h-5" /> Qual ração?
              </label>
              <div className="flex flex-wrap gap-3">
                {racoes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRacaoId(r.id)}
                    className={`px-7 py-4 rounded-2xl border text-sm transition-all ${
                      selectedRacaoId === r.id 
                        ? "bg-emerald-600 text-white border-emerald-600" 
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {r.nome}
                    <span className="block text-[10px] opacity-70 mt-0.5">{r.tipo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">Quantidade (gramas)</label>
              <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-3xl px-8 py-6">
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
                <div className="w-24 text-center">
                  <div className="text-6xl font-semibold tabular-nums text-slate-900">{quantidade}</div>
                  <div className="text-xs -mt-1 text-slate-400">GRAMAS</div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                <div>5g</div>
                <div>80g</div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Observações (opcional)</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 focus:border-emerald-300 rounded-3xl px-6 py-5 text-sm resize-y min-h-[110px]"
                placeholder="Comeu bem? Sobrou ração? Alguma observação importante..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedPomboId || !selectedRacaoId}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-3xl flex items-center justify-center gap-3 text-lg active:scale-[0.985] transition-all shadow-lg shadow-emerald-200"
            >
              <Save className="w-6 h-6" />
              {isSubmitting ? "REGISTRANDO..." : "REGISTRAR ALIMENTAÇÃO"}
            </button>

            {message && (
              <div className={`text-center py-4 rounded-2xl text-sm font-medium ${message.includes("sucesso") ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
