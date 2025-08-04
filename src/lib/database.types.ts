export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          completed: boolean
          dominant_state: string | null
          results: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          completed?: boolean
          dominant_state?: string | null
          results?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          completed?: boolean
          dominant_state?: string | null
          results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          email: string
          role: string
          coach_id: string | null
          trainer_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          email: string
          role?: string
          coach_id?: string | null
          trainer_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          role?: string
          coach_id?: string | null
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          id: string
          created_at: string
          question_text: string
          harmonic_state: string
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          question_text: string
          harmonic_state: string
          order: number
        }
        Update: {
          id?: string
          created_at?: string
          question_text?: string
          harmonic_state?: string
          order?: number
        }
        Relationships: []
      }
      responses: {
        Row: {
          id: string
          created_at: string
          assessment_id: string
          question_id: string
          score: number
        }
        Insert: {
          id?: string
          created_at?: string
          assessment_id: string
          question_id: string
          score: number
        }
        Update: {
          id?: string
          created_at?: string
          assessment_id?: string
          question_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      harmonic_states: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          color: string
          coaching_tips: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          color: string
          coaching_tips?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          color?: string
          coaching_tips?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "respondent" | "coach" | "trainer" | "admin" | "partner"
    }
  }
}