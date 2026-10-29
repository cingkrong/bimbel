import { create } from "zustand";

export interface QuestionOption {
  id: string;
  optionLabel: string;
  optionText: string;
  optionImage: string | null;
}

export interface QuestionItem {
  questionNumber: number;
  questionId: string;
  subtest: "TWK" | "TIU" | "TKP";
  topic: string;
  questionText: string;
  questionImage: string | null;
  options: QuestionOption[];
}

export interface TryoutMeta {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  passingGradeTwk: number;
  passingGradeTiu: number;
  passingGradeTkp: number;
}

export interface UserAnswerState {
  selectedOptionId: string | null;
  isDoubtful: boolean;
}

interface ExamStoreState {
  tryout: TryoutMeta | null;
  sessionId: string | null;
  questions: QuestionItem[];
  currentQuestionIndex: number;
  answers: Record<number, UserAnswerState>;
  durationLeftSec: number;
  isCompleted: boolean;
  isSaving: boolean;
  isSubmitting: boolean;

  // Actions
  initExam: (data: {
    tryout: TryoutMeta;
    session: { id: string; durationLeftSec: number; isCompleted: boolean; answers: any[] };
    questions: QuestionItem[];
  }) => void;
  setCurrentIndex: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  selectOption: (questionNumber: number, optionId: string) => void;
  toggleDoubtful: (questionNumber: number) => void;
  decrementTimer: () => void;
  setSaving: (saving: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useExamStore = create<ExamStoreState>((set, get) => ({
  tryout: null,
  sessionId: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  durationLeftSec: 6000,
  isCompleted: false,
  isSaving: false,
  isSubmitting: false,

  initExam: ({ tryout, session, questions }) => {
    const answerMap: Record<number, UserAnswerState> = {};

    // Restore from session answers
    if (session.answers) {
      session.answers.forEach((ans) => {
        answerMap[ans.questionNumber] = {
          selectedOptionId: ans.selectedOptionId,
          isDoubtful: ans.isDoubtful,
        };
      });
    }

    // Check client localStorage cache for local backup
    const localKey = `exam_cache_${session.id}`;
    try {
      const cached = localStorage.getItem(localKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.answers) {
          Object.assign(answerMap, parsed.answers);
        }
      }
    } catch {
      // LocalStorage access fallback
    }

    set({
      tryout,
      sessionId: session.id,
      questions,
      answers: answerMap,
      durationLeftSec: session.durationLeftSec ?? 6000,
      isCompleted: session.isCompleted,
      currentQuestionIndex: 0,
    });
  },

  setCurrentIndex: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  selectOption: (questionNumber, optionId) => {
    const { answers, sessionId, durationLeftSec } = get();
    const current = answers[questionNumber] || { selectedOptionId: null, isDoubtful: false };

    // Toggle if same option clicked, or select new
    const updated = {
      ...answers,
      [questionNumber]: {
        ...current,
        selectedOptionId: current.selectedOptionId === optionId ? null : optionId,
      },
    };

    set({ answers: updated, isSaving: true });

    // Save to localStorage backup
    if (sessionId) {
      try {
        localStorage.setItem(
          `exam_cache_${sessionId}`,
          JSON.stringify({ answers: updated, durationLeftSec })
        );
      } catch {}
    }

    // Debounced API sync
    if (sessionId) {
      fetch("/api/exam/storeanswer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionNumber,
          selectedOptionId: updated[questionNumber].selectedOptionId,
          isDoubtful: updated[questionNumber].isDoubtful,
          durationLeftSec,
        }),
      })
        .then(() => set({ isSaving: false }))
        .catch(() => set({ isSaving: false }));
    }
  },

  toggleDoubtful: (questionNumber) => {
    const { answers, sessionId, durationLeftSec } = get();
    const current = answers[questionNumber] || { selectedOptionId: null, isDoubtful: false };

    const updated = {
      ...answers,
      [questionNumber]: {
        ...current,
        isDoubtful: !current.isDoubtful,
      },
    };

    set({ answers: updated, isSaving: true });

    if (sessionId) {
      try {
        localStorage.setItem(
          `exam_cache_${sessionId}`,
          JSON.stringify({ answers: updated, durationLeftSec })
        );
      } catch {}

      fetch("/api/exam/storeanswer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionNumber,
          selectedOptionId: updated[questionNumber].selectedOptionId,
          isDoubtful: updated[questionNumber].isDoubtful,
          durationLeftSec,
        }),
      })
        .then(() => set({ isSaving: false }))
        .catch(() => set({ isSaving: false }));
    }
  },

  decrementTimer: () => {
    const { durationLeftSec } = get();
    if (durationLeftSec > 0) {
      set({ durationLeftSec: durationLeftSec - 1 });
    }
  },

  setSaving: (isSaving) => set({ isSaving }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
}));

