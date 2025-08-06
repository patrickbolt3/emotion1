import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Question {
  id: string;
  question_text: string;
  harmonic_state: string;
  order: number;
}

interface Response {
  questionId: string;
  score: number;
}

interface AssessmentState {
  assessmentId: string | null;
  currentQuestionIndex: number;
  questions: Question[];
  responses: Record<string, Response>;
  loading: boolean;
  error: string | null;
  
  // Actions
  initializeAssessment: (userId: string) => Promise<string>;
  loadQuestions: () => Promise<void>;
  saveResponse: (questionId: string, score: number) => Promise<void>;
  nextQuestion: () => void;
  prevQuestion: () => void;
  completeAssessment: () => Promise<void>;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessmentId: null,
  currentQuestionIndex: 0,
  questions: [],
  responses: {},
  loading: false,
  error: null,
  
  initializeAssessment: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // First, verify that the user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        throw new Error('User profile not found. Please try logging out and back in.');
      }
      
      // Create a new assessment
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          completed: false,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      set({ assessmentId: data.id });
      return data.id;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  loadQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*');
      
      if (error) throw error;
      
      // Shuffle questions using Fisher-Yates algorithm
      const shuffleArray = (array: any[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      const shuffledQuestions = shuffleArray(data || []);
      set({ questions: shuffledQuestions });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  saveResponse: async (questionId: string, score: number) => {
    const { assessmentId, responses } = get();
    if (!assessmentId) return;
    
    set({ loading: true, error: null });
    try {
      // Save to local state
      set({
        responses: {
          ...responses,
          [questionId]: { questionId, score },
        },
      });
      
      // Save to database
      const { error } = await supabase
        .from('responses')
        .upsert({
          assessment_id: assessmentId,
          question_id: questionId,
          score,
        });
      
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
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
  
  completeAssessment: async () => {
    const { assessmentId, responses, questions } = get();
    if (!assessmentId) return;
    
    set({ loading: true, error: null });
    try {
      // Calculate dominant harmonic state
      const stateScores: Record<string, number> = {};
      const questionMap = questions.reduce((acc, q) => {
        acc[q.id] = q;
        return acc;
      }, {} as Record<string, Question>);
      
      // Sum scores by harmonic state
      Object.values(responses).forEach(response => {
        const question = questionMap[response.questionId];
        if (!question) return;
        
        const state = question.harmonic_state;
        stateScores[state] = (stateScores[state] || 0) + response.score;
      });
      
      // Find dominant state
      let dominantState = null;
      let highestScore = -1;
      
      for (const [state, score] of Object.entries(stateScores)) {
        if (score > highestScore) {
          highestScore = score;
          dominantState = state;
        }
      }
      
      // Update assessment with results
      const { error } = await supabase
        .from('assessments')
        .update({
          completed: true,
          dominant_state: dominantState,
          results: stateScores,
        })
        .eq('id', assessmentId);
      
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));