import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Enrollment, Lesson, Profile, UserRole } from '../types/database';
import {
  Users,
  ShieldCheck,
  CheckCircle,
  CreditCard,
  UserCheck,
  BookOpen,
  Search,
  AlertCircle,
  Clock,
  Plus,
  Edit2
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'payments' | 'teachers' | 'mentors' | 'lessons'>('payments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Data states
  const [enrollments, setEnrollments] = useState<(Enrollment & { profile?: Profile; teacher?: Profile })[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Lesson modal state
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  // Load Admin Data from Supabase
  const loadAdminData = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Enrollments with student profile and assigned teacher profile
      const { data: enrollData, error: enrollErr } = await supabase
        .from('enrollments')
        .select('*, profile:profiles(*), teacher:profiles!enrollments_teacher_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (enrollErr) {
        // Fallback simple select if foreign key name varies
        const { data: fallbackEnroll } = await supabase
          .from('enrollments')
          .select('*, profile:profiles(*)')
          .order('created_at', { ascending: false });
        if (fallbackEnroll) setEnrollments(fallbackEnroll as any);
      } else if (enrollData) {
        setEnrollments(enrollData as any);
      }

      // 2. Fetch all Profiles to manage teacher roles
      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesErr) {
        console.error('Admin load profiles error:', profilesErr);
      } else if (profilesData) {
        setAllProfiles(profilesData as Profile[]);
      }

      // 3. Fetch Lessons
      const { data: lessonsData, error: lessonsErr } = await supabase
        .from('lessons')
        .select('*')
        .order('week', { ascending: true });

      if (lessonsErr) {
        console.error('Admin load lessons error:', lessonsErr);
      } else if (lessonsData) {
        setLessons(lessonsData as Lesson[]);
      }
    } catch (err: any) {
      console.error('Admin data load error:', err);
      setError(err.message || 'Ошибка загрузки данных администратора.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  // Handler: Confirm payment & grant access for 5 months
  const handleConfirmPayment = async (enrollmentId: string, customMonths = 5) => {
    try {
      setActionSuccess(null);
      setError(null);

      const accessUntilDate = new Date();
      accessUntilDate.setMonth(accessUntilDate.getMonth() + customMonths);
      const accessUntilStr = accessUntilDate.toISOString().split('T')[0];

      if (isSupabaseConfigured && supabase) {
        const { error: updateErr } = await supabase
          .from('enrollments')
          .update({
            status: 'active',
            access_until: accessUntilStr,
          })
          .eq('id', enrollmentId);

        if (updateErr) {
          console.error('Confirm payment error:', updateErr);
          throw updateErr;
        }
      }

      setEnrollments((prev) =>
        prev.map((enr) =>
          enr.id === enrollmentId
            ? { ...enr, status: 'active', access_until: accessUntilStr }
            : enr
        )
      );

      setActionSuccess(`Оплата подтверждена! Доступ открыт на ${customMonths} месяцев (до ${accessUntilStr}).`);
    } catch (err: any) {
      console.error('Failed to confirm payment:', err);
      setError(err.message || 'Не удалось подтвердить оплату.');
    }
  };

  // Handler: Change user role in profiles table
  const handleChangeRole = async (profileId: string, newRole: UserRole) => {
    try {
      setActionSuccess(null);
      setError(null);

      if (isSupabaseConfigured && supabase) {
        const { error: roleErr } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', profileId);

        if (roleErr) {
          console.error('Role update error:', roleErr);
          throw roleErr;
        }
      }

      setAllProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );

      setActionSuccess(`Роль пользователя успешно изменена на «${newRole}»!`);
    } catch (err: any) {
      console.error('Failed to update role:', err);
      setError(err.message || 'Не удалось изменить роль пользователя.');
    }
  };

  // Handler: Assign student to teacher
  const handleAssignTeacherToStudent = async (enrollmentId: string, teacherId: string | null) => {
    try {
      setActionSuccess(null);
      setError(null);

      if (isSupabaseConfigured && supabase) {
        const { error: assignErr } = await supabase
          .from('enrollments')
          .update({ teacher_id: teacherId || null })
          .eq('id', enrollmentId);

        if (assignErr) {
          console.error('Assign teacher error:', assignErr);
          throw assignErr;
        }
      }

      const assignedTeacher = allProfiles.find((p) => p.id === teacherId);

      setEnrollments((prev) =>
        prev.map((enr) =>
          enr.id === enrollmentId
            ? { ...enr, teacher_id: teacherId, teacher: assignedTeacher }
            : enr
        )
      );

      setActionSuccess(
        teacherId
          ? `Ученик прикреплен к преподавателю ${assignedTeacher?.full_name || 'Преподаватель'}!`
          : 'Назначение преподавателя снято.'
      );
    } catch (err: any) {
      console.error('Failed to assign teacher:', err);
      setError(err.message || 'Не удалось назначить преподавателя.');
    }
  };

  // Handler: Save Lesson
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson?.title) return;

    try {
      setActionSuccess(null);

      if (editingLesson.id) {
        if (isSupabaseConfigured && supabase) {
          await supabase
            .from('lessons')
            .update({
              title: editingLesson.title,
              week: Number(editingLesson.week) || 1,
              description: editingLesson.description || '',
              pdf_path: editingLesson.pdf_path || null,
            })
            .eq('id', editingLesson.id);
        }

        setLessons((prev) =>
          prev.map((l) =>
            l.id === editingLesson.id
              ? ({
                  ...l,
                  title: editingLesson.title!,
                  week: Number(editingLesson.week) || 1,
                  description: editingLesson.description || '',
                  pdf_path: editingLesson.pdf_path || null,
                } as Lesson)
              : l
          )
        );
        setActionSuccess('Урок успешно обновлен.');
      } else {
        const newLesson: Lesson = {
          id: `lesson-${Date.now()}`,
          title: editingLesson.title,
          week: Number(editingLesson.week) || 1,
          description: editingLesson.description || '',
          pdf_path: editingLesson.pdf_path || null,
          created_at: new Date().toISOString(),
        };

        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase
            .from('lessons')
            .insert({
              title: newLesson.title,
              week: newLesson.week,
              description: newLesson.description,
              pdf_path: newLesson.pdf_path,
            })
            .select()
            .single();

          if (data) newLesson.id = data.id;
        }

        setLessons((prev) => [...prev, newLesson].sort((a, b) => a.week - b.week));
        setActionSuccess('Новый урок успешно добавлен.');
      }

      setLessonModalOpen(false);
      setEditingLesson(null);
    } catch (err: any) {
      console.error('Save lesson error:', err);
      setError(err.message || 'Ошибка сохранения урока.');
    }
  };

  const teachersList = allProfiles.filter((p) => p.role === 'teacher' || p.role === 'admin');

  return (
    <div className="min-h-screen bg-[#FAF5F5] pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8D4D4] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Панель администратора школы</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
                Управление курсом, учителями и оплатами
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Подтверждайте оплаты учеников, назначайте преподавателей и распределяйте студентов.
              </p>
            </div>
            <div className="text-xs text-neutral-600 bg-[#FAF5F5] px-4 py-2.5 rounded-2xl border border-[#E8D4D4] font-medium">
              Администратор: <span className="font-bold text-neutral-900">{profile?.full_name || user?.email}</span>
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

        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#E8D4D4] pb-4">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-[#F5EAEA] border border-[#E6D4D4]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Подтверждение оплат</span>
            {enrollments.filter((e) => e.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
                {enrollments.filter((e) => e.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'teachers'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-[#F5EAEA] border border-[#E6D4D4]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Назначить преподавателей ({teachersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'mentors'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-[#F5EAEA] border border-[#E6D4D4]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Распределить учеников</span>
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'lessons'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-[#F5EAEA] border border-[#E6D4D4]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Уроки курса ({lessons.length})</span>
          </button>
        </div>

        {/* Tab 1: Confirm Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Записи на курс и оплата</h2>
              <span className="text-xs text-neutral-500">Всего заявок: {enrollments.length}</span>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8D4D4] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF5F5] border-b border-[#E8D4D4] text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Ученик</th>
                      <th className="p-4">Тариф</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4">Доступ до</th>
                      <th className="p-4 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2E6E6]">
                    {enrollments.map((enr) => {
                      const isPending = enr.status === 'pending';
                      return (
                        <tr key={enr.id} className="hover:bg-[#FAF8F8]">
                          <td className="p-4">
                            <div className="font-bold text-neutral-900">
                              {enr.profile?.full_name || 'Ученик без имени'}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">{enr.user_id}</div>
                          </td>
                          <td className="p-4 uppercase font-bold text-[11px] text-[#B86868]">
                            {enr.package}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isPending
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isPending ? 'Ожидает оплаты' : 'Активен'}
                            </span>
                          </td>
                          <td className="p-4 text-neutral-600">{enr.access_until || '—'}</td>
                          <td className="p-4 text-right">
                            {isPending ? (
                              <button
                                onClick={() => handleConfirmPayment(enr.id, 5)}
                                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                              >
                                Подтвердить оплату (5 мес.)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleConfirmPayment(enr.id, 5)}
                                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                              >
                                Продлить еще на 5 мес.
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Create / Manage Teachers */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Пользователи и роли (Учителя)</h2>
              <p className="text-xs text-neutral-600 mt-1">
                Здесь отображаются все зарегистрированные профили. Вы можете выдать права преподавателя любому пользователю.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8D4D4] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF5F5] border-b border-[#E8D4D4] text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Имя / ID</th>
                      <th className="p-4">Текущая роль в базе</th>
                      <th className="p-4">Дата регистрации</th>
                      <th className="p-4 text-right">Назначить роль</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2E6E6]">
                    {allProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF8F8]">
                        <td className="p-4">
                          <div className="font-bold text-neutral-900">{p.full_name || 'Пользователь'}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{p.id}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              p.role === 'admin'
                                ? 'bg-amber-100 text-amber-900'
                                : p.role === 'teacher'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {p.role === 'admin' ? 'Администратор' : p.role === 'teacher' ? 'Преподаватель' : 'Ученик'}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-500 text-xs">
                          {new Date(p.created_at).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {p.role !== 'teacher' && (
                              <button
                                onClick={() => handleChangeRole(p.id, 'teacher')}
                                className="px-3 py-1 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition-colors cursor-pointer"
                              >
                                Сделать преподавателем
                              </button>
                            )}
                            {p.role === 'teacher' && (
                              <button
                                onClick={() => handleChangeRole(p.id, 'student')}
                                className="px-3 py-1 text-xs font-semibold bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg transition-colors cursor-pointer"
                              >
                                Снять роль учителя
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Assign Students to Teachers */}
        {activeTab === 'mentors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Распределение учеников по преподавателям</h2>
              <p className="text-xs text-neutral-600 mt-1">
                Закрепите каждого студента за преподавателем, который будет проверять его домашние задания.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8D4D4] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF5F5] border-b border-[#E8D4D4] text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Ученик</th>
                      <th className="p-4">Тариф</th>
                      <th className="p-4">Назначенный преподаватель</th>
                      <th className="p-4 text-right">Выбрать преподавателя</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2E6E6]">
                    {enrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-[#FAF8F8]">
                        <td className="p-4">
                          <div className="font-bold text-neutral-900">
                            {enr.profile?.full_name || 'Ученик'}
                          </div>
                        </td>
                        <td className="p-4 uppercase font-bold text-[11px] text-[#B86868]">
                          {enr.package}
                        </td>
                        <td className="p-4">
                          {enr.teacher_id ? (
                            <span className="font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                              {enr.teacher?.full_name || 'Преподаватель назначен'}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic">Не назначен</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={enr.teacher_id || ''}
                            onChange={(e) => handleAssignTeacherToStudent(enr.id, e.target.value || null)}
                            className="p-1.5 text-xs bg-white border border-[#E2CECE] rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                          >
                            <option value="">(Не назначен)</option>
                            {teachersList.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.full_name || 'Преподаватель'} ({t.role})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Course Lessons */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Уроки курса (6 недель)</h2>
              <button
                onClick={() => {
                  setEditingLesson({ week: 1, title: '', description: '', pdf_path: '' });
                  setLessonModalOpen(true);
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить урок</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="p-5 bg-white rounded-2xl border border-[#E8D4D4] shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F2E6E6] text-neutral-800">
                        Неделя {lesson.week}
                      </span>
                      <h4 className="font-bold text-sm text-neutral-900 mt-1">{lesson.title}</h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{lesson.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingLesson(lesson);
                        setLessonModalOpen(true);
                      }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: Edit Lesson */}
            {lessonModalOpen && editingLesson && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8D4D4] shadow-2xl">
                  <h3 className="text-lg font-black text-neutral-900 mb-4">
                    {editingLesson.id ? 'Редактировать урок' : 'Новый урок'}
                  </h3>

                  <form onSubmit={handleSaveLesson} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Неделя:</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        required
                        value={editingLesson.week || 1}
                        onChange={(e) => setEditingLesson({ ...editingLesson, week: Number(e.target.value) })}
                        className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Название урока:</label>
                      <input
                        type="text"
                        required
                        value={editingLesson.title || ''}
                        onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                        className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Описание:</label>
                      <textarea
                        required
                        rows={3}
                        value={editingLesson.description || ''}
                        onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                        className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Ссылка на PDF:</label>
                      <input
                        type="url"
                        value={editingLesson.pdf_path || ''}
                        onChange={(e) => setEditingLesson({ ...editingLesson, pdf_path: e.target.value })}
                        className="w-full p-2.5 bg-[#FAF5F5] border border-[#E2CECE] rounded-xl text-xs sm:text-sm text-neutral-900"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLessonModalOpen(false);
                          setEditingLesson(null);
                        }}
                        className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer"
                      >
                        Сохранить
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rule 6: Temporary Debug Line (visible only to admin) */}
        {isAdmin && (
          <div className="mt-12 pt-4 border-t border-dashed border-neutral-300 text-center text-[11px] font-mono text-neutral-500">
            [debug: {user?.email || 'anon'} | role: {profile?.role || 'none'} | route: /admin]
          </div>
        )}
      </div>
    </div>
  );
};
