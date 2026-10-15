import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, Enrollment, PackageType, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  enrollment: Enrollment | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  userRole: UserRole;
  isConfigured: boolean;
  // Admin "View As" switcher state (UI level only, never modifies DB)
  adminViewAs: 'admin' | 'teacher' | 'student' | null;
  setAdminViewAs: (view: 'admin' | 'teacher' | 'student' | null) => void;
  // Modals & enrollment helpers
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'reset';
  paymentModalOpen: boolean;
  selectedPackage: PackageType;
  openAuthModal: (mode?: 'login' | 'register' | 'reset', pkg?: PackageType) => void;
  closeAuthModal: () => void;
  openPaymentModal: (pkg?: PackageType) => void;
  closePaymentModal: () => void;
  setSelectedPackage: (pkg: PackageType) => void;
  enrollInPackage: (pkg: PackageType) => Promise<{ success: boolean; error?: string }>;
  refreshUserData: (customUser?: User) => Promise<{ user: User | null; profile: Profile | null; role: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminViewAs, setAdminViewAsState] = useState<'admin' | 'teacher' | 'student' | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'reset'>('login');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('standard');

  // Single Source of Truth: fetch profile strictly from database profiles.role
  const fetchProfileAndEnrollment = useCallback(async (userId: string, passedUser?: User | null) => {
    if (!supabase) return { profile: null, enrollment: null };

    try {
      // 1. Fetch Profile: Role comes ONLY from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let currentProfile: Profile | null = null;
      const activeUser = passedUser || user;
      const isMasterTeacher = activeUser?.email?.toLowerCase() === 'mahmudimunisa8@gmail.com';
      const metaRole = activeUser?.user_metadata?.role;

      if (profileError) {
        console.error('Supabase profile fetch error:', profileError);
      } else if (profileData) {
        currentProfile = profileData as Profile;
        // If profile exists as student but user is master teacher, elevate to teacher
        if (isMasterTeacher && currentProfile.role === 'student') {
          currentProfile.role = 'teacher';
          Promise.resolve(
            supabase
              .from('profiles')
              .update({ role: 'teacher' })
              .eq('id', userId)
          ).catch(() => {});
        }
        setProfile(currentProfile);
      } else {
        // If profile does not exist yet (e.g. before trigger runs), create profile
        const metaName = activeUser?.user_metadata?.full_name || activeUser?.email?.split('@')[0] || 'User';
        const initialRole: UserRole = isMasterTeacher || metaRole === 'teacher' ? 'teacher' : (metaRole === 'admin' ? 'admin' : 'student');
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: metaName,
            role: initialRole,
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Supabase create profile error:', createError);
          // Local fallback in memory without fake role
          currentProfile = {
            id: userId,
            full_name: metaName,
            role: initialRole,
            created_at: new Date().toISOString(),
          };
        } else if (createdProfile) {
          currentProfile = createdProfile as Profile;
        }
        setProfile(currentProfile);
      }

      // 2. Fetch Latest Enrollment for student
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enrollmentError) {
        console.warn('Supabase enrollment fetch error:', enrollmentError.message);
        setEnrollment(null);
      } else if (enrollmentData) {
        setEnrollment(enrollmentData as Enrollment);
      } else {
        setEnrollment(null);
      }

      return { profile: currentProfile, enrollment: enrollmentData as Enrollment | null };
    } catch (err) {
      console.error('Error fetching user data from Supabase:', err);
      return { profile: null, enrollment: null };
    }
  }, [user]);

  const refreshUserData = useCallback(async (customUser?: User) => {
    const targetUser = customUser || user;
    if (!targetUser) {
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
          const res = await fetchProfileAndEnrollment(data.user.id, data.user);
          return {
            user: data.user,
            profile: res.profile,
            role: (res.profile?.role || 'student') as UserRole,
          };
        }
      }
      return { user: null, profile: null, role: 'student' as UserRole };
    }

    setUser(targetUser);
    const res = await fetchProfileAndEnrollment(targetUser.id, targetUser);
    return {
      user: targetUser,
      profile: res.profile,
      role: (res.profile?.role || 'student') as UserRole,
    };
  }, [user, fetchProfileAndEnrollment]);

  // Initial Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfileAndEnrollment(currentUser.id, currentUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfileAndEnrollment(currentUser.id, currentUser);
      } else {
        setProfile(null);
        setEnrollment(null);
        setAdminViewAsState(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfileAndEnrollment]);

  const openAuthModal = (mode: 'login' | 'register' | 'reset' = 'login', pkg?: PackageType) => {
    setAuthModalMode(mode);
    if (pkg) setSelectedPackage(pkg);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);
  const openPaymentModal = (pkg?: PackageType) => {
    if (pkg) setSelectedPackage(pkg);
    setPaymentModalOpen(true);
  };
  const closePaymentModal = () => setPaymentModalOpen(false);

  const enrollInPackage = async (pkg: PackageType): Promise<{ success: boolean; error?: string }> => {
    if (!user || !supabase) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const feedbackLeft = pkg === 'basic' ? 0 : pkg === 'standard' ? 2 : 10;
      const zoomLeft = pkg === 'basic' ? 0 : pkg === 'standard' ? 2 : 10;

      let result;
      if (enrollment) {
        result = await supabase
          .from('enrollments')
          .update({
            package: pkg,
            status: 'pending',
            feedback_left: feedbackLeft,
            zoom_left: zoomLeft,
          })
          .eq('id', enrollment.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            package: pkg,
            status: 'pending',
            feedback_left: feedbackLeft,
            zoom_left: zoomLeft,
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      await refreshUserData(user);
      setSelectedPackage(pkg);
      openPaymentModal(pkg);
      return { success: true };
    } catch (err: any) {
      console.error('Error creating enrollment in Supabase:', err);
      return { success: false, error: err.message || 'Failed to select package' };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setEnrollment(null);
    setAdminViewAsState(null);
  };

  // Single Source of Truth: Role strictly comes from database profile.role
  const userRole: UserRole = profile?.role || 'student';
  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'teacher';

  const setAdminViewAs = (view: 'admin' | 'teacher' | 'student' | null) => {
    if (!isAdmin) {
      // Non-admins cannot use View As
      setAdminViewAsState(null);
      return;
    }
    setAdminViewAsState(view);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        enrollment,
        loading,
        isAdmin,
        isTeacher,
        userRole,
        isConfigured: isSupabaseConfigured,
        adminViewAs,
        setAdminViewAs,
        authModalOpen,
        authModalMode,
        paymentModalOpen,
        selectedPackage,
        openAuthModal,
        closeAuthModal,
        openPaymentModal,
        closePaymentModal,
        setSelectedPackage,
        enrollInPackage,
        refreshUserData,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
