import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Enrollment, Assignment, Submission, ZoomCall, Profile } from '../types/database';
import {
  Users,
  FileText,
  CheckSquare,
  Video,
  Send,
  Plus,
  Clock,
  Calendar,
  ExternalLink,
  MessageSquare,
  Search,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const TeacherCabinet: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'students' | 'assign' | 'submissions' | 'zoom'>('submissions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [students, setStudents] = useState<(Enrollment & { profile?: Profile; user_email?: string })[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<(Submission & { profile?: Profile; assignment?: Assignment; user_email?: string })[]>([]);
  const [zoomCalls, setZoomCalls] = useState<ZoomCall[]>([]);

  // Homework assignment form
  const [assignTargetUserId, setAssignTargetUserId] = useState<string>('all'); // 'all' or student user_id
  const [assignWeek, setAssignWeek] = useState<number>(1);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDescription, setAssignDescription] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignFilePath, setAssignFilePath] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Review submission state
  const [selectedSubmission, setSelectedSubmission] = useState<(Submission & { profile?: Profile; assignment?: Assignment }) | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Add Zoom Call form
  const [zoomTopic, setZoomTopic] = useState('');
  const [zoomDateTime, setZoomDateTime] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [addingZoom, setAddingZoom] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all teacher-related data from Supabase
  const loadTeacherData = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Students (Enrollments joined with profiles)
      const { data: enrollData, error: enrollErr } = await supabase
        .from('enrollments')
        .select('*, profile:profiles(*)')
        .order('created_at', { ascending: false });

      if (enrollErr) {
        console.error('Teacher load enrollments error:', enrollErr);
      } else if (enrollData) {
        setStudents(enrollData as any);
      }

      // 2. Fetch Assignments
      const { data: assignData, error: assignErr } = await supabase
        .from('assignments')
        .select('*')
        .order('week', { ascending: true })
        .order('created_at', { ascending: false });

      if (assignErr) {
        console.error('Teacher load assignments error:', assignErr);
      } else if (assignData) {
        setAssignments(assignData as Assignment[]);
      }

      // 3. Fetch Submissions with profiles & assignments
      const { data: subData, error: subErr } = await supabase
        .from('submissions')
        .select('*, profile:profiles(*), assignment:assignments(*)')
        .order('created_at', { ascending: false });

      if (subErr) {
        console.error('Teacher load submissions error:', subErr);
      } else if (subData) {
        setSubmissions(subData as any);
      }

      // 4. Fetch Zoom Calls
      const { data: zoomData, error: zoomErr } = await supabase
        .from('zoom_calls')
        .select('*')
        .order('created_at', { ascending: false });

      if (zoomErr) {
        console.warn('Teacher load zoom calls error:', zoomErr.message);
      } else if (zoomData) {
        setZoomCalls(zoomData as ZoomCall[]);
      }
    } catch (err: any) {
      console.error('Error in loadTeacherData:', err);
      setError(err.message || 'Ошибка загрузки данных преподавателя.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, [user]);

  // Handle: Assign Homework
  const handleAssignHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDescription.trim()) return;

    try {
      setAssigning(true);
      setError(null);
      setSuccessMsg(null);

      const targetId = assignTargetUserId === 'all' ? null : assignTargetUserId;

      if (isSupabaseConfigured && supabase) {
        const { data, error: insertErr } = await supabase
          .from('assignments')
          .insert({
            week: Number(assignWeek) || 1,
            title: assignTitle.trim(),
            description: assignDescription.trim(),
            deadline: assignDeadline.trim() || null,
            file_path: assignFilePath.trim() || null,
            target_user_id: targetId,
            teacher_id: user?.id || null,
          })
          .select()
          .single();

        if (insertErr) {
          console.error('Assign homework error:', insertErr);
          throw insertErr;
        }

        if (data) {
          setAssignments((prev) => [data as Assignment, ...prev]);
        }
      }

      setSuccessMsg(
        assignTargetUserId === 'all'
          ? 'Задание успешно назначено всем ученикам!'
          : 'Задание успешно назначено выбранному ученику!'
      );

      // Reset form
      setAssignTitle('');
      setAssignDescription('');
      setAssignDeadline('');
      setAssignFilePath('');
    } catch (err: any) {
      console.error('Failed to assign homework:', err);
      setError(err.message || 'Не удалось сохранить задание.');
    } finally {
      setAssigning(false);
    }
  };

  // Handle: Review Submission
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      setSubmittingReview(true);
      setError(null);
      setSuccessMsg(null);

      if (isSupabaseConfigured && supabase) {
        const { error: updateErr } = await supabase
          .from('submissions')
          .update({
            status: 'reviewed',
            teacher_comment: reviewComment.trim(),
          })
          .eq('id', selectedSubmission.id);

        if (updateErr) {
          console.error('Review update error:', updateErr);
          throw updateErr;
        }

        // Decrement feedback_left on student enrollment if feedback count > 0
        const studentEnrollment = students.find((s) => s.user_id === selectedSubmission.user_id);
        if (studentEnrollment && studentEnrollment.feedback_left > 0) {
          await supabase
            .from('enrollments')
            .update({
              feedback_left: Math.max(0, studentEnrollment.feedback_left - 1),
            })
            .eq('id', studentEnrollment.id);

          setStudents((prev) =>
            prev.map((enr) =>
              enr.id === studentEnrollment.id
                ? { ...enr, feedback_left: Math.max(0, enr.feedback_left - 1) }
                : enr
            )
          );
        }
      }

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSubmission.id
            ? { ...s, status: 'reviewed', teacher_comment: reviewComment.trim() }
            : s
        )
      );

      setSuccessMsg('Рецензия сохранена! Ученик сразу увидит ваш комментарий в своём кабинете.');
      setSelectedSubmission(null);
      setReviewComment('');
    } catch (err: any) {
      console.error('Failed to save review:', err);
      setError(err.message || 'Не удалось сохранить рецензию.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle: Add Zoom Call
  const handleAddZoomCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoomTopic.trim() || !zoomDateTime.trim() || !zoomLink.trim()) return;

    try {
      setAddingZoom(true);
      setError(null);
      setSuccessMsg(null);

      if (isSupabaseConfigured && supabase) {
        const { data, error: zoomErr } = await supabase
          .from('zoom_calls')
          .insert({
            title: zoomTopic.trim(),
            date_time: zoomDateTime.trim(),
            zoom_link: zoomLink.trim(),
            teacher_id: user?.id || null,
          })
          .select()
          .single();

        if (zoomErr) {
          console.error('Add zoom call error:', zoomErr);
          throw zoomErr;
        }

        if (data) {
          setZoomCalls((prev) => [data as ZoomCall, ...prev]);
        }
      }

      setSuccessMsg('Zoom-сессия добавлена в расписание для учеников!');
      setZoomTopic('');
      setZoomDateTime('');
      setZoomLink('');
    } catch (err: any) {
      console.error('Failed to add zoom call:', err);
      setError(err.message || 'Не удалось добавить Zoom-сессию.');
    } finally {
      setAddingZoom(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const name = s.profile?.full_name?.toLowerCase() || '';
    const q = searchTerm.toLowerCase();
    return name.includes(q) || s.package.includes(q);
  });

  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'sent').length;

  return (
    <div className="min-h-screen bg-[#FDFBFB] pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Teacher Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EADBDB] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-black uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4 text-[#B86868]" />
                <span>Кабинет преподавателя</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
                Учебный процесс и проверка работ
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Выдавайте домашние задания, проверяйте сданные работы учеников и планируйте Zoom-разборы.
              </p>
            </div>
            <div className="text-xs text-neutral-600 bg-[#FAF5F5] px-4 py-2.5 rounded-2xl border border-[#E8D4D4] font-medium">
              Преподаватель: <span className="font-bold text-neutral-900">{profile?.full_name || user?.email}</span>
            </div>
          </div>
        </div>

        {/* Global Notices */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#E8D4D4] pb-4">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-[#F5EAEA] border border-[#E6D4D4]'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Проверка ДЗ</span>
            {pendingSubmissionsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white">
                {pendingSubmissionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('assign')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'assign'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-[#F5EAEA] border border-[#E6D4D4]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Выдать домашнее задание</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'students'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-[#F5EAEA] border border-[#E6D4D4]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Мои ученики ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('zoom')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'zoom'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-[#F5EAEA] border border-[#E6D4D4]'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Расписание Zoom ({zoomCalls.length})</span>
          </button>
        </div>

        {/* Tab 1: Submissions (Проверка ДЗ) */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Сданные работы учеников</h2>
              <span className="text-xs text-neutral-500">Всего: {submissions.length}</span>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8D4D4]">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800">Пока нет сданных домашних заданий</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                  Когда ученики отправят решение через Личный кабинет, они сразу появятся здесь для вашей проверки.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {submissions.map((sub) => {
                  const isReviewed = sub.status === 'reviewed';
                  return (
                    <div
                      key={sub.id}
                      className={`p-6 rounded-3xl border transition-all bg-white shadow-xs ${
                        isReviewed ? 'border-neutral-200' : 'border-amber-300 bg-amber-50/20'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                isReviewed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {isReviewed ? 'Проверено' : 'Ожидает проверки'}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {new Date(sub.created_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="font-bold text-base text-neutral-900">
                            Ученик: {sub.profile?.full_name || 'Ученик курса'}
                          </div>

                          <div className="text-xs text-neutral-600 font-medium">
                            Задание: {sub.assignment?.title || `Задание недели ${sub.assignment?.week || 1}`}
                          </div>

                          <div className="bg-[#FAF5F5] p-4 rounded-2xl border border-[#E8D4D4] text-xs sm:text-sm text-neutral-800 whitespace-pre-wrap">
                            <strong className="block text-neutral-500 text-xs mb-1">Текст ответа ученика:</strong>
                            {sub.text}
                          </div>

                          {sub.file_path && (
                            <div className="pt-1">
                              <a
                                href={sub.file_path}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B86868] hover:underline"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Открыть прикрепленный файл / макет</span>
                              </a>
                            </div>
                          )}

                          {sub.teacher_comment && (
                            <div className="mt-3 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950">
                              <strong className="block font-bold text-emerald-900 mb-0.5">
                                Ваш комментарий:
                              </strong>
                              {sub.teacher_comment}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0">
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setReviewComment(sub.teacher_comment || '');
                            }}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{isReviewed ? 'Изменить рецензию' : 'Проверить и ответить'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal: Review form */}
            {selectedSubmission && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8D4D4] shadow-2xl relative">
                  <h3 className="text-lg font-black text-neutral-900 mb-1">
                    Рецензия на домашнее задание
                  </h3>
                  <p className="text-xs text-neutral-500 mb-4">
                    Ученик: {selectedSubmission.profile?.full_name} | Задание: {selectedSubmission.assignment?.title}
                  </p>

                  <form onSubmit={handleSaveReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Ваш развернутый комментарий / рекомендации:
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Напишите обратную связь: что получилось отлично, а что стоит доработать..."
                        className="w-full p-3 text-xs sm:text-sm bg-[#FAF5F5] border border-[#E2CECE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B86868] text-neutral-900"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(null)}
                        className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                      >
                        <span>{submittingReview ? 'Сохранение...' : 'Отправить рецензию'}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Assign Homework (Выдать ДЗ) */}
        {activeTab === 'assign' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8D4D4] shadow-xs h-fit">
              <h2 className="text-lg font-black text-neutral-900 mb-1">Выдать новое задание</h2>
              <p className="text-xs text-neutral-500 mb-6">
                Выберите адресата: конкретного ученика или назначьте задание всем.
              </p>

              <form onSubmit={handleAssignHomework} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Кому назначить задание:
                  </label>
                  <select
                    value={assignTargetUserId}
                    onChange={(e) => setAssignTargetUserId(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  >
                    <option value="all">🌟 Назначить всем моим ученикам (Общее)</option>
                    {students.map((st) => (
                      <option key={st.user_id} value={st.user_id}>
                        👤 {st.profile?.full_name || 'Ученик'} ({st.package})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Неделя курса:</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={assignWeek}
                      onChange={(e) => setAssignWeek(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Дедлайн сдачи:</label>
                    <input
                      type="text"
                      placeholder="до 25 окт 18:00"
                      value={assignDeadline}
                      onChange={(e) => setAssignDeadline(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Название задания:</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Разработка модульной сетки постера"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Описание и требования:</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Опишите, что должен сделать ученик, критерии оценки, форматы файлов..."
                    value={assignDescription}
                    onChange={(e) => setAssignDescription(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Ссылка на бриф/материал (опционально):</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={assignFilePath}
                    onChange={(e) => setAssignFilePath(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assigning}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  <span>{assigning ? 'Сохранение...' : 'Опубликовать задание'}</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-black text-neutral-900">Выданные задания ({assignments.length})</h2>
              {assignments.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-[#E8D4D4]">
                  <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">Пока нет созданных заданий.</p>
                </div>
              ) : (
                assignments.map((asg) => (
                  <div key={asg.id} className="p-5 bg-white rounded-2xl border border-[#E8D4D4] shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F2E6E6] text-neutral-800">
                            Неделя {asg.week}
                          </span>
                          {asg.deadline && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                              <Clock className="w-3 h-3" />
                              {asg.deadline}
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-400">
                            {asg.target_user_id ? 'Индивидуальное' : 'Для всех'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-neutral-900">{asg.title}</h4>
                        <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{asg.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Students (Мои ученики) */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-neutral-900">Список учеников</h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Поиск по имени или тарифу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8D4D4]">
                <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-xs text-neutral-500">Ученики не найдены.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E8D4D4] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#FAF5F5] border-b border-[#E8D4D4] text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Ученик</th>
                        <th className="p-4">Тариф</th>
                        <th className="p-4">Статус</th>
                        <th className="p-4">Рецензии</th>
                        <th className="p-4">Zoom</th>
                        <th className="p-4">Доступ до</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2E6E6]">
                      {filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-[#FAF8F8]">
                          <td className="p-4">
                            <div className="font-bold text-neutral-900">
                              {st.profile?.full_name || 'Ученик без имени'}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">{st.user_id}</div>
                          </td>
                          <td className="p-4 uppercase font-bold text-[11px] text-[#B86868]">
                            {st.package}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                st.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {st.status === 'active' ? 'Активен' : 'Ожидает оплаты'}
                            </span>
                          </td>
                          <td className="p-4 font-bold">{st.feedback_left}</td>
                          <td className="p-4 font-bold">{st.zoom_left}</td>
                          <td className="p-4 text-neutral-600">{st.access_until || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Zoom Calls (Расписание Zoom) */}
        {activeTab === 'zoom' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8D4D4] shadow-xs h-fit">
              <h2 className="text-lg font-black text-neutral-900 mb-1">Запланировать Zoom</h2>
              <p className="text-xs text-neutral-500 mb-6">
                Сессия появится в расписании у учеников тарифов Standard и Pro.
              </p>

              <form onSubmit={handleAddZoomCall} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Тема встречи:</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Разбор домашних заданий недели 3"
                    value={zoomTopic}
                    onChange={(e) => setZoomTopic(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Дата и время:</label>
                  <input
                    type="text"
                    required
                    placeholder="Суббота, 28 октября, 19:00 МСК"
                    value={zoomDateTime}
                    onChange={(e) => setZoomDateTime(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Ссылка на Zoom:</label>
                  <input
                    type="url"
                    required
                    placeholder="https://zoom.us/j/..."
                    value={zoomLink}
                    onChange={(e) => setZoomLink(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingZoom}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
                >
                  <Video className="w-4 h-4" />
                  <span>{addingZoom ? 'Добавление...' : 'Добавить в расписание'}</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-black text-neutral-900">Запланированные сессии ({zoomCalls.length})</h2>
              {zoomCalls.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-[#E8D4D4]">
                  <Video className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">Пока нет запланированных звонков.</p>
                </div>
              ) : (
                zoomCalls.map((call) => (
                  <div key={call.id} className="p-5 bg-white rounded-2xl border border-[#E8D4D4] shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-[#B86868]" />
                        <span className="text-xs font-bold text-[#B86868]">{call.date_time}</span>
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900">{call.title}</h4>
                    </div>
                    <a
                      href={call.zoom_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF5F5] hover:bg-[#F2E4E4] border border-[#E2CECE] text-neutral-900 flex items-center gap-1.5"
                    >
                      <span>Подключиться</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Rule 6: Temporary Debug Line (visible only to admin) */}
        {isAdmin && (
          <div className="mt-12 pt-4 border-t border-dashed border-neutral-300 text-center text-[11px] font-mono text-neutral-500">
            [debug: {user?.email || 'anon'} | role: {profile?.role || 'none'} | route: /teacher]
          </div>
        )}
      </div>
    </div>
  );
};
