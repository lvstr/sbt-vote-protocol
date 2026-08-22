"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { createPollOnChain, TransactionStatus } from "@/lib/contract";
import { createStoredPoll, Poll } from "@/lib/pollStore";
import { TransactionStatusBadge } from "./TransactionStatus";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: (newPoll: Poll) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onClose,
  onPollCreated,
}) => {
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
        setTitle("");
        setDescription("");
        setOptions(["Setuju / Ya", "Tolak / Tidak"]);
        setTxStatus("idle");
      }, 800);
    } catch (err) {
      setTxStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal membuat voting on-chain"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="app-panel w-full max-w-xl p-6 sm:p-7 space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6">
          <h2 className="text-xl font-bold text-white">
            Buat Voting Baru
          </h2>
          <p className="text-xs text-slate-400">
            Luncurkan proposal baru ke blockchain Stellar. Setiap pemegang SBT dapat memberikan 1 suara.
          </p>
        </div>

        {!isConnected ? (
          <div className="p-6 text-center bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <p className="text-xs text-slate-300">
              Hubungkan wallet Freighter Anda terlebih dahulu untuk membuat proposal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Judul Proposal *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Alokasi Dana Komunitas untuk Ekosistem"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Category & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
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
                  <option value="Governance">Governance (Tata Kelola)</option>
                  <option value="Grants">Grants & Funding</option>
                  <option value="Tech">Tech & Development</option>
                  <option value="Community">Komunitas & Acara</option>
                  <option value="General">Umum</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Durasi Voting *
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={1}>1 Hari</option>
                  <option value={3}>3 Hari</option>
                  <option value={7}>7 Hari (Standar)</option>
                  <option value={14}>14 Hari (2 Minggu)</option>
                  <option value={30}>30 Hari (1 Bulan)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Deskripsi Proposal *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jelaskan rincian proposal, latar belakang, dan tujuan voting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Opsi Pilihan ({options.length}/8) *
                </label>
                {options.length < 8 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    + Tambah Opsi
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Opsi ${idx + 1}`}
                      className="input-field py-1.5 text-xs"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-500 hover:text-red-400 px-2 py-1 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={
                  txStatus === "building" ||
                  txStatus === "signing" ||
                  txStatus === "submitting"
                }
                className="btn-primary w-full py-2.5 font-medium"
              >
                {txStatus === "building" && "Membangun Transaksi..."}
                {txStatus === "signing" && "Menunggu Tanda Tangan Freighter..."}
                {txStatus === "submitting" && "Mengirim ke Blockchain Stellar..."}
                {txStatus === "idle" && "Luncurkan Voting On-Chain"}
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
};

export default CreatePollModal;
