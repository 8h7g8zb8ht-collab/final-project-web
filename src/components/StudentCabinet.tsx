import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lesson, Assignment, Submission, PackageType } from '../types/database';
import {
  getLocalLessons,
  getLocalAssignments,
  getLocalSubmissions,
  saveLocalSubmissions,
  assignmentChecklists,
  getLocalChecklistState,
  saveLocalChecklistState,
  getLocalCompletedTaskIds,
  toggleLocalCompletedTask
} from '../lib/courseStore';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Upload,
  Video,
  MessageSquare,
  AlertCircle,
  Send,
  Calendar,
  Sparkles,
  Lock,
  ExternalLink,
  Check,
  CheckSquare,
  Square,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

interface StudentCabinetProps {
  onBackToLanding: () => void;
}

export const StudentCabinet: React.FC<StudentCabinetProps> = ({ onBackToLanding }) => {
  const { t, language } = useTranslation();
  const { user, profile, enrollment, openPaymentModal, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'assignments' | 'lessons' | 'zoom'>('assignments');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Self-check checklist state for Basic tier
  const [checklistsState, setChecklistsState] = useState<Record<string, boolean[]>>({});
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Homework submission form state (for Standard & Pro)
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Single Source of Truth: real enrollment status from database
  // If admin is viewing cabinet in "View As" preview mode, grant active preview access
  const isPending = !isAdmin && (!enrollment || enrollment.status === 'pending');
  const isActive = isAdmin || enrollment?.status === 'active';
  const pkgType: PackageType = enrollment?.package || 'standard';
  const isBasic = pkgType === 'basic';
  const showZoomTab = !isBasic; // Strictly hidden for Basic tier

  // Load course data and checklists
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load local completed tasks and checklists
        setCompletedTasks(getLocalCompletedTaskIds());

        if (isSupabaseConfigured && supabase) {
          // Fetch Lessons
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .order('week', { ascending: true })
            .order('created_at', { ascending: true });

          if (lessonsData && lessonsData.length >= 6) setLessons(lessonsData as Lesson[]);
          else setLessons(getLocalLessons());

          // Fetch Assignments
          const { data: assignmentsData } = await supabase
            .from('assignments')
            .select('*')
            .order('week', { ascending: true });

          if (assignmentsData && assignmentsData.length >= 6) setAssignments(assignmentsData as Assignment[]);
          else setAssignments(getLocalAssignments());

          // Fetch Submissions
          if (user) {
            const { data: submissionsData } = await supabase
              .from('submissions')
              .select('*')
              .eq('user_id', user.id);

            const map: Record<string, Submission> = {};
            if (submissionsData && submissionsData.length > 0) {
              submissionsData.forEach((sub) => {
                map[sub.assignment_id] = sub;
              });
            } else {
              getLocalSubmissions().forEach((sub) => {
                map[sub.assignment_id] = sub;
              });
            }
            setSubmissions(map);
          } else {
            const map: Record<string, Submission> = {};
            getLocalSubmissions().forEach((sub) => {
              map[sub.assignment_id] = sub;
            });
            setSubmissions(map);
          }
        } else {
          // Fallback to local synced store
          setLessons(getLocalLessons());
          setAssignments(getLocalAssignments());
          const map: Record<string, Submission> = {};
          getLocalSubmissions().forEach((sub) => {
            map[sub.assignment_id] = sub;
          });
          setSubmissions(map);
        }

        // Initialize checklist states for all assignments
        const initialChecklistMap: Record<string, boolean[]> = {};
        const localAssignmentsList = getLocalAssignments();
        localAssignmentsList.forEach((a) => {
          initialChecklistMap[a.id] = getLocalChecklistState(a.id);
        });
        setChecklistsState(initialChecklistMap);
      } catch (err: any) {
        console.error('Data load error in cabinet:', err);
        setLessons(getLocalLessons());
        setAssignments(getLocalAssignments());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isActive]);

  // Handle self-check toggle for Basic tier criteria
  const handleToggleChecklistCriterion = (assignmentId: string, index: number, totalCriteria: number) => {
    const currentList = checklistsState[assignmentId] || Array(totalCriteria).fill(false);
    const updated = [...currentList];
    while (updated.length < totalCriteria) updated.push(false);
    updated[index] = !updated[index];

    const nextMap = {
      ...checklistsState,
      [assignmentId]: updated,
    };
    setChecklistsState(nextMap);
    saveLocalChecklistState(assignmentId, updated);
  };

  // Handle marking assignment as done via checklist
  const handleToggleTaskCompleted = (assignmentId: string) => {
    const isNowDone = toggleLocalCompletedTask(assignmentId);
    if (isNowDone) {
      setCompletedTasks((prev) => [...prev, assignmentId]);
    } else {
      setCompletedTasks((prev) => prev.filter((id) => id !== assignmentId));
    }
  };

  // Calculate course progress across 6 weeks
  const totalWeeks = 6;
  const completedAssignmentsCount = assignments.filter((a) => {
    if (isBasic) {
      return completedTasks.includes(a.id);
    } else {
      return Boolean(submissions[a.id]);
    }
  }).length;

  const progressPercentage = Math.round((completedAssignmentsCount / totalWeeks) * 100);
  const currentWeekNumber = Math.min(6, Math.max(1, completedAssignmentsCount + 1));

  // Handle homework submission (Standard & Pro)
  const handleSubmitAssignment = async (e: React.FormEvent, assignment: Assignment) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    try {
      setUploading(true);
      setError(null);
      setSubmissionSuccess(null);

      let filePath: string | null = null;

      // File upload handling
      if (submissionFile) {
        if (submissionFile.size > 10 * 1024 * 1024) {
          throw new Error('Размер файла превышает 10 МБ. Пожалуйста, сожмите файл.');
        }

        if (isSupabaseConfigured && supabase && user) {
          const fileExt = submissionFile.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('homework-submissions')
            .upload(fileName, submissionFile);

          if (uploadError) {
            console.warn('Storage upload error, using local fallback:', uploadError.message);
            filePath = URL.createObjectURL(submissionFile);
          } else {
            const { data: urlData } = supabase.storage
              .from('homework-submissions')
              .getPublicUrl(fileName);
            filePath = urlData.publicUrl;
          }
        } else {
          filePath = URL.createObjectURL(submissionFile);
        }
      }

      const newSubRecord: Submission = {
        id: `sub-${Date.now()}`,
        user_id: user?.id || 'sample-student-1',
        assignment_id: assignment.id,
        text: submissionText.trim(),
        file_path: filePath,
        status: 'sent',
        teacher_comment: null,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase && user) {
        const { data: existingSub } = await supabase
          .from('submissions')
          .select('id')
          .eq('user_id', user.id)
          .eq('assignment_id', assignment.id)
          .maybeSingle();

        if (existingSub) {
          await supabase
            .from('submissions')
            .update({
              text: newSubRecord.text,
              file_path: newSubRecord.file_path,
              status: 'sent',
            })
            .eq('id', existingSub.id);
        } else {
          await supabase.from('submissions').insert({
            user_id: newSubRecord.user_id,
            assignment_id: newSubRecord.assignment_id,
            text: newSubRecord.text,
            file_path: newSubRecord.file_path,
            status: 'sent',
          });
        }
      }

      // Sync to local store
      const allSubs = getLocalSubmissions().filter((s) => s.assignment_id !== assignment.id);
      allSubs.unshift(newSubRecord);
      saveLocalSubmissions(allSubs);

      setSubmissions((prev) => ({
        ...prev,
        [assignment.id]: newSubRecord,
      }));

      // Trigger notification edge function if configured
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.functions.invoke('notify-teacher', {
            body: {
              student_name: profile?.full_name || user?.email || 'Ученик',
              student_email: user?.email || 'student@example.com',
              assignment_title: assignment.title,
              assignment_week: assignment.week,
              submission_text: submissionText.trim(),
              file_url: filePath,
            },
          });
        } catch {}
      }

      setSubmissionSuccess('Работа успешно отправлена на проверку преподавателю! Она сразу видна во вкладке «Проверка ДЗ» в панели преподавателя.');
      setSubmissionText('');
      setSubmissionFile(null);
      setActiveAssignmentId(null);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Ошибка отправки работы.');
    } finally {
      setUploading(false);
    }
  };

  const packageName = t(`packages.${pkgType}.name`);

  return (
    <div className="min-h-screen bg-[#FAF5F5] pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#E8D4D4] mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F2E4E4]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#B86868]">
                  {t('cabinet.title')}
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-xs font-semibold text-neutral-600">
                  {profile?.full_name || user?.email || 'Ученик курса'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
                {t('cabinet.welcome')}, {profile?.full_name || 'Ученик'}!
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                  <span>{t('cabinet.package_info')}</span>
                  <span className="px-3 py-1 bg-[#F5E6E6] text-[#B86868] rounded-full">
                    {packageName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-neutral-600">
                  <Calendar className="w-4 h-4 text-[#B86868]" />
                  <span>
                    {t('cabinet.access_until')}{' '}
                    <strong>
                      {enrollment?.access_until || new Date(Date.now() + 150 * 86400000).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Status indicator badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {isActive ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t('cabinet.status_active')}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-full font-bold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>{t('cabinet.status_pending')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 6-WEEK COURSE PROGRESS BAR & ROADMAP (Requirement 4) */}
          <div className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#B86868]">
                  Прогресс по 6 неделям обучения
                </span>
                <h3 className="text-lg font-bold text-neutral-900 font-display">
                  Неделя {currentWeekNumber} из 6 · Выполнено {completedAssignmentsCount} из {totalWeeks} заданий
                </h3>
              </div>
              <div className="text-sm font-black text-neutral-900 font-display">
                {progressPercentage}%
              </div>
            </div>

            {/* Progress line */}
            <div className="w-full bg-[#EFE3E3] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#B86868] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* 6-Week Roadmap Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6].map((w) => {
                const correspondingAssignment = assignments.find((a) => a.week === w);
                const isTaskDone = correspondingAssignment
                  ? isBasic
                    ? completedTasks.includes(correspondingAssignment.id)
                    : Boolean(submissions[correspondingAssignment.id])
                  : false;
                const isCurrent = currentWeekNumber === w && !isTaskDone;

                return (
                  <div
                    key={w}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isTaskDone
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isCurrent
                        ? 'bg-white border-[#B86868] shadow-xs text-neutral-900 ring-2 ring-[#B86868]/30'
                        : 'bg-[#FAF5F5] border-[#E8D4D4] text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {isTaskDone ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isCurrent ? (
                        <Clock className="w-3.5 h-3.5 text-[#B86868]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      )}
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        {w === 6 ? 'Финал' : `Неделя ${w}`}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold truncate">
                      {isTaskDone ? 'Выполнено ✓' : isCurrent ? 'Текущая' : 'Впереди'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pending Payment State Notice (Shown when pending and not test-unlocked) */}
        {isPending && (
          <div className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 border border-amber-200 rounded-3xl shadow-sm">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{t('cabinet.status_pending')}</span>
              </div>
              <p className="text-sm sm:text-base text-amber-800 leading-relaxed">
                {t('cabinet.pending_desc')}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => openPaymentModal(enrollment?.package || 'standard')}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  {t('cabinet.pay_details_btn')}
                </button>
                <a
                  href="https://t.me/+992116416152"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 rounded-full font-bold text-xs sm:text-sm transition-all"
                >
                  <Send className="w-4 h-4 text-sky-500" />
                  <span>Написать в Telegram (+992 116 41 61 52)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Global Error or Success message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submissionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{submissionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#EFE3E3] rounded-2xl max-w-xl mb-8 border border-[#E0CECE]">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'assignments'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4 text-[#B86868]" />
            <span>{t('cabinet.tabs.assignments')}</span>
            <span className="px-1.5 py-0.5 bg-[#F2DFDF] text-[#B86868] rounded-full text-[10px]">
              {assignments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'lessons'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('cabinet.tabs.lessons')}</span>
          </button>

          {/* Feedback & Zoom Tab is strictly hidden for Basic tier as requested! */}
          {showZoomTab && (
            <button
              onClick={() => setActiveTab('zoom')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'zoom'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{t('cabinet.tabs.feedback_zoom')}</span>
            </button>
          )}
        </div>

        {/* TAB 1: HOMEWORK ASSIGNMENTS (ЗАДАНИЯ ПО 6 НЕДЕЛЯМ) */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Explanatory helper box: Custom message for Basic vs Standard/Pro */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8D4D4] shadow-2xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4E4E4] text-[#B86868] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                ✎
              </div>
              <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                {isBasic ? (
                  <>
                    <strong>Тариф «Базовый»:</strong> Вы изучаете все 6 недель уроков и выполняете задания самостоятельно.
                    Используйте интерактивный <strong>чек-лист для самопроверки</strong> к каждому заданию, чтобы оценить готовность своей работы и зафиксировать прогресс курса.
                  </>
                ) : (
                  <>
                    <strong>Выполнение домашних заданий (Тариф {packageName}):</strong> Ниже представлены задания от преподавателя по всем 6 неделям.
                    Нажмите <strong>«Сдать домашнее задание»</strong>, напишите комментарий, прикрепите файл вашей работы (изображение или PDF) и отправьте на проверку.
                  </>
                )}
              </div>
            </div>

            {!isActive ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E8D4D4] space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Домашние задания откроются после подтверждения оплаты
                </h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  Администратор активирует ваш доступ после проверки платежа. Если вы уже оплатили курс, напишите нам в Telegram.
                </p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E8D4D4] text-neutral-500">
                <FileText className="w-12 h-12 mx-auto text-[#D6A9A9] mb-3" />
                <p>{t('cabinet.assignments_empty')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignments.map((assignment) => {
                  const submission = submissions[assignment.id];
                  const isReplying = activeAssignmentId === assignment.id;
                  const criteria = assignmentChecklists[assignment.week] || [
                    'Соответствие брифу и теме задания',
                    'Соблюдение правил композиции и выравнивания',
                    'Качество графики и аккуратность подачи',
                    'Готовность к презентации в портфолио',
                  ];
                  const checklistValues = checklistsState[assignment.id] || Array(criteria.length).fill(false);
                  const isTaskMarkedDone = completedTasks.includes(assignment.id);

                  return (
                    <div
                      key={assignment.id}
                      className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E8D4D4] shadow-sm space-y-6 hover:border-[#D6A9A9] transition-all"
                    >
                      {/* Assignment Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F2E4E4]">
                        <div>
                          <span className="px-3 py-1 bg-[#F4E4E4] text-[#B86868] text-xs font-black uppercase rounded-full">
                            Неделя {assignment.week} · {assignment.week === 6 ? 'Финальный проект' : 'Мини-проект'}
                          </span>
                          <h3 className="text-xl font-bold text-neutral-900 font-display mt-2">
                            {assignment.title}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isBasic ? (
                            isTaskMarkedDone ? (
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Выполнено (самопроверка)</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
                                В процессе
                              </span>
                            )
                          ) : submission ? (
                            submission.status === 'reviewed' ? (
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{t('cabinet.status_reviewed')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>{t('cabinet.status_sent')}</span>
                              </span>
                            )
                          ) : (
                            <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
                              Еще не сдано
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assignment Task Prompt */}
                      <div className="text-sm sm:text-base text-neutral-700 leading-relaxed bg-[#FAF5F5] p-5 rounded-2xl border border-[#EFE3E3]">
                        {assignment.description}
                      </div>

                      {/* TIER LOGIC: BASIC TIER -> SELF-CHECK CHECKLIST (No Submit Button, No Teacher Feedback) */}
                      {isBasic ? (
                        <div className="p-5 sm:p-6 rounded-2xl bg-[#FDF9F9] border border-[#ECD9D9] space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="w-4 h-4 text-[#B86868]" />
                              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-800">
                                Чек-лист для самопроверки
                              </h4>
                            </div>
                            <span className="text-xs text-neutral-500 font-medium">
                              Тариф «Базовый» · Самостоятельная оценка
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600">
                            Проверьте свой проект по каждому критерию перед тем, как положить его в свое портфолио:
                          </p>

                          {/* Checkbox criteria list */}
                          <div className="space-y-2.5 pt-1">
                            {criteria.map((item, cIdx) => {
                              const isChecked = Boolean(checklistValues[cIdx]);
                              return (
                                <button
                                  type="button"
                                  key={cIdx}
                                  onClick={() => handleToggleChecklistCriterion(assignment.id, cIdx, criteria.length)}
                                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${
                                    isChecked
                                      ? 'bg-white border-emerald-300 text-emerald-950 shadow-2xs'
                                      : 'bg-white/80 border-[#E8D4D4] text-neutral-700 hover:bg-white'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {isChecked ? (
                                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <Square className="w-4 h-4 text-neutral-400" />
                                    )}
                                  </div>
                                  <span className={isChecked ? 'font-medium' : 'font-normal'}>
                                    {item}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Action button to mark assignment completed */}
                          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskCompleted(assignment.id)}
                              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                                isTaskMarkedDone
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              <span>{isTaskMarkedDone ? 'Задание отмечено выполненным ✓' : 'Отметить задание выполненным'}</span>
                            </button>
                            <span className="text-xs text-neutral-400 italic">
                              Отметка фиксирует ваш прогресс в шапке курса
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* TIER LOGIC: STANDARD & PRO -> SUBMISSION FORM & INSTRUCTOR FEEDBACK */
                        <>
                          {/* If already submitted: show submission details & teacher comments */}
                          {submission && (
                            <div className="p-5 rounded-2xl bg-white border border-[#E2CECE] space-y-4">
                              <h4 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">
                                Ваша сданная работа:
                              </h4>
                              <p className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                                {submission.text}
                              </p>

                              {submission.file_path && (
                                <div className="pt-2">
                                  <a
                                    href={submission.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs font-bold text-[#B86868] hover:bg-[#F2DFDF] transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Открыть прикрепленный файл работы</span>
                                  </a>
                                </div>
                              )}

                              {/* Teacher's Feedback */}
                              {submission.teacher_comment ? (
                                <div className="mt-4 p-5 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-950 space-y-2">
                                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-purple-900">
                                    <MessageSquare className="w-4 h-4 text-purple-600" />
                                    <span>{t('cabinet.teacher_feedback')}</span>
                                  </div>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {submission.teacher_comment}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xs text-neutral-400 italic pt-2">
                                  {t('cabinet.no_feedback_yet')}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Action to submit or edit work */}
                          {!isReplying && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setActiveAssignmentId(assignment.id);
                                  if (submission) {
                                    setSubmissionText(submission.text);
                                  }
                                }}
                                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                <span>{submission ? 'Обновить ответ и файл' : t('cabinet.submit_work')}</span>
                              </button>
                            </div>
                          )}

                          {/* Submission Form Modal/Expand */}
                          {isReplying && (
                            <form
                              onSubmit={(e) => handleSubmitAssignment(e, assignment)}
                              className="p-6 rounded-2xl bg-[#FAF5F5] border border-[#E8D4D4] space-y-4 shadow-inner"
                            >
                              <h4 className="text-sm font-bold text-neutral-900">
                                Форма сдачи домашнего задания (Неделя {assignment.week})
                              </h4>

                              <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                                  {t('cabinet.your_answer')}
                                </label>
                                <textarea
                                  required
                                  rows={4}
                                  value={submissionText}
                                  onChange={(e) => setSubmissionText(e.target.value)}
                                  placeholder={t('cabinet.answer_placeholder')}
                                  className="w-full p-3.5 bg-white border border-[#E2CECE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868] text-neutral-900"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                                  {t('cabinet.file_label')}
                                </label>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setSubmissionFile(e.target.files[0]);
                                    }
                                  }}
                                  className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-neutral-900 hover:file:bg-neutral-100 cursor-pointer"
                                />
                                {submissionFile && (
                                  <p className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Выбран файл: {submissionFile.name} ({(submissionFile.size / 1024 / 1024).toFixed(2)} МБ)</span>
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  type="submit"
                                  disabled={uploading}
                                  className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span>{uploading ? t('cabinet.uploading') : 'Отправить работу на проверку'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveAssignmentId(null);
                                    setSubmissionFile(null);
                                  }}
                                  className="px-4 py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                                >
                                  Отмена
                                </button>
                              </div>
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LESSONS (6 УРОКОВ ПО НЕДЕЛЯМ С МАТЕРИАЛАМИ PDF) */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {!isActive ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E8D4D4] space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Материалы уроков станут доступны сразу после подтверждения оплаты
                </h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  Преподаватель активирует ваш доступ после сверки перевода в Telegram.
                </p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E8D4D4] text-neutral-500">
                <BookOpen className="w-12 h-12 mx-auto text-[#D6A9A9] mb-3" />
                <p>{t('cabinet.lessons_empty')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-6 sm:p-7 bg-white rounded-3xl border border-[#E8D4D4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-[#F4E4E4] text-[#B86868] text-xs font-black uppercase rounded-full">
                          Неделя {lesson.week} из 6
                        </span>
                        <span className="text-xs text-neutral-400">Урок курса</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-900 font-display">
                        {lesson.title}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F2E4E4] flex items-center justify-between">
                      {lesson.pdf_path ? (
                        <a
                          href={lesson.pdf_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>{t('cabinet.download_pdf')}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">
                          {t('cabinet.no_pdf')}
                        </span>
                      )}
                      <span className="text-xs text-neutral-400 font-medium">
                        PDF-материалы
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FEEDBACK & ZOOM (Only for Standard & Pro) */}
        {activeTab === 'zoom' && showZoomTab && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8D4D4] shadow-sm space-y-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3DEDE] text-[#B86868] text-xs font-bold uppercase tracking-wider mb-2">
                <Video className="w-3.5 h-3.5" />
                <span>{t('cabinet.zoom_section.title')}</span>
              </div>
              <h3 className="text-2xl font-black text-neutral-900 font-display">
                Тариф {packageName}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                {pkgType === 'standard'
                  ? 'В тарифе «Стандарт»: 2 подробные обратные связи (по проекту 3-й недели и по финальному проекту) и 2 созвона в Zoom (конец 3-й и конец 6-й недели).'
                  : 'В тарифе «Про»: 10 подробных обратных связей по домашним работам и 10 созвонов в Zoom с наставником.'}
              </p>
            </div>

            {/* Counters calculated from database enrollment fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#FAF5F5] border border-[#EBD6D6] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-600">
                    {t('cabinet.zoom_section.feedback_left')}
                  </h4>
                  <div className="mt-2 text-4xl font-black text-neutral-900 font-display tabular-nums">
                    {enrollment?.feedback_left ?? (pkgType === 'standard' ? 2 : 10)}
                  </div>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {pkgType === 'standard' ? 'Неделя 3 и финал' : '10 детальных разборов'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full chrome-surface flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-neutral-800" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF5F5] border border-[#EBD6D6] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-600">
                    {t('cabinet.zoom_section.zoom_left')}
                  </h4>
                  <div className="mt-2 text-4xl font-black text-[#B86868] font-display tabular-nums">
                    {enrollment?.zoom_left ?? (pkgType === 'standard' ? 2 : 10)}
                  </div>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {pkgType === 'standard' ? 'Конец 3-й и 6-й недели' : '10 онлайн-сессий'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full chrome-surface flex items-center justify-center">
                  <Video className="w-5 h-5 text-neutral-800" />
                </div>
              </div>
            </div>

            {/* Zoom Scheduling Information */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FAF0F0] to-[#F5E6E6] border border-[#E5C9C9] space-y-4">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <Calendar className="w-5 h-5 text-[#B86868]" />
                <span>{t('cabinet.zoom_section.next_zoom')}</span>
              </div>
              <p className="text-sm text-neutral-700">
                {t('cabinet.zoom_section.no_zoom_scheduled')}
              </p>
              <div className="pt-2">
                <a
                  href="https://t.me/+992116416152"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>{t('cabinet.zoom_section.book_zoom_btn')} (+992 116 41 61 52)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Rule 6: Temporary Debug Line (visible only to admin) */}
        {isAdmin && (
          <div className="mt-12 pt-4 border-t border-dashed border-neutral-300 text-center text-[11px] font-mono text-neutral-500">
            [debug: {user?.email || 'anon'} | role: {profile?.role || 'none'} | route: /cabinet]
          </div>
        )}
      </div>
    </div>
  );
};
