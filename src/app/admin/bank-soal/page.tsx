"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Database,
  Plus,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  HelpCircle,
  X,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

interface Option {
  id?: string;
  optionLabel: string;
  optionText: string;
  score: number;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  subtest: "TWK" | "TIU" | "TKP";
  topic: string;
  subTopic?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "HOTS";
  questionText: string;
  questionImage?: string | null;
  discussionText: string;
  discussionImage?: string | null;
  isVerified: boolean;
  options: Option[];
  createdAt: string;
}

export default function BankSoalAdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [selectedSubtest, setSelectedSubtest] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Form State for Create/Edit
  const [formSubtest, setFormSubtest] = useState<"TWK" | "TIU" | "TKP">("TWK");
  const [formTopic, setFormTopic] = useState("");
  const [formSubTopic, setFormSubTopic] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"EASY" | "MEDIUM" | "HARD" | "HOTS">("MEDIUM");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formDiscussionText, setFormDiscussionText] = useState("");
  const [formOptions, setFormOptions] = useState<Option[]>([
    { optionLabel: "A", optionText: "", score: 5, isCorrect: true },
    { optionLabel: "B", optionText: "", score: 0, isCorrect: false },
    { optionLabel: "C", optionText: "", score: 0, isCorrect: false },
    { optionLabel: "D", optionText: "", score: 0, isCorrect: false },
    { optionLabel: "E", optionText: "", score: 0, isCorrect: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubtest !== "ALL") params.set("subtest", selectedSubtest);
      if (selectedDifficulty !== "ALL") params.set("difficulty", selectedDifficulty);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setQuestions(json.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubtest, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const resetForm = () => {
    setFormSubtest("TWK");
    setFormTopic("");
    setFormSubTopic("");
    setFormDifficulty("MEDIUM");
    setFormQuestionText("");
    setFormDiscussionText("");
    setFormOptions([
      { optionLabel: "A", optionText: "", score: 5, isCorrect: true },
      { optionLabel: "B", optionText: "", score: 0, isCorrect: false },
      { optionLabel: "C", optionText: "", score: 0, isCorrect: false },
      { optionLabel: "D", optionText: "", score: 0, isCorrect: false },
      { optionLabel: "E", optionText: "", score: 0, isCorrect: false },
    ]);
    setFormError("");
  };

  const handleSubtestChange = (sub: "TWK" | "TIU" | "TKP") => {
    setFormSubtest(sub);
    if (sub === "TKP") {
      // Initialize with 5, 4, 3, 2, 1 scale
      setFormOptions([
        { optionLabel: "A", optionText: "", score: 5, isCorrect: false },
        { optionLabel: "B", optionText: "", score: 4, isCorrect: false },
        { optionLabel: "C", optionText: "", score: 3, isCorrect: false },
        { optionLabel: "D", optionText: "", score: 2, isCorrect: false },
        { optionLabel: "E", optionText: "", score: 1, isCorrect: false },
      ]);
    } else {
      // 0 or 5 for TWK/TIU
      setFormOptions([
        { optionLabel: "A", optionText: "", score: 5, isCorrect: true },
        { optionLabel: "B", optionText: "", score: 0, isCorrect: false },
        { optionLabel: "C", optionText: "", score: 0, isCorrect: false },
        { optionLabel: "D", optionText: "", score: 0, isCorrect: false },
        { optionLabel: "E", optionText: "", score: 0, isCorrect: false },
      ]);
    }
  };

  const handleCorrectRadioChange = (label: string) => {
    setFormOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.optionLabel === label,
        score: opt.optionLabel === label ? 5 : 0,
      }))
    );
  };

  const handleTkpScoreChange = (label: string, score: number) => {
    setFormOptions((prev) =>
      prev.map((opt) => (opt.optionLabel === label ? { ...opt, score } : opt))
    );
  };

  const handleOptionTextChange = (label: string, text: string) => {
    setFormOptions((prev) =>
      prev.map((opt) => (opt.optionLabel === label ? { ...opt, optionText: text } : opt))
    );
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTopic.trim() || !formQuestionText.trim()) {
      setFormError("Topik materi dan teks soal wajib diisi.");
      return;
    }

    const emptyOpt = formOptions.find((o) => !o.optionText.trim());
    if (emptyOpt) {
      setFormError(`Teks opsi pilihan ${emptyOpt.optionLabel} belum diisi.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtest: formSubtest,
          topic: formTopic,
          subTopic: formSubTopic || null,
          difficulty: formDifficulty,
          questionText: formQuestionText,
          discussionText: formDiscussionText,
          options: formOptions,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan butir soal");
      }

      setIsAddModalOpen(false);
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus butir soal ini dari bank soal?")) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      alert("Gagal menghapus soal");
    }
  };

  const getSubtestBadge = (sub: string) => {
    switch (sub) {
      case "TWK":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
      case "TIU":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "TKP":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "HARD":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "HOTS":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-bold";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Master Bank Soal & Editor CAT BKN
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola butir soal SKD Kedinasan & CPNS dengan pembobotan 0/5 (TWK, TIU) dan 1-5 (TKP).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-interactive inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import (JSON/Excel)
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Butir Soal
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subtest Segmented Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 text-xs overflow-x-auto">
          {[
            { id: "ALL", label: "Semua Subtes" },
            { id: "TWK", label: "TWK (Wawasan Kebangsaan)" },
            { id: "TIU", label: "TIU (Intelegensia Umum)" },
            { id: "TKP", label: "TKP (Karakteristik Pribadi)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubtest(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                selectedSubtest === tab.id
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side: Difficulty selector & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Semua Tingkat Kesulitan</option>
            <option value="EASY">Mudah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HARD">Sulit</option>
            <option value="HOTS">HOTS (Analisis Tinggi)</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari materi / kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-48 sm:w-60 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-400">Memuat katalog bank soal CAT...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Tidak ada butir soal yang sesuai</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter subtes, tingkat kesulitan, atau kata kunci pencarian Anda.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 w-28">Subtes</th>
                  <th className="py-3 px-4 w-44">Topik Materi</th>
                  <th className="py-3 px-4">Teks Cuplikan Soal</th>
                  <th className="py-3 px-4 w-32">Kunci / Bobot</th>
                  <th className="py-3 px-4 w-24">Tingkat</th>
                  <th className="py-3 px-4 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {questions.map((q) => {
                  const correctOpt = q.options.find((o) => o.isCorrect || o.score === 5);
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSubtestBadge(q.subtest)}`}>
                          {q.subtest}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        <div className="truncate max-w-[170px]" title={q.topic}>
                          {q.topic}
                        </div>
                        {q.subTopic && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[170px]">
                            {q.subTopic}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div
                          onClick={() => setPreviewQuestion(q)}
                          className="line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                          title="Klik untuk pratinjau lengkap"
                        >
                          {q.questionText}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {q.subtest === "TKP" ? (
                          <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                            Skala 1 - 5 Poin
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            Opsi {correctOpt?.optionLabel || "A"} (5 Poin)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewQuestion(q)}
                            title="Pratinjau Soal & Pembahasan"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Hapus Butir Soal"
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tambah Butir Soal Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Tambah Butir Soal Baru (Editor CAT BKN)
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-600 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitQuestion} className="space-y-4 text-xs">
              {/* Row 1: Subtest, Difficulty & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subtes CAT *
                  </label>
                  <select
                    value={formSubtest}
                    onChange={(e) => handleSubtestChange(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="TWK">TWK (Wawasan Kebangsaan)</option>
                    <option value="TIU">TIU (Intelegensia Umum)</option>
                    <option value="TKP">TKP (Karakteristik Pribadi)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Kesulitan *
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="EASY">Mudah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HARD">Sulit</option>
                    <option value="HOTS">HOTS (Higher Order Thinking)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Topik Materi *
                  </label>
                  <input
                    type="text"
                    placeholder="cth: Silogisme Posisi"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Teks Soal */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teks Butir Soal *
                </label>
                <textarea
                  rows={4}
                  placeholder="Ketik narasi pertanyaan atau soal studi kasus di sini..."
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Opsi Jawaban & Skor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Opsi Jawaban & Bobot Nilai (A s/d E) *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formSubtest === "TKP"
                      ? "Mode TKP: Tentukan skor 1 s/d 5 untuk masing-masing opsi."
                      : "Mode TWK/TIU: Pilih radio button opsi kunci benar (5 poin, lainnya 0 poin)."}
                  </span>
                </div>

                <div className="space-y-2 border border-slate-200 dark:border-white/10 p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02]">
                  {formOptions.map((opt) => (
                    <div key={opt.optionLabel} className="flex items-center gap-2">
                      {formSubtest !== "TKP" && (
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => handleCorrectRadioChange(opt.optionLabel)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          title="Tandai sebagai kunci jawaban benar"
                        />
                      )}

                      <span className="w-6 font-bold text-center text-slate-700 dark:text-slate-300">
                        {opt.optionLabel}.
                      </span>

                      <input
                        type="text"
                        placeholder={`Teks pilihan ${opt.optionLabel}...`}
                        value={opt.optionText}
                        onChange={(e) => handleOptionTextChange(opt.optionLabel, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      {formSubtest === "TKP" ? (
                        <div className="flex items-center gap-1 w-24">
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={opt.score}
                            onChange={(e) =>
                              handleTkpScoreChange(opt.optionLabel, parseInt(e.target.value, 10) || 1)
                            }
                            className="w-14 px-2 py-1.5 text-center bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg font-bold text-purple-600"
                          />
                          <span className="text-[10px] text-slate-400">Poin</span>
                        </div>
                      ) : (
                        <span className="w-16 text-right font-bold text-[11px] text-slate-500">
                          {opt.isCorrect ? "5 Poin" : "0 Poin"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pembahasan */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ulasan & Teks Pembahasan Lengkap
                </label>
                <textarea
                  rows={3}
                  placeholder="Uraikan alasan kunci jawaban, teori hukum/pancasila, atau rumus perhitungan matematis..."
                  value={formDiscussionText}
                  onChange={(e) => setFormDiscussionText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-interactive px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pratinjau Butir Soal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSubtestBadge(previewQuestion.subtest)}`}>
                  {previewQuestion.subtest}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  {previewQuestion.topic}
                </span>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/60 dark:border-white/10">
              {previewQuestion.questionText}
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-slate-600 dark:text-slate-400">Pilihan Jawaban:</p>
              {previewQuestion.options.map((opt) => (
                <div
                  key={opt.optionLabel}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    opt.isCorrect || opt.score === 5
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-semibold"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{opt.optionLabel}.</span>
                    <span>{opt.optionText}</span>
                  </div>
                  <span className="text-[11px] font-bold opacity-80">
                    {opt.score} Poin
                  </span>
                </div>
              ))}
            </div>

            {previewQuestion.discussionText && (
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs space-y-1 text-blue-900 dark:text-blue-300">
                <p className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  Kunci & Ulasan Pembahasan:
                </p>
                <p className="leading-relaxed">{previewQuestion.discussionText}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white/10 text-xs font-bold"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Excel/JSON */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Import Soal Masal (Excel / JSON)
              </h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 text-center space-y-2 bg-slate-50 dark:bg-white/5">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Tarik & letakkan file template Excel (.xlsx) atau JSON
              </p>
              <p className="text-[11px] text-slate-400">
                Format tabel: Subtes, Topik, Soal, Opsi A-E, Kunci, Bobot TKP, Pembahasan.
              </p>
              <button
                onClick={() => {
                  alert("Template Excel standar CAT BKN telah disiapkan. Upload file CSV/XLSX untuk memproses batch.");
                  setIsImportModalOpen(false);
                }}
                className="btn-interactive mt-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Unduh Template Excel (.xlsx)
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

