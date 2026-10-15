/* DEMO, удалить после скриншотов */
import React, { useState } from 'react';
import {
  demoCurrentStudent,
  demoStudentLessons,
  demoStudentAssignments,
  demoZoomSchedule,
  DemoAssignment,
} from './demoData';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Upload,
  Video,
  MessageSquare,
  Send,
  Calendar,
  Sparkles,
  ExternalLink,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

interface DemoStudentCabinetProps {
  onBackToLanding: () => void;
}

export const DemoStudentCabinet: React.FC<DemoStudentCabinetProps> = ({ onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'lessons' | 'zoom'>('assignments');
  const [assignments, setAssignments] = useState<DemoAssignment[]>(demoStudentAssignments);
  
  // Interactive homework submission for screenshots
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Self-checklist for demo
  const [checklists, setChecklists] = useState<Record<string, boolean[]>>({
    'asg-1': [true, true, true, true],
    'asg-2': [true, true, true, true],
    'asg-3': [true, true, false, false],
    'asg-4': [false, false, false, false],
  });

  const toggleChecklistItem = (assignmentId: string, index: number) => {
    setChecklists((prev) => {
      const current = prev[assignmentId] || [false, false, false, false];
      const next = [...current];
      next[index] = !next[index];
      return { ...prev, [assignmentId]: next };
    });
  };

  const handleMockSubmit = (e: React.FormEvent, assignment: DemoAssignment) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    setUploading(true);
    setTimeout(() => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignment.id
            ? {
                ...a,
                status: 'pending_review',
                submissionDate: 'Только что',
                submissionText: submissionText.trim(),
                submissionFile: submissionFileName || 'My_Airplane_Artwork_v1.pdf',
                teacherComment: 'Работа принята куратором. Ожидайте разбор в течение 24 часов.',
              }
            : a
        )
      );
      setUploading(false);
      setSubmissionSuccessNotice('Работа успешно отправлена на проверку ментору!');
      setActiveAssignmentId(null);
      setSubmissionText('');
      setSubmissionFileName('');
    }, 600);
  };

  const setSubmissionSuccessNotice = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const completedCount = assignments.filter((a) => a.status === 'reviewed').length;
  const inProgressCount = assignments.filter((a) => a.status === 'pending_review').length;
  const progressPercentage = Math.round(((completedCount + inProgressCount * 0.5) / assignments.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF5F5] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* STUDENT PROFILE & PACKAGE OVERVIEW CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8D4D4] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-[#FAF0F0] to-[#F5E1E1] rounded-full blur-2xl opacity-60 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F0E4E4]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-neutral-900 text-white rounded-full font-bold text-xs uppercase tracking-wider">
                  Кабинет ученика
                </span>
                <span className="px-3 py-1 bg-[#FAF0F0] text-[#B86868] border border-[#E8D4D4] rounded-full font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{demoCurrentStudent.packageName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Доступ активен</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
                  {demoCurrentStudent.name}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  {demoCurrentStudent.email} · Наставник: <strong className="text-neutral-800">{demoCurrentStudent.teacherName}</strong>
                </p>
              </div>
            </div>

            {/* Key Student Metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 bg-[#FAF5F5] p-3.5 sm:p-4 rounded-2xl border border-[#E8D4D4]">
              <div className="text-center px-1 sm:px-2">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Проверки ДЗ
                </span>
                <span className="text-base sm:text-lg font-black text-neutral-900">
                  {demoCurrentStudent.remainingFeedbacks} <span className="text-xs text-neutral-500 font-normal">из 10</span>
                </span>
              </div>
              <div className="text-center px-1 sm:px-2 border-x border-[#E8D4D4]">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Zoom-сессии
                </span>
                <span className="text-base sm:text-lg font-black text-[#B86868]">
                  {demoCurrentStudent.remainingZoomCalls} <span className="text-xs text-neutral-500 font-normal">из 4</span>
                </span>
              </div>
              <div className="text-center px-1 sm:px-2">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Доступ до
                </span>
                <span className="text-xs sm:text-sm font-bold text-neutral-800 block mt-0.5">
                  15 дек. 2026
                </span>
              </div>
            </div>
          </div>

          {/* 6-WEEK COURSE PROGRESS ROADMAP */}
          <div className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#B86868]">
                  Прогресс по программе курса (6 недель)
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-display">
                  Неделя 3 из 6 · Сдано 3 задания из 6
                </h3>
              </div>
              <div className="text-sm font-black text-neutral-900 font-display">
                {progressPercentage}% завершено
              </div>
            </div>

            {/* Progress line */}
            <div className="w-full bg-[#EFE3E3] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#B86868] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* 6-Week Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6].map((w) => {
                const asg = assignments.find((a) => a.week === w);
                const isReviewed = asg?.status === 'reviewed';
                const isPendingReview = asg?.status === 'pending_review';
                const isCurrent = w === 3;

                return (
                  <div
                    key={w}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isReviewed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isPendingReview
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : isCurrent
                        ? 'bg-white border-[#B86868] shadow-xs text-neutral-900 ring-2 ring-[#B86868]/30'
                        : 'bg-[#FAF5F5] border-[#E8D4D4] text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {isReviewed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isPendingReview ? (
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      ) : isCurrent ? (
                        <Clock className="w-3.5 h-3.5 text-[#B86868]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      )}
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        {w === 6 ? 'Диплом' : `Неделя ${w}`}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold truncate">
                      {isReviewed
                        ? 'Проверено ✓'
                        : isPendingReview
                        ? 'На проверке'
                        : isCurrent
                        ? 'Текущая'
                        : 'Впереди'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {successNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-sm font-bold shadow-sm animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-[#E8D4D4] gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Домашние задания ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'lessons'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Уроки и материалы (6 модулей)</span>
          </button>

          <button
            onClick={() => setActiveTab('zoom')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'zoom'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Расписание Zoom ({demoZoomSchedule.length})</span>
          </button>
        </div>

        {/* TAB 1: HOMEWORK ASSIGNMENTS & TEACHER FEEDBACK */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-neutral-900 font-display">
                  Практические задания и разборы ментора
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Загружайте эскизы и финальные иллюстрации. Ментор оставит аудио/текстовую рецензию и рекомендации.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {assignments.map((assignment) => {
                const isFormOpen = activeAssignmentId === assignment.id;
                const criteria = [
                  'Точность построения осевых линий и баланса крыльев',
                  'Пластика изгиба бумаги и угол атаки',
                  'Корректность распределения теней и бликов',
                  'Чистота финальной подачи иллюстрации',
                ];
                const checklistState = checklists[assignment.id] || [false, false, false, false];

                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8D4D4] space-y-6"
                  >
                    {/* Top Row: Week Badge, Title, Status */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="px-2.5 py-0.5 bg-[#FAF0F0] text-[#B86868] border border-[#E8D4D4] rounded-full font-bold text-[11px] uppercase tracking-wider">
                            Неделя {assignment.week}
                          </span>
                          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Дедлайн: {assignment.deadline}</span>
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 font-display">
                          {assignment.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl">
                          {assignment.description}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {assignment.status === 'reviewed' && (
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-bold text-xs">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Проверено {assignment.score && `· ${assignment.score}`}</span>
                          </div>
                        )}
                        {assignment.status === 'pending_review' && (
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-full font-bold text-xs">
                            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                            <span>На проверке у ментора</span>
                          </div>
                        )}
                        {assignment.status === 'not_submitted' && (
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-full font-bold text-xs">
                            <span>Ожидает сдачи</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Criteria Self-Checklist */}
                    <div className="p-4 bg-[#FAF5F5] rounded-2xl border border-[#E8D4D4] space-y-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block">
                        Критерии успешной сдачи (Чек-лист):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {criteria.map((c, idx) => (
                          <label
                            key={idx}
                            onClick={() => toggleChecklistItem(assignment.id, idx)}
                            className="flex items-start gap-2 text-neutral-700 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={checklistState[idx] || false}
                              readOnly
                              className="mt-0.5 rounded text-[#B86868] focus:ring-[#B86868] cursor-pointer"
                            />
                            <span className={checklistState[idx] ? 'line-through text-neutral-400' : ''}>
                              {c}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* STUDENT'S SUBMISSION DETAILS (IF SUBMITTED) */}
                    {assignment.submissionText && (
                      <div className="p-5 bg-[#FCF8F8] border border-[#EFE1E1] rounded-2xl space-y-3">
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span className="font-bold text-neutral-800">Ваша сданная работа:</span>
                          <span>Отправлено: {assignment.submissionDate}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-800 italic leading-relaxed">
                          «{assignment.submissionText}»
                        </p>
                        {assignment.submissionFile && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#DAC4C4] rounded-xl text-xs font-bold text-neutral-800">
                            <FileText className="w-3.5 h-3.5 text-[#B86868]" />
                            <span>{assignment.submissionFile}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TEACHER'S DETAILED FEEDBACK (IF REVIEWED) */}
                    {assignment.teacherComment && (
                      <div className="p-5 bg-gradient-to-r from-emerald-50/80 to-[#F2FAF4] border-2 border-emerald-300 rounded-2xl space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                              М
                            </div>
                            <span className="font-bold text-emerald-950">
                              Рецензия ментора: {assignment.teacherName}
                            </span>
                          </div>
                          {assignment.teacherCommentDate && (
                            <span className="text-emerald-700 text-[11px] font-medium">
                              {assignment.teacherCommentDate}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                          {assignment.teacherComment}
                        </p>
                      </div>
                    )}

                    {/* SUBMISSION FORM TOGGLE & FORM (IF NOT SUBMITTED OR UPDATING) */}
                    {assignment.status !== 'reviewed' && (
                      <div>
                        {!isFormOpen ? (
                          <button
                            onClick={() => setActiveAssignmentId(assignment.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-xs"
                          >
                            <Upload className="w-4 h-4" />
                            <span>
                              {assignment.status === 'pending_review'
                                ? 'Обновить отправленную работу'
                                : 'Сдать работу на проверку'}
                            </span>
                          </button>
                        ) : (
                          <form
                            onSubmit={(e) => handleMockSubmit(e, assignment)}
                            className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-4 animate-in fade-in"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-neutral-900">
                                Форма сдачи домашнего задания (Неделя {assignment.week}):
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveAssignmentId(null)}
                                className="text-xs text-neutral-500 hover:text-neutral-800 font-bold"
                              >
                                Отмена
                              </button>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-neutral-700 mb-1">
                                Комментарий к работе (что получилось, где возникли трудности):
                              </label>
                              <textarea
                                rows={3}
                                required
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                placeholder="Опишите процесс выполнения, используемые приёмы или задайте вопрос ментору..."
                                className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                              <div>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 hover:border-neutral-400 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer transition-colors">
                                  <FileText className="w-4 h-4 text-[#B86868]" />
                                  <span>
                                    {submissionFileName || 'Прикрепить файл (PDF, PNG, JPG)'}
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        setSubmissionFileName(e.target.files[0].name);
                                      }
                                    }}
                                  />
                                </label>
                              </div>

                              <button
                                type="submit"
                                disabled={uploading}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B86868] hover:bg-[#A05555] text-white font-bold text-xs rounded-full transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{uploading ? 'Отправляем...' : 'Отправить на проверку'}</span>
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LESSONS & MATERIALS */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-neutral-900 font-display">
                  Видеоуроки и учебные материалы курса
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  6 подробных модулей с пошаговой демонстрацией построения, кистями и конспектами.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoStudentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8D4D4] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Mock Video Placeholder */}
                    <div className="w-full aspect-video bg-neutral-900 rounded-2xl relative overflow-hidden flex items-center justify-center group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="w-12 h-12 rounded-full bg-[#B86868] text-white flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6" />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                        <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                          {lesson.duration}
                        </span>
                        {lesson.completed && (
                          <span className="bg-emerald-600/90 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                            Урок пройден ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#B86868]">
                        Модуль {lesson.week}
                      </span>
                      <h3 className="text-base font-bold text-neutral-900 font-display mt-0.5">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  {/* PDF Download Button */}
                  {lesson.pdfTitle && (
                    <div className="pt-2 border-t border-neutral-100">
                      <a
                        href="#download"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Скачивание учебного конспекта: ${lesson.pdfTitle}`);
                        }}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#B86868] hover:text-[#9A4C4C] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="truncate">{lesson.pdfTitle}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ZOOM SESSIONS SCHEDULE */}
        {activeTab === 'zoom' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-neutral-900 font-display">
                  Расписание живых Zoom-сессий и разборов
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Прямые включения с ведущим ментором Мунисой Махмуди. Записи сохраняются в течение 24 часов.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {demoZoomSchedule.map((call) => (
                <div
                  key={call.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8D4D4] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF0F0] text-[#B86868] border border-[#E8D4D4] flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-500">
                          {call.date} · {call.time}
                        </span>
                        <span className="text-xs text-neutral-400">({call.duration})</span>
                        {call.status === 'upcoming' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                            Предстоит
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-full">
                            Завершено
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 font-display">
                        {call.title}
                      </h3>
                      <p className="text-xs text-neutral-600">
                        Ведущий: <strong>{call.teacher}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    {call.status === 'upcoming' ? (
                      <a
                        href={call.zoomLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Вход в Zoom-комнату (демонстрационная ссылка)');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B86868] hover:bg-[#A05555] text-white rounded-full font-bold text-xs transition-all shadow-xs"
                      >
                        <Video className="w-4 h-4" />
                        <span>Войти в Zoom</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => alert('Открытие архивной записи созвона')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full font-bold text-xs transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Смотреть запись</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
