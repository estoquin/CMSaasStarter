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
      products: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          sku: string | null
          price: number
          stock: number
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          sku?: string | null
          price?: number
          stock?: number
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          sku?: string | null
          price?: number
          stock?: number
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          company_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          message_body: string | null
          phone: string | null
          updated_at: Date | null
        }
        Insert: {
          company_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          message_body?: string | null
          phone?: string | null
          updated_at?: Date | null
        }
        Update: {
          company_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          message_body?: string | null
          phone?: string | null
          updated_at?: Date | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          company_name: string | null
          website: string | null
          unsubscribed: boolean
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: Date | null
          company_name?: string | null
          website?: string | null
          unsubscribed: boolean
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          company_name?: string | null
          website?: string | null
          unsubscribed: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          account_id: string | null
          name: string
          email: string | null
          phone: string | null
          company: string | null
          notes: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          account_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          account_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          email: string | null
          phone: string | null
          website: string | null
          industry: string | null
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          website?: string | null
          industry?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          website?: string | null
          industry?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [{ foreignKeyName: "accounts_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] }]
      }
      leads: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          email: string | null
          phone: string | null
          source: string | null
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [{ foreignKeyName: "leads_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] }]
      }
      opportunities: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          account_id: string | null
          value: number
          stage: string
          probability: number
          close_date: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          account_id?: string | null
          value?: number
          stage?: string
          probability?: number
          close_date?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          account_id?: string | null
          value?: number
          stage?: string
          probability?: number
          close_date?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "opportunities_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] },
          { foreignKeyName: "opportunities_account_id_fkey", columns: ["account_id"], referencedRelation: "accounts", referencedColumns: ["id"] },
        ]
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          account_id: string | null
          opportunity_id: string | null
          total: number
          status: string
          valid_until: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          account_id?: string | null
          opportunity_id?: string | null
          total?: number
          status?: string
          valid_until?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          account_id?: string | null
          opportunity_id?: string | null
          total?: number
          status?: string
          valid_until?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "quotes_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] },
          { foreignKeyName: "quotes_account_id_fkey", columns: ["account_id"], referencedRelation: "accounts", referencedColumns: ["id"] },
          { foreignKeyName: "quotes_opportunity_id_fkey", columns: ["opportunity_id"], referencedRelation: "opportunities", referencedColumns: ["id"] },
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          account_id: string | null
          quote_id: string | null
          total: number
          status: string
          order_date: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          account_id?: string | null
          quote_id?: string | null
          total?: number
          status?: string
          order_date?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          account_id?: string | null
          quote_id?: string | null
          total?: number
          status?: string
          order_date?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "orders_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] },
          { foreignKeyName: "orders_account_id_fkey", columns: ["account_id"], referencedRelation: "accounts", referencedColumns: ["id"] },
          { foreignKeyName: "orders_quote_id_fkey", columns: ["quote_id"], referencedRelation: "quotes", referencedColumns: ["id"] },
        ]
      }
      ingredients: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          unit: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          unit: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          unit?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [{ foreignKeyName: "ingredients_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] }]
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          ingredient_id: string
          date: string
          quantity_bought: number
          total_paid: number
          unit_cost: number
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          ingredient_id: string
          date?: string
          quantity_bought: number
          total_paid: number
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          ingredient_id?: string
          date?: string
          quantity_bought?: number
          total_paid?: number
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "purchases_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] },
          { foreignKeyName: "purchases_ingredient_id_fkey", columns: ["ingredient_id"], referencedRelation: "ingredients", referencedColumns: ["id"] },
        ]
      }
      menu_items: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [{ foreignKeyName: "menu_items_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] }]
      }
      components: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          unit: string
          ingredient_id: string
          ingredient_qty_used: number
          yield_per_batch: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          unit: string
          ingredient_id: string
          ingredient_qty_used: number
          yield_per_batch: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          unit?: string
          ingredient_id?: string
          ingredient_qty_used?: number
          yield_per_batch?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "components_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] },
          { foreignKeyName: "components_ingredient_id_fkey", columns: ["ingredient_id"], referencedRelation: "ingredients", referencedColumns: ["id"] },
        ]
      }
      menu_item_ingredients: {
        Row: {
          menu_item_id: string
          line_type: string
          ref_id: string
          quantity_needed: number
        }
        Insert: {
          menu_item_id: string
          line_type: string
          ref_id: string
          quantity_needed: number
        }
        Update: {
          menu_item_id?: string
          line_type?: string
          ref_id?: string
          quantity_needed?: number
        }
        Relationships: [
          { foreignKeyName: "mii_menu_item_id_fkey", columns: ["menu_item_id"], referencedRelation: "menu_items", referencedColumns: ["id"] },
        ]
      }
      slas: {
        Row: {
          id: string
          name: string
          response_hours: number
          resolution_hours: number
          organization_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          response_hours: number
          resolution_hours: number
          organization_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          response_hours?: number
          resolution_hours?: number
          organization_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      service_contracts: {
        Row: {
          id: string
          account_id: string
          sla_id: string
          start_date: string
          end_date: string | null
          organization_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          account_id: string
          sla_id: string
          start_date: string
          end_date?: string | null
          organization_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          account_id?: string
          sla_id?: string
          start_date?: string
          end_date?: string | null
          organization_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "service_contracts_account_id_fkey", columns: ["account_id"], referencedRelation: "accounts", referencedColumns: ["id"] },
          { foreignKeyName: "service_contracts_sla_id_fkey", columns: ["sla_id"], referencedRelation: "slas", referencedColumns: ["id"] },
        ]
      }
      service_tickets: {
        Row: {
          id: string
          account_id: string
          contact_id: string | null
          user_id: string | null
          organization_id: string | null
          title: string
          description: string | null
          status: string
          priority: string
          category: string | null
          opened_at: string | null
          closed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          account_id: string
          contact_id?: string | null
          user_id?: string | null
          organization_id?: string | null
          title: string
          description?: string | null
          status?: string
          priority?: string
          category?: string | null
          opened_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          account_id?: string
          contact_id?: string | null
          user_id?: string | null
          organization_id?: string | null
          title?: string
          description?: string | null
          status?: string
          priority?: string
          category?: string | null
          opened_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "service_tickets_account_id_fkey", columns: ["account_id"], referencedRelation: "accounts", referencedColumns: ["id"] },
          { foreignKeyName: "service_tickets_contact_id_fkey", columns: ["contact_id"], referencedRelation: "contacts", referencedColumns: ["id"] },
        ]
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          body: string
          is_internal: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id: string
          body: string
          is_internal?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string
          body?: string
          is_internal?: boolean
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "ticket_comments_ticket_id_fkey", columns: ["ticket_id"], referencedRelation: "service_tickets", referencedColumns: ["id"] },
          { foreignKeyName: "ticket_comments_author_id_fkey", columns: ["author_id"], referencedRelation: "profiles", referencedColumns: ["id"] },
        ]
      }
      ticket_assignments: {
        Row: {
          id: string
          ticket_id: string
          agent_id: string
          assigned_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          ticket_id: string
          agent_id: string
          assigned_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          ticket_id?: string
          agent_id?: string
          assigned_at?: string | null
          is_active?: boolean
        }
        Relationships: [
          { foreignKeyName: "ticket_assignments_ticket_id_fkey", columns: ["ticket_id"], referencedRelation: "service_tickets", referencedColumns: ["id"] },
          { foreignKeyName: "ticket_assignments_agent_id_fkey", columns: ["agent_id"], referencedRelation: "profiles", referencedColumns: ["id"] },
        ]
      }
      ticket_time_logs: {
        Row: {
          id: string
          ticket_id: string
          agent_id: string
          minutes: number
          note: string | null
          logged_at: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          agent_id: string
          minutes: number
          note?: string | null
          logged_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          agent_id?: string
          minutes?: number
          note?: string | null
          logged_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "ticket_time_logs_ticket_id_fkey", columns: ["ticket_id"], referencedRelation: "service_tickets", referencedColumns: ["id"] },
          { foreignKeyName: "ticket_time_logs_agent_id_fkey", columns: ["agent_id"], referencedRelation: "profiles", referencedColumns: ["id"] },
        ]
      }
      service_invoices: {
        Row: {
          id: string
          ticket_id: string
          quote_id: string | null
          amount: number
          status: string
          organization_id: string | null
          issued_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          quote_id?: string | null
          amount?: number
          status?: string
          organization_id?: string | null
          issued_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          quote_id?: string | null
          amount?: number
          status?: string
          organization_id?: string | null
          issued_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "service_invoices_ticket_id_fkey", columns: ["ticket_id"], referencedRelation: "service_tickets", referencedColumns: ["id"] },
          { foreignKeyName: "service_invoices_quote_id_fkey", columns: ["quote_id"], referencedRelation: "quotes", referencedColumns: ["id"] },
        ]
      }
      stripe_customers: {
        Row: {
          stripe_customer_id: string
          updated_at: Date | null
          user_id: string
        }
        Insert: {
          stripe_customer_id: string
          updated_at?: Date | null
          user_id: string
        }
        Update: {
          stripe_customer_id?: string
          updated_at?: Date | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_bundles: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_bundles_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_bundle_items: {
        Row: {
          id: string
          bundle_id: string
          habit_id: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          bundle_id: string
          habit_id: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          bundle_id?: string
          habit_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            referencedRelation: "habit_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_bundle_items_habit_id_fkey"
            columns: ["habit_id"]
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_tracking_records: {
        Row: {
          id: string
          organization_id: string
          bundle_id: string
          habit_id: string
          tracked_date: string
          completed: boolean | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          bundle_id: string
          habit_id: string
          tracked_date?: string
          completed?: boolean | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          bundle_id?: string
          habit_id?: string
          tracked_date?: string
          completed?: boolean | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_tracking_records_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_tracking_records_bundle_id_fkey"
            columns: ["bundle_id"]
            referencedRelation: "habit_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_tracking_records_habit_id_fkey"
            columns: ["habit_id"]
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      menu_item_costs: {
        Row: {
          menu_item_id: string
          menu_item_name: string
          user_id: string
          organization_id: string | null
          ingredient_count: number
          total_cost: number
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: [
          { foreignKeyName: "mic_user_id_fkey", columns: ["user_id"], referencedRelation: "users", referencedColumns: ["id"] },
          { foreignKeyName: "mic_organization_id_fkey", columns: ["organization_id"], referencedRelation: "organizations", referencedColumns: ["id"] },
        ]
      }
      sales_pipeline: {
        Row: {
          stage: string
          count: number
          total_value: number
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      open_tickets: {
        Row: {
          id: string
          title: string
          status: string
          priority: string
          category: string | null
          opened_at: string | null
          updated_at: string | null
          user_id: string | null
          account_name: string | null
          contact_name: string | null
          assigned_agent: string | null
          sla_name: string | null
          response_hours: number | null
          resolution_hours: number | null
          hours_open: number | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      ticket_summary: {
        Row: {
          id: string
          title: string
          status: string
          priority: string
          category: string | null
          description: string | null
          opened_at: string | null
          closed_at: string | null
          updated_at: string | null
          user_id: string | null
          account_id: string | null
          account_name: string | null
          contact_id: string | null
          contact_name: string | null
          assigned_agent: string | null
          agent_id: string | null
          total_minutes_logged: number | null
          invoice_status: string | null
          invoice_amount: number | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      agent_workload: {
        Row: {
          agent_id: string
          agent_name: string | null
          open_tickets: number
          minutes_logged_this_month: number
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      recent_orders: {
        Row: {
          id: string
          name: string
          account_name: string | null
          total: number
          status: string
          order_date: string | null
          created_at: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
