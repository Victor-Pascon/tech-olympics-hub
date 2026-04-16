export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          funcao: string[] | null
          id: string
          matricula: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          funcao?: string[] | null
          id?: string
          matricula?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          funcao?: string[] | null
          id?: string
          matricula?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          activity_id: string | null
          created_at: string
          data: string | null
          id: string
          lecture_id: string | null
          olympiad_id: string
          presente: boolean | null
          user_id: string
          validation_code: string | null
          workshop_id: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          data?: string | null
          id?: string
          lecture_id?: string | null
          olympiad_id: string
          presente?: boolean | null
          user_id: string
          validation_code?: string | null
          workshop_id?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          data?: string | null
          id?: string
          lecture_id?: string | null
          olympiad_id?: string
          presente?: boolean | null
          user_id?: string
          validation_code?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "olympiad_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_olympiad_id_fkey"
            columns: ["olympiad_id"]
            isOneToOne: false
            referencedRelation: "olympiads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          cor_primaria: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          texto_padrao: string | null
          tipo: string
        }
        Insert: {
          cor_primaria?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          texto_padrao?: string | null
          tipo: string
        }
        Update: {
          cor_primaria?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          texto_padrao?: string | null
          tipo?: string
        }
        Relationships: []
      }
      lecture_enrollments: {
        Row: {
          created_at: string
          id: string
          lecture_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lecture_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lecture_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lecture_enrollments_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      lecture_speakers: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          id: string
          lecture_id: string
          nome: string
          topico: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lecture_id: string
          nome: string
          topico?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lecture_id?: string
          nome?: string
          topico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lecture_speakers_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      lectures: {
        Row: {
          carga_horaria: number | null
          certificates_released: boolean | null
          created_at: string
          data_evento: string | null
          descricao: string | null
          horario: string | null
          id: string
          local: string | null
          nome: string
          vagas: number | null
        }
        Insert: {
          carga_horaria?: number | null
          certificates_released?: boolean | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          horario?: string | null
          id?: string
          local?: string | null
          nome: string
          vagas?: number | null
        }
        Update: {
          carga_horaria?: number | null
          certificates_released?: boolean | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          horario?: string | null
          id?: string
          local?: string | null
          nome?: string
          vagas?: number | null
        }
        Relationships: []
      }
      olympiad_activities: {
        Row: {
          created_at: string
          data_atividade: string | null
          descricao: string | null
          horario: string | null
          id: string
          limite_vagas: number | null
          local_sala: string | null
          nome: string
          olympiad_id: string
          responsavel: string | null
          total_horas: number | null
        }
        Insert: {
          created_at?: string
          data_atividade?: string | null
          descricao?: string | null
          horario?: string | null
          id?: string
          limite_vagas?: number | null
          local_sala?: string | null
          nome: string
          olympiad_id: string
          responsavel?: string | null
          total_horas?: number | null
        }
        Update: {
          created_at?: string
          data_atividade?: string | null
          descricao?: string | null
          horario?: string | null
          id?: string
          limite_vagas?: number | null
          local_sala?: string | null
          nome?: string
          olympiad_id?: string
          responsavel?: string | null
          total_horas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "olympiad_activities_olympiad_id_fkey"
            columns: ["olympiad_id"]
            isOneToOne: false
            referencedRelation: "olympiads"
            referencedColumns: ["id"]
          },
        ]
      }
      olympiad_enrollments: {
        Row: {
          activity_id: string | null
          created_at: string
          id: string
          olympiad_id: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          id?: string
          olympiad_id: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          id?: string
          olympiad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "olympiad_enrollments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "olympiad_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "olympiad_enrollments_olympiad_id_fkey"
            columns: ["olympiad_id"]
            isOneToOne: false
            referencedRelation: "olympiads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "olympiad_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      olympiad_scores: {
        Row: {
          activity_id: string
          colocacao: number | null
          created_at: string
          id: string
          observacoes: string | null
          olympiad_id: string
          pontuacao: number | null
          user_id: string
        }
        Insert: {
          activity_id: string
          colocacao?: number | null
          created_at?: string
          id?: string
          observacoes?: string | null
          olympiad_id: string
          pontuacao?: number | null
          user_id: string
        }
        Update: {
          activity_id?: string
          colocacao?: number | null
          created_at?: string
          id?: string
          observacoes?: string | null
          olympiad_id?: string
          pontuacao?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "olympiad_scores_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "olympiad_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "olympiad_scores_olympiad_id_fkey"
            columns: ["olympiad_id"]
            isOneToOne: false
            referencedRelation: "olympiads"
            referencedColumns: ["id"]
          },
        ]
      }
      olympiads: {
        Row: {
          bairro: string | null
          cep: string | null
          certificates_released: boolean | null
          cidade: string | null
          complemento: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          dias_semana: string | null
          estado: string | null
          faixa_etaria: string | null
          horario: string | null
          id: string
          limite_participantes: number | null
          local: string | null
          nome: string
          numero_edital: string | null
          numero_endereco: string | null
          observacoes: string | null
          ponto_referencia: string | null
          responsavel: string | null
          rua: string | null
          status: string | null
          tipo: string | null
          total_horas: number | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          certificates_released?: boolean | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          dias_semana?: string | null
          estado?: string | null
          faixa_etaria?: string | null
          horario?: string | null
          id?: string
          limite_participantes?: number | null
          local?: string | null
          nome: string
          numero_edital?: string | null
          numero_endereco?: string | null
          observacoes?: string | null
          ponto_referencia?: string | null
          responsavel?: string | null
          rua?: string | null
          status?: string | null
          tipo?: string | null
          total_horas?: number | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          certificates_released?: boolean | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          dias_semana?: string | null
          estado?: string | null
          faixa_etaria?: string | null
          horario?: string | null
          id?: string
          limite_participantes?: number | null
          local?: string | null
          nome?: string
          numero_edital?: string | null
          numero_endereco?: string | null
          observacoes?: string | null
          ponto_referencia?: string | null
          responsavel?: string | null
          rua?: string | null
          status?: string | null
          tipo?: string | null
          total_horas?: number | null
        }
        Relationships: []
      }
      post_files: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_files_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          autor_id: string | null
          categoria: string | null
          conteudo: string | null
          created_at: string
          id: string
          imagem_url: string | null
          localizacao_maps: string | null
          publicado: boolean | null
          tags: string | null
          titulo: string
          updated_at: string
          visualizacoes: number | null
        }
        Insert: {
          autor_id?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          id?: string
          imagem_url?: string | null
          localizacao_maps?: string | null
          publicado?: boolean | null
          tags?: string | null
          titulo: string
          updated_at?: string
          visualizacoes?: number | null
        }
        Update: {
          autor_id?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          id?: string
          imagem_url?: string | null
          localizacao_maps?: string | null
          publicado?: boolean | null
          tags?: string | null
          titulo?: string
          updated_at?: string
          visualizacoes?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          email: string
          estado: string | null
          id: string
          nome: string
          numero: string | null
          rua: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          estado?: string | null
          id: string
          nome?: string
          numero?: string | null
          rua?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          rua?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_materials: {
        Row: {
          activity_id: string | null
          arquivo_url: string | null
          created_at: string
          descricao: string | null
          id: string
          olympiad_id: string | null
          titulo: string
          workshop_id: string | null
        }
        Insert: {
          activity_id?: string | null
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          olympiad_id?: string | null
          titulo: string
          workshop_id?: string | null
        }
        Update: {
          activity_id?: string | null
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          olympiad_id?: string | null
          titulo?: string
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_materials_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "olympiad_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_materials_olympiad_id_fkey"
            columns: ["olympiad_id"]
            isOneToOne: false
            referencedRelation: "olympiads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_materials_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workshop_enrollments: {
        Row: {
          created_at: string
          id: string
          user_id: string
          workshop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          workshop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_enrollments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_files: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          tipo: string
          workshop_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url: string
          id?: string
          tipo?: string
          workshop_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          tipo?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_files_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          certificates_released: boolean | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          dias_aulas: string | null
          horario: string | null
          id: string
          local: string | null
          material_apoio: string | null
          material_estudo: string | null
          nome: string
          olympiad_id: string
          professor: string | null
          total_horas: number | null
          vagas: number | null
        }
        Insert: {
          certificates_released?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          dias_aulas?: string | null
          horario?: string | null
          id?: string
          local?: string | null
          material_apoio?: string | null
          material_estudo?: string | null
          nome: string
          olympiad_id: string
          professor?: string | null
          total_horas?: number | null
          vagas?: number | null
        }
        Update: {
          certificates_released?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          dias_aulas?: string | null
          horario?: string | null
          id?: string
          local?: string | null
          material_apoio?: string | null
          material_estudo?: string | null
          nome?: string
          olympiad_id?: string
          professor?: string | null
          total_horas?: number | null
          vagas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_olympiad_id_fkey"
            columns: ["olympiad_id"]
            isOneToOne: false
            referencedRelation: "olympiads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_validation_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
