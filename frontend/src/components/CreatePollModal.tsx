"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { createPollOnChain, TransactionStatus } from "@/lib/contract";
import { createStoredPoll, Poll } from "@/lib/pollStore";
import { TransactionStatusBadge } from "./TransactionStatus";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: (newPoll: Poll) => void;
}

export function CreatePollModal({
  isOpen,
  onClose,
  onPollCreated,
}: CreatePollModalProps) {
  const { address, isConnected, signTransaction } = useWallet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<
    "Governance" | "Community" | "Grants" | "Tech" | "General"
  >("Governance");
  const [options, setOptions] = useState<string[]>([
    "Setuju / Ya",
    "Tolak / Tidak",
  ]);
  const [durationDays, setDurationDays] = useState(7);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, `Opsi ${options.length + 1}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const next = [...options];
    next[index] = val;
    setOptions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    if (!title.trim() || !description.trim()) {
      setErrorMessage("Mohon isi judul dan deskripsi voting.");
      return;
    }

    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) {
      setErrorMessage("Minimal harus ada 2 opsi pilihan.");
      return;
    }

    setTxStatus("building");
    setErrorMessage(null);

    try {
      setTxStatus("signing");
      await createPollOnChain(address, cleanedOptions.length, signTransaction);
      setTxStatus("submitting");

      // Save to local registry and sync
      const newPoll = createStoredPoll({
        creator: address,
        creatorAlias: `${address.slice(0, 4)}...${address.slice(-4)}`,
        title: title.trim(),
        description: description.trim(),
        category,
        options: cleanedOptions,
        durationDays,
      });

      setTxStatus("success");
      setTimeout(() => {
        onPollCreated(newPoll);
        onClose();
        // Reset form
        setTitle("");
        setDescription("");
        setOptions(["Setuju / Ya", "Tolak / Tidak"]);
        setTxStatus("idle");
      }, 1000);
    } catch (err) {
      setTxStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal membuat voting on-chain"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-[11px] font-semibold text-brand-300">
            <span>⚡ Permissionless Creation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Buat Voting Baru
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Luncurkan voting Anda ke ledger Stellar Soroban. Siapa pun pemegang SBT dapat ikut berpartisipasi.
          </p>
        </div>

        {!isConnected ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <p className="text-sm text-slate-300">
              Anda harus menghubungkan wallet Freighter untuk membuat voting baru.
            </p>
            <p className="text-xs text-slate-500">
              Setiap pembuatan voting terdaftar secara permanen di blockchain.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Judul Voting / Proposal *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Upgrade Protokol v22 atau Pemilihan Ketua Komunitas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Category & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as
                        | "Governance"
                        | "Community"
                        | "Grants"
                        | "Tech"
                        | "General"
                    )
                  }
                  className="input-field"
                >
                  <option value="Governance">🏛️ Governance (Tata Kelola)</option>
                  <option value="Grants">💰 Grants & Funding</option>
                  <option value="Tech">⚙️ Tech & Development</option>
                  <option value="Community">👥 Komunitas & Acara</option>
                  <option value="General">🗳️ Umum / Jajak Pendapat</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Durasi Voting *
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={1}>1 Hari (Cepat)</option>
                  <option value={3}>3 Hari</option>
                  <option value={7}>7 Hari (Standar)</option>
                  <option value={14}>14 Hari (2 Minggu)</option>
                  <option value={30}>30 Hari (1 Bulan)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Deskripsi & Konteks Proposal *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jelaskan latar belakang, tujuan voting, dan dampak dari pilihan yang tersedia..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Options List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Opsi Pilihan ({options.length}/8) *
                </label>
                {options.length < 8 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-semibold text-brand-300 hover:text-brand-200 flex items-center gap-1"
                  >
                    <span>+ Tambah Opsi</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300 shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Nama Opsi ${idx + 1}`}
                      className="input-field py-2 text-xs"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
                        title="Hapus opsi"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={
                  txStatus === "building" ||
                  txStatus === "signing" ||
                  txStatus === "submitting"
                }
                className="btn-primary w-full py-3 text-sm font-bold shadow-cyan-500/25"
              >
                {txStatus === "building" && "Membangun Transaksi On-Chain..."}
                {txStatus === "signing" && "Menunggu Tanda Tangan Freighter..."}
                {txStatus === "submitting" && "Mendaftarkan ke Stellar Soroban..."}
                {txStatus === "idle" && "Luncurkan Voting On-Chain 🚀"}
                {txStatus === "success" && "Voting Berhasil Dibuat! ✓"}
                {txStatus === "error" && "Coba Lagi"}
              </button>

              <TransactionStatusBadge status={txStatus} error={errorMessage} />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
