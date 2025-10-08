// src/models/authModel.ts

import { User } from '@supabase/supabase-js';
import supabase from '../supabaseClient';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User | null; 
}

const AuthService = {
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };

    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  },

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true, user: data.user };
      }
      
      return { success: false, error: 'Usuário não foi retornado após o cadastro.' };

    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  },

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  },
};

export default AuthService;
