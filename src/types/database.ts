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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          branch_id: string | null
          candidate_product_ids: string[]
          company_id: string
          confidence: number
          conversation_id: string | null
          created_at: string
          decision: string
          id: string
          latency_ms: number | null
          message_id: string | null
          missing_fields: string[]
          model: string | null
          normalized_part_name: string | null
          part_name: string | null
          prompt_version: string | null
          raw_message: string
          raw_model_output: Json | null
          vehicle: Json
        }
        Insert: {
          branch_id?: string | null
          candidate_product_ids?: string[]
          company_id: string
          confidence?: number
          conversation_id?: string | null
          created_at?: string
          decision: string
          id?: string
          latency_ms?: number | null
          message_id?: string | null
          missing_fields?: string[]
          model?: string | null
          normalized_part_name?: string | null
          part_name?: string | null
          prompt_version?: string | null
          raw_message: string
          raw_model_output?: Json | null
          vehicle?: Json
        }
        Update: {
          branch_id?: string | null
          candidate_product_ids?: string[]
          company_id?: string
          confidence?: number
          conversation_id?: string | null
          created_at?: string
          decision?: string
          id?: string
          latency_ms?: number | null
          message_id?: string | null
          missing_fields?: string[]
          model?: string | null
          normalized_part_name?: string | null
          part_name?: string | null
          prompt_version?: string | null
          raw_message?: string
          raw_model_output?: Json | null
          vehicle?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "conversation_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_business_hours: {
        Row: {
          branch_id: string
          break_ends_at: string | null
          break_starts_at: string | null
          closes_at: string | null
          company_id: string
          created_at: string
          day_of_week: number
          enabled: boolean
          id: string
          opens_at: string | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          break_ends_at?: string | null
          break_starts_at?: string | null
          closes_at?: string | null
          company_id: string
          created_at?: string
          day_of_week: number
          enabled?: boolean
          id?: string
          opens_at?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          break_ends_at?: string | null
          break_starts_at?: string | null
          closes_at?: string | null
          company_id?: string
          created_at?: string
          day_of_week?: number
          enabled?: boolean
          id?: string
          opens_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_business_hours_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_business_hours_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          active: boolean
          address_extra: string | null
          address_line: string | null
          address_number: string | null
          city: string | null
          code: string | null
          company_id: string
          created_at: string
          email: string | null
          id: string
          is_headquarters: boolean
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address_extra?: string | null
          address_line?: string | null
          address_number?: string | null
          city?: string | null
          code?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_headquarters?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address_extra?: string | null
          address_line?: string | null
          address_number?: string | null
          city?: string | null
          code?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_headquarters?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_import_rows: {
        Row: {
          company_id: string
          created_at: string
          error_message: string | null
          id: string
          import_id: string
          normalized_payload: Json
          raw_payload: Json
          row_number: number | null
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          import_id: string
          normalized_payload?: Json
          raw_payload?: Json
          row_number?: number | null
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          import_id?: string
          normalized_payload?: Json
          raw_payload?: Json
          row_number?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_import_rows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_import_rows_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "catalog_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_imports: {
        Row: {
          branch_id: string | null
          checksum: string | null
          company_id: string
          created_at: string
          created_by: string | null
          error_message: string | null
          error_rows: number
          file_name: string | null
          finished_at: string | null
          id: string
          inserted_rows: number
          processed_rows: number
          source_id: string | null
          started_at: string | null
          status: string
          total_rows: number
          updated_rows: number
        }
        Insert: {
          branch_id?: string | null
          checksum?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          error_rows?: number
          file_name?: string | null
          finished_at?: string | null
          id?: string
          inserted_rows?: number
          processed_rows?: number
          source_id?: string | null
          started_at?: string | null
          status?: string
          total_rows?: number
          updated_rows?: number
        }
        Update: {
          branch_id?: string | null
          checksum?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          error_rows?: number
          file_name?: string | null
          finished_at?: string | null
          id?: string
          inserted_rows?: number
          processed_rows?: number
          source_id?: string | null
          started_at?: string | null
          status?: string
          total_rows?: number
          updated_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_imports_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_imports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_imports_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "catalog_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_sources: {
        Row: {
          active: boolean
          company_id: string
          configuration: Json
          created_at: string
          id: string
          name: string
          provider: string
          source_type: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          company_id: string
          configuration?: Json
          created_at?: string
          id?: string
          name: string
          provider: string
          source_type?: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          company_id?: string
          configuration?: Json
          created_at?: string
          id?: string
          name?: string
          provider?: string
          source_type?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_sources_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          active: boolean
          business_type: string
          created_at: string
          currency: string
          document: string | null
          email: string | null
          id: string
          legal_name: string | null
          name: string
          owner_user_id: string
          phone: string | null
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_type?: string
          created_at?: string
          currency?: string
          document?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          name: string
          owner_user_id: string
          phone?: string | null
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_type?: string
          created_at?: string
          currency?: string
          document?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          owner_user_id?: string
          phone?: string | null
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          active: boolean
          branch_id: string | null
          company_id: string
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          branch_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          branch_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          ai_auto_reply: boolean
          ai_enabled: boolean
          company_id: string
          currency: string
          default_price_type: string
          minimum_match_confidence: number
          settings: Json
          updated_at: string
        }
        Insert: {
          ai_auto_reply?: boolean
          ai_enabled?: boolean
          company_id: string
          currency?: string
          default_price_type?: string
          minimum_match_confidence?: number
          settings?: Json
          updated_at?: string
        }
        Update: {
          ai_auto_reply?: boolean
          ai_enabled?: boolean
          company_id?: string
          currency?: string
          default_price_type?: string
          minimum_match_confidence?: number
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          company_id: string
          content: string
          conversation_id: string
          created_at: string
          external_message_id: string | null
          id: string
          metadata: Json
          sender_type: string
          sender_user_id: string | null
        }
        Insert: {
          company_id: string
          content: string
          conversation_id: string
          created_at?: string
          external_message_id?: string | null
          id?: string
          metadata?: Json
          sender_type: string
          sender_user_id?: string | null
        }
        Update: {
          company_id?: string
          content?: string
          conversation_id?: string
          created_at?: string
          external_message_id?: string | null
          id?: string
          metadata?: Json
          sender_type?: string
          sender_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          branch_id: string | null
          channel: string
          company_id: string
          created_at: string
          customer_id: string | null
          external_conversation_id: string | null
          id: string
          last_message_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          branch_id?: string | null
          channel?: string
          company_id: string
          created_at?: string
          customer_id?: string | null
          external_conversation_id?: string | null
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string | null
          channel?: string
          company_id?: string
          created_at?: string
          customer_id?: string | null
          external_conversation_id?: string | null
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_vehicles: {
        Row: {
          brand: string | null
          chassis: string | null
          company_id: string
          created_at: string
          customer_id: string
          engine: string | null
          fuel: string | null
          id: string
          model: string | null
          model_year: number | null
          notes: string | null
          plate: string | null
          transmission: string | null
          updated_at: string
          version: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          chassis?: string | null
          company_id: string
          created_at?: string
          customer_id: string
          engine?: string | null
          fuel?: string | null
          id?: string
          model?: string | null
          model_year?: number | null
          notes?: string | null
          plate?: string | null
          transmission?: string | null
          updated_at?: string
          version?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          chassis?: string | null
          company_id?: string
          created_at?: string
          customer_id?: string
          engine?: string | null
          fuel?: string | null
          id?: string
          model?: string | null
          model_year?: number | null
          notes?: string | null
          plate?: string | null
          transmission?: string | null
          updated_at?: string
          version?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          active: boolean
          branch_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          tags: string[]
          timezone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          active?: boolean
          branch_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tags?: string[]
          timezone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          active?: boolean
          branch_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tags?: string[]
          timezone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          active: boolean
          branch_id: string | null
          company_id: string
          config: Json
          created_at: string
          id: string
          last_error: string | null
          last_sync_at: string | null
          name: string
          provider: string
          secret_ref: string | null
          status: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          branch_id?: string | null
          company_id: string
          config?: Json
          created_at?: string
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          name: string
          provider: string
          secret_ref?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          branch_id?: string | null
          company_id?: string
          config?: Json
          created_at?: string
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          name?: string
          provider?: string
          secret_ref?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_connections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_aliases: {
        Row: {
          alias: string
          category_id: string | null
          company_id: string
          created_at: string
          id: string
          normalized_alias: string
          product_id: string | null
          source: string
        }
        Insert: {
          alias: string
          category_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          normalized_alias?: string
          product_id?: string | null
          source?: string
        }
        Update: {
          alias?: string
          category_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          normalized_alias?: string
          product_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_aliases_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_aliases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_aliases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          active: boolean
          company_id: string
          created_at: string
          id: string
          name: string
          normalized_name: string
          parent_id: string | null
        }
        Insert: {
          active?: boolean
          company_id: string
          created_at?: string
          id?: string
          name: string
          normalized_name: string
          parent_id?: string | null
        }
        Update: {
          active?: boolean
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          normalized_name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          company_id: string
          id: string
          product_id: string
          quantity: number
          reserved: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          company_id: string
          id?: string
          product_id: string
          quantity?: number
          reserved?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          company_id?: string
          id?: string
          product_id?: string
          quantity?: number
          reserved?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt_text: string | null
          company_id: string
          created_at: string
          id: string
          is_primary: boolean
          kind: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          kind?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          kind?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          branch_id: string | null
          company_id: string
          cost: number | null
          created_at: string
          id: string
          price: number
          price_type: string
          product_id: string
          source: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          branch_id?: string | null
          company_id: string
          cost?: number | null
          created_at?: string
          id?: string
          price: number
          price_type?: string
          product_id: string
          source?: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          branch_id?: string | null
          company_id?: string
          cost?: number | null
          created_at?: string
          id?: string
          price?: number
          price_type?: string
          product_id?: string
          source?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          barcode: string | null
          brand: string | null
          category_id: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          manufacturer: string | null
          metadata: Json
          name: string
          normalized_name: string
          original_code: string | null
          sku: string
          source: string | null
          source_external_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          metadata?: Json
          name: string
          normalized_name?: string
          original_code?: string | null
          sku: string
          source?: string | null
          source_external_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          metadata?: Json
          name?: string
          normalized_name?: string
          original_code?: string | null
          sku?: string
          source?: string | null
          source_external_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          company_id: string
          created_at: string
          description: string
          discount: number
          id: string
          product_id: string
          quantity: number
          quote_id: string
          total: number
          unit_price: number
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          discount?: number
          id?: string
          product_id: string
          quantity?: number
          quote_id: string
          total: number
          unit_price: number
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          discount?: number
          id?: string
          product_id?: string
          quantity?: number
          quote_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          branch_id: string | null
          company_id: string
          conversation_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number
          expires_at: string | null
          id: string
          notes: string | null
          number: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          company_id: string
          conversation_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number
          expires_at?: string | null
          id?: string
          notes?: string | null
          number?: never
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          company_id?: string
          conversation_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number
          expires_at?: string | null
          id?: string
          notes?: string | null
          number?: never
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      supported_timezones: {
        Row: {
          active: boolean
          label: string
          name: string
          region_hint: string | null
          sort_order: number
          utc_label: string
        }
        Insert: {
          active?: boolean
          label: string
          name: string
          region_hint?: string | null
          sort_order?: number
          utc_label: string
        }
        Update: {
          active?: boolean
          label?: string
          name?: string
          region_hint?: string | null
          sort_order?: number
          utc_label?: string
        }
        Relationships: []
      }
      vehicle_applications: {
        Row: {
          axle: string | null
          company_id: string
          created_at: string
          engine: string | null
          fuel: string | null
          id: string
          normalized_brand: string
          normalized_model: string
          notes: string | null
          position: string | null
          product_id: string
          side: string | null
          source: string | null
          source_external_id: string | null
          transmission: string | null
          vehicle_brand: string
          vehicle_model: string
          version: string | null
          year_end: number | null
          year_start: number | null
        }
        Insert: {
          axle?: string | null
          company_id: string
          created_at?: string
          engine?: string | null
          fuel?: string | null
          id?: string
          normalized_brand?: string
          normalized_model?: string
          notes?: string | null
          position?: string | null
          product_id: string
          side?: string | null
          source?: string | null
          source_external_id?: string | null
          transmission?: string | null
          vehicle_brand: string
          vehicle_model: string
          version?: string | null
          year_end?: number | null
          year_start?: number | null
        }
        Update: {
          axle?: string | null
          company_id?: string
          created_at?: string
          engine?: string | null
          fuel?: string | null
          id?: string
          normalized_brand?: string
          normalized_model?: string
          notes?: string | null
          position?: string | null
          product_id?: string
          side?: string | null
          source?: string | null
          source_external_id?: string | null
          transmission?: string | null
          vehicle_brand?: string
          vehicle_model?: string
          version?: string | null
          year_end?: number | null
          year_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_applications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          active: boolean
          branch_id: string | null
          code: string | null
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          branch_id?: string | null
          code?: string | null
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          branch_id?: string | null
          code?: string | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          company_id: string | null
          error_message: string | null
          event_type: string | null
          external_id: string | null
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          received_at: string
          status: string
        }
        Insert: {
          company_id?: string | null
          error_message?: string | null
          event_type?: string | null
          external_id?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          provider: string
          received_at?: string
          status?: string
        }
        Update: {
          company_id?: string | null
          error_message?: string | null
          event_type?: string | null
          external_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          received_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_stock: {
        Args: {
          p_branch_id?: string
          p_company_id: string
          p_product_id: string
        }
        Returns: number
      }
      next_company_quote_number: {
        Args: { p_company_id: string }
        Returns: number
      }
      search_products: {
        Args: { p_company_id: string; p_limit?: number; p_query: string }
        Returns: {
          name: string
          product_id: string
          score: number
          sku: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
