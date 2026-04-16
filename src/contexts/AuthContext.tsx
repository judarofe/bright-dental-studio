import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import {
  isProfileComplete,
  canAccessModule,
  canAccessRoute,
  canAccessSpecialty,
  canPerformAction,
  canEffectivelyAccessModule,
  getAccessibleSpecialties,
  getRoleCategory,
  isRoleCategory,
  type AppRole,
  type AppModule,
  type AppAction,
  type AccessContext,
  type RoleCategory,
} from "@/lib/permissions";
import type { Specialty } from "@/lib/specialties";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: AppRole;
  especialidad: string | null;
  avatar_url: string | null;
  activo: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileComplete: boolean;
  specialties: Specialty[];
  specialtyCodes: string[];
  /** Semantic role category (administrativo, clinico, operativo) */
  roleCategory: RoleCategory | null;
  /** Unified access context for permission checks */
  access: AccessContext;
  /** Convenience: check module access (role-based) */
  canModule: (module: AppModule) => boolean;
  /** Convenience: check specialty access (role + specialty) */
  canSpecialty: (code: string) => boolean;
  /** Convenience: check action permission */
  canAction: (action: AppAction) => boolean;
  /** Check if user's role belongs to a category */
  isCategory: (cat: RoleCategory) => boolean;
  /** Convenience: check route access */
  canRoute: (path: string) => boolean;
  /** List of specialty codes the user can clinically access */
  accessibleSpecialties: string[];
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data as Profile | null);
  }, []);

  const fetchUserSpecialties = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_specialties")
      .select("specialty_id, specialties(id, code, name, description, icon, active, sort_order)")
      .eq("user_id", userId);

    if (data) {
      const specs = data
        .map((row: any) => row.specialties as Specialty)
        .filter(Boolean);
      setSpecialties(specs);
    } else {
      setSpecialties([]);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await Promise.all([fetchProfile(user.id), fetchUserSpecialties(user.id)]);
    }
  }, [user, fetchProfile, fetchUserSpecialties]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchUserSpecialties(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setSpecialties([]);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserSpecialties(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchUserSpecialties]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg =
        error.message === "Invalid login credentials"
          ? "Credenciales inválidas. Verifique su correo y contraseña."
          : error.message === "Email not confirmed"
          ? "Debe confirmar su correo electrónico antes de iniciar sesión."
          : "Error al iniciar sesión. Intente nuevamente.";
      return { error: msg };
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      const msg = error.message.includes("already registered")
        ? "Este correo ya está registrado."
        : "Error al registrar. Intente nuevamente.";
      return { error: msg };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSpecialties([]);
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      return { error: "Error al enviar el correo. Intente nuevamente." };
    }
    return { error: null };
  };

  const profileComplete = isProfileComplete(profile);
  const specialtyCodes = specialties.map((s) => s.code);

  const access: AccessContext = useMemo(
    () => ({ role: profile?.role ?? null, specialtyCodes }),
    [profile?.role, specialtyCodes]
  );

  const roleCategory = useMemo(() => getRoleCategory(profile?.role), [profile?.role]);
  const canModule = useCallback((m: AppModule) => canAccessModule(access.role, m), [access.role]);
  const canSpecialtyFn = useCallback((code: string) => canAccessSpecialty(access, code), [access]);
  const canAction = useCallback((a: AppAction) => canPerformAction(access.role, a), [access.role]);
  const isCategory = useCallback((cat: RoleCategory) => isRoleCategory(access.role, cat), [access.role]);
  const canRoute = useCallback((path: string) => canAccessRoute(access.role, path, specialtyCodes), [access.role, specialtyCodes]);
  const accessibleSpecs = useMemo(() => getAccessibleSpecialties(access), [access]);

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading, profileComplete, specialties, specialtyCodes,
      roleCategory, access,
      canModule,
      canSpecialty: canSpecialtyFn,
      canAction,
      canRoute,
      accessibleSpecialties: accessibleSpecs,
      signIn, signUp, signOut, refreshProfile, forgotPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
