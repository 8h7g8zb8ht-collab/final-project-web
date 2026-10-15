export type UserRole = 'student' | 'teacher' | 'admin';
export type PackageType = 'basic' | 'standard' | 'pro';
export type EnrollmentStatus = 'pending' | 'active';
export type SubmissionStatus = 'sent' | 'reviewed';

export interface Profile {
  id: string; // uuid references auth.users.id
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  package: PackageType;
  status: EnrollmentStatus;
  access_until: string | null;
  feedback_left: number;
  zoom_left: number;
  teacher_id?: string | null;
  created_at: string;
  // Joined relations
  profile?: Profile;
  teacher?: Profile;
}

export interface Lesson {
  id: string;
  title: string;
  week: number;
  description: string;
  pdf_path: string | null;
  created_at: string;
}

export interface Assignment {
  id: string;
  week: number;
  title: string;
  description: string;
  file_path?: string | null;
  deadline?: string | null;
  target_user_id?: string | null; // null = assigned to all students
  teacher_id?: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  assignment_id: string;
  text: string;
  file_path: string | null;
  status: SubmissionStatus;
  teacher_comment: string | null;
  created_at: string;
  // Joined relation for display
  assignment?: Assignment;
  profile?: Profile;
}

export interface ZoomCall {
  id: string;
  title: string;
  date_time: string;
  zoom_link: string;
  teacher_id?: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; role?: UserRole };
        Update: Partial<Profile>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Partial<Enrollment> & { user_id: string; package: PackageType };
        Update: Partial<Enrollment>;
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, 'id' | 'created_at'>;
        Update: Partial<Lesson>;
      };
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, 'id' | 'created_at'>;
        Update: Partial<Assignment>;
      };
      submissions: {
        Row: Submission;
        Insert: Omit<Submission, 'id' | 'created_at' | 'status' | 'teacher_comment'> & {
          status?: SubmissionStatus;
          teacher_comment?: string | null;
        };
        Update: Partial<Submission>;
      };
      zoom_calls: {
        Row: ZoomCall;
        Insert: Omit<ZoomCall, 'id' | 'created_at'>;
        Update: Partial<ZoomCall>;
      };
    };
  };
}
