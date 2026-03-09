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
          created_at: string
          data: string | null
          id: string
          olympiad_id: string
          presente: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string | null
          id?: string
          olympiad_id: string
          presente?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string | null
          id?: string
          olympiad_id?: string
          presente?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_olympiad_id_fkey"
            columns: ["olympiad_id"]
            isOneToOne: false
            referencedRelation: "olympiads"
            referencedColumns: ["id"]
          },
        ]
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
      olympiads: {
        Row: {
          bairro: string | null
          cep: string | null
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
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
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
        }
        Update: {
          bairro?: string | null
          cep?: string | null
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
          arquivo_url: string | null
          created_at: string
          descricao: string | null
          id: string
          olympiad_id: string | null
          titulo: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          olympiad_id?: string | null
          titulo: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          olympiad_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_materials_olympiad_id_fkey"
            columns: ["olympiad_id"]
            isOneToOne: false
            referencedRelation: "olympiads"
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
          vagas: number | null
        }
        Insert: {
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
          vagas?: number | null
        }
        Update: {
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
