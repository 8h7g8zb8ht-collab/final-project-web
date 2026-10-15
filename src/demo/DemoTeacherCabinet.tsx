/* DEMO, удалить после скриншотов */
import React, { useState } from 'react';
import {
  demoTeacherProfile,
  demoTeacherSubmissions,
  demoTeacherStudentsList,
  demoZoomSchedule,
  DemoSubmissionItem,
} from './demoData';
import {
  Users,
  CheckSquare,
  Video,
  Send,
  Plus,
  Clock,
  Calendar,
  MessageSquare,
  Search,
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Sparkles,
  ExternalLink,
  Award
} from 'lucide-react';

export const DemoTeacherCabinet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'students' | 'assign' | 'zoom'>('submissions');
  const [submissions, setSubmissions] = useState<DemoSubmissionItem[]>(demoTeacherSubmissions);
  const [students, setStudents] = useState(demoTeacherStudentsList);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Review submission state
  const [selectedSub, setSelectedSub] = useState<DemoSubmissionItem | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewGrade, setReviewGrade] = useState('5 / 5 (Отлично)');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Homework assignment form
  const [assignTarget, setAssignTarget] = useState('all');
  const [assignWeek, setAssignWeek] = useState(4);
  const [assignTitle, setAssignTitle] = useState('Задание 4: Работа с текстурой бумаги и акварельными заливками');
  const [assignDescription, setAssignDescription] = useState('Выполните текстурную проработку фюзеляжа и крыльев. Используйте кисти с имитацией крафтовой бумаги плотностью 250 г/м².');
  const [assignDeadline, setAssignDeadline] = useState('20 октября 2026');
  const [assigning, setAssigning] = useState(false);

  // Add Zoom Call form
  const [zoomList, setZoomList] = useState(demoZoomSchedule);
  const [newZoomTopic, setNewZoomTopic] = useState('');
  const [newZoomDate, setNewZoomDate] = useState('');
  const [newZoomTime, setNewZoomTime] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenReviewModal = (sub: DemoSubmissionItem) => {
    setSelectedSub(sub);
    setReviewComment(
      `Отличная работа, ${sub.studentName.split(' ')[0]}! Композиция смотрится свежо и динамично. Обрати внимание на угол наклона крыла — советую добавить чуть больше мягкой тени на нижней плоскости для усиления глубины.`
    );
    setReviewGrade('5 / 5 (Отлично)');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !reviewComment.trim()) return;

    setSubmittingReview(true);
    setTimeout(() => {
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === selectedSub.id
            ? {
                ...item,
                status: 'reviewed',
                grade: reviewGrade,
                teacherComment: reviewComment.trim(),
              }
            : item
        )
      );
      setSubmittingReview(false);
      showToast(`Рецензия успешно отправлена ученику ${selectedSub.studentName}!`);
      setSelectedSub(null);
    }, 500);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    setTimeout(() => {
      setAssigning(false);
      showToast(
        assignTarget === 'all'
          ? 'Домашнее задание успешно назначено всем ученикам потока!'
          : `Домашнее задание успешно назначено выбранному ученику!`
      );
    }, 600);
  };

  const handleAddZoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoomTopic || !newZoomDate) return;

    const newCall = {
      id: `zm-${Date.now()}`,
      title: newZoomTopic,
      date: newZoomDate,
      time: newZoomTime || '19:00 МСК',
      teacher: demoTeacherProfile.name,
      status: 'upcoming' as const,
      zoomLink: 'https://zoom.us/j/demo-airy-plane-new',
      duration: '1 час',
    };

    setZoomList([newCall, ...zoomList]);
    setNewZoomTopic('');
    setNewZoomDate('');
    setNewZoomTime('');
    showToast('Новый Zoom-созвон успешно добавлен в расписание учеников!');
  };

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const reviewedSubmissions = submissions.filter((s) => s.status === 'reviewed');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF5F5] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TEACHER PROFILE & STATS OVERVIEW CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8D4D4] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-[#FAF0F0] to-[#F5E1E1] rounded-full blur-2xl opacity-60 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F0E4E4]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-neutral-900 text-white rounded-full font-bold text-xs uppercase tracking-wider">
                  Кабинет преподавателя
                </span>
                <span className="px-3 py-1 bg-[#FAF0F0] text-[#B86868] border border-[#E8D4D4] rounded-full font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ведущий ментор курса</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Рейтинг: 4.95 ★</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
                  {demoTeacherProfile.name}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  {demoTeacherProfile.email} · {demoTeacherProfile.role}
                </p>
              </div>
            </div>

            {/* Teacher Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 bg-[#FAF5F5] p-3.5 sm:p-4 rounded-2xl border border-[#E8D4D4]">
              <div className="text-center px-1 sm:px-2">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Мои ученики
                </span>
                <span className="text-base sm:text-lg font-black text-neutral-900">
                  {demoTeacherProfile.activeStudents}
                </span>
              </div>
              <div className="text-center px-1 sm:px-2 border-x border-[#E8D4D4]">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Ждут проверки
                </span>
                <span className="text-base sm:text-lg font-black text-[#B86868] animate-pulse">
                  {pendingSubmissions.length}
                </span>
              </div>
              <div className="text-center px-1 sm:px-2">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Проверено
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-700">
                  {demoTeacherProfile.reviewedThisMonth}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-600">
            <div className="flex items-center gap-3">
              <span className="font-bold text-neutral-900">Текущий поток:</span>
              <span>Октябрь 2026</span>
              <span>·</span>
              <span>Среднее время ответа ментора: <strong>4.2 часа</strong></span>
            </div>
            <div className="font-bold text-[#B86868]">
              {pendingSubmissions.length > 0
                ? `Внимание: ${pendingSubmissions.length} работ ожидают вашей рецензии!`
                : 'Все работы проверены! Отличный темп.'}
            </div>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-sm font-bold shadow-sm animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-[#E8D4D4] gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Работы на проверку ({pendingSubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Мои ученики ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assign')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'assign'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Выдать домашнее задание</span>
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
            <span>Расписание Zoom ({zoomList.length})</span>
          </button>
        </div>

        {/* TAB 1: SUBMISSIONS REVIEW (PRACTICE CHECK) */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900 font-display">
                  Очередь проверки домашних заданий
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Нажмите «Проверить работу», чтобы оставить развёрнутый комментарий, указать оценку и дать советы ученику.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full font-bold text-xs">
                  {pendingSubmissions.length} ожидают рецензии
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full font-bold text-xs">
                  {reviewedSubmissions.length} проверено
                </span>
              </div>
            </div>

            {/* List of Submissions */}
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${
                    sub.status === 'pending'
                      ? 'border-[#E8D4D4] ring-1 ring-[#B86868]/20'
                      : 'border-neutral-200 opacity-90'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-neutral-100">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-0.5 bg-[#FAF0F0] text-[#B86868] rounded-full font-bold text-[11px] uppercase tracking-wider border border-[#E8D4D4]">
                          Неделя {sub.week}
                        </span>
                        <span className="font-bold text-neutral-900 text-sm">
                          {sub.studentName}
                        </span>
                        <span className="text-xs text-neutral-400">({sub.studentEmail})</span>
                        <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Сдано: {sub.submittedAt}</span>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 font-display">
                        {sub.assignmentTitle}
                      </h3>
                    </div>

                    <div>
                      {sub.status === 'pending' ? (
                        <button
                          onClick={() => handleOpenReviewModal(sub)}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-[#B86868] hover:bg-[#A05555] text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-xs"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Проверить работу</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-bold text-xs">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>{sub.grade || 'Проверено'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Work Content */}
                  <div className="pt-4 space-y-3">
                    <div className="p-4 bg-[#FAF5F5] rounded-2xl border border-[#E8D4D4] space-y-2">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                        Комментарий ученика:
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-800 italic leading-relaxed">
                        «{sub.text}»
                      </p>
                      {sub.fileName && (
                        <div className="pt-1">
                          <a
                            href="#view-file"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Просмотр сданного файла иллюстрации: ${sub.fileName}`);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#DAC4C4] rounded-xl text-xs font-bold text-[#B86868] hover:bg-neutral-50 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>{sub.fileName}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Teacher Feedback if already reviewed */}
                    {sub.teacherComment && (
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                          Ваша отправленная рецензия ({sub.grade}):
                        </span>
                        <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                          {sub.teacherComment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: REVIEW HOMEWORK SUBMISSION */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#E8D4D4] space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#B86868]">
                    Форма проверки ментора
                  </span>
                  <h3 className="text-xl font-black text-neutral-900 font-display mt-0.5">
                    Рецензия на работу: {selectedSub.studentName}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {selectedSub.assignmentTitle} · Сдано: {selectedSub.submittedAt}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-800"
                >
                  ✕
                </button>
              </div>

              {/* Student text quote */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl text-xs text-neutral-700 italic border border-neutral-200">
                «{selectedSub.text}»
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Оценка за задание:
                  </label>
                  <select
                    value={reviewGrade}
                    onChange={(e) => setReviewGrade(e.target.value)}
                    className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  >
                    <option value="5 / 5 (Отлично)">5 / 5 — Отлично, великолепное исполнение</option>
                    <option value="4 / 5 (Хорошо)">4 / 5 — Хорошо, есть мелкие недочеты</option>
                    <option value="3 / 5 (На доработку)">3 / 5 — Требуется доработка композиции</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Развернутый комментарий преподавателя и рекомендации:
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                    placeholder="Напишите разбор техники, похвалите удачные решения и укажите, на что обратить внимание..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B86868] hover:bg-[#A05555] text-white font-bold text-xs rounded-full transition-all shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Отправляем рецензию...' : 'Отправить рецензию ученику'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MY STUDENTS LIST */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900 font-display">
                  Список закрепленных учеников
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Отслеживайте прогресс прохождения курса, остаток проверок и звонков.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по имени или email..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#E8D4D4] rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#E8D4D4] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F5] border-b border-[#E8D4D4] text-neutral-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Ученик</th>
                      <th className="py-3.5 px-6">Тариф</th>
                      <th className="py-3.5 px-6">Прогресс по курсу</th>
                      <th className="py-3.5 px-6">Остаток опций</th>
                      <th className="py-3.5 px-6">Активность</th>
                      <th className="py-3.5 px-6 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-[#FAF5F5]/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-neutral-900 text-sm">{std.name}</div>
                          <div className="text-neutral-500 text-[11px]">{std.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${std.packageBadge}`}>
                            {std.packageName}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-neutral-900">{std.progress}</div>
                          <div className="text-neutral-500 text-[11px]">{std.completed}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-neutral-800 font-medium">{std.feedbacksLeft}</div>
                          <div className="text-neutral-500 text-[11px]">{std.zoomCallsLeft}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-neutral-700">{std.lastActive}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => alert(`Открыть карточку ученика: ${std.name}`)}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Профиль
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ASSIGN HOMEWORK */}
        {activeTab === 'assign' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900 font-display">
                Назначить домашнее задание
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Создайте новое задание или выдайте индивидуальную доработку конкретному ученику.
              </p>
            </div>

            <form
              onSubmit={handleAssignSubmit}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8D4D4] space-y-5"
            >
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Кому выдать задание:
                </label>
                <select
                  value={assignTarget}
                  onChange={(e) => setAssignTarget(e.target.value)}
                  className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                >
                  <option value="all">Всем моим активным ученикам (Поток Октябрь 2026)</option>
                  <option value="std-1">Александре Морозовой (Индивидуально)</option>
                  <option value="std-2">Даниилу Соколову (Индивидуально)</option>
                  <option value="std-3">Екатерине Васильевой (Индивидуально)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Неделя модуля (1 - 6):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={assignWeek}
                    onChange={(e) => setAssignWeek(Number(e.target.value))}
                    className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Крайний срок сдачи (Дедлайн):
                  </label>
                  <input
                    type="text"
                    value={assignDeadline}
                    onChange={(e) => setAssignDeadline(e.target.value)}
                    className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Название практического задания:
                </label>
                <input
                  type="text"
                  required
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Подробное техническое задание и критерии:
                </label>
                <textarea
                  rows={4}
                  required
                  value={assignDescription}
                  onChange={(e) => setAssignDescription(e.target.value)}
                  className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => alert('Прикрепление методического шаблона PDF')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#B86868]" />
                  <span>Прикрепить образец/файл</span>
                </button>

                <button
                  type="submit"
                  disabled={assigning}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B86868] hover:bg-[#A05555] text-white font-bold text-xs rounded-full transition-all shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{assigning ? 'Публикуем задание...' : 'Опубликовать задание'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: ZOOM CALLS & SCHEDULE */}
        {activeTab === 'zoom' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900 font-display">
                  Управление Zoom-созвонами
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Планируйте групповые воркшопы и индивидуальные консультации. Ссылки автоматически появляются в кабинете ученика.
                </p>
              </div>
            </div>

            {/* Add Call Form */}
            <form
              onSubmit={handleAddZoom}
              className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8D4D4] space-y-4"
            >
              <span className="text-xs font-black uppercase tracking-wider text-[#B86868] block">
                Запланировать новый созвон
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Тема созвона:
                  </label>
                  <input
                    type="text"
                    required
                    value={newZoomTopic}
                    onChange={(e) => setNewZoomTopic(e.target.value)}
                    placeholder="Например: Разбор дипломных эскизов и подготовка к защите"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Дата и время:
                  </label>
                  <input
                    type="text"
                    required
                    value={newZoomDate}
                    onChange={(e) => setNewZoomDate(e.target.value)}
                    placeholder="30 октября, 19:00 МСК"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B86868] hover:bg-[#A05555] text-white font-bold text-xs rounded-full transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить Zoom-встречу</span>
                </button>
              </div>
            </form>

            {/* List of Scheduled Calls */}
            <div className="space-y-4">
              {zoomList.map((call) => (
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
                        {call.status === 'upcoming' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                            Активен
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-full">
                            Завершен
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 font-display">
                        {call.title}
                      </h3>
                      <p className="text-xs text-neutral-600">
                        Ссылка для подключения: <code className="text-[#B86868] font-mono">{call.zoomLink}</code>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => alert(`Копирование ссылки: ${call.zoomLink}`)}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full font-bold text-xs transition-colors"
                    >
                      Скопировать ссылку
                    </button>
                    <button
                      onClick={() => alert('Редактирование параметров созвона')}
                      className="px-4 py-2 bg-[#B86868] hover:bg-[#A05555] text-white rounded-full font-bold text-xs transition-colors shadow-xs"
                    >
                      Запустить
                    </button>
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
