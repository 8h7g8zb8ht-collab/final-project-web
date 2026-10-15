/* DEMO, удалить после скриншотов */
import React, { useState } from 'react';
import {
  demoAdminStats,
  demoAdminPayments,
  demoAdminTeachers,
  demoTeacherStudentsList,
  demoStudentLessons,
  DemoPaymentItem,
  DemoTeacherItem,
} from './demoData';
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
  Sparkles,
  ArrowUpRight,
  Filter,
  Check,
  X
} from 'lucide-react';

export const DemoAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'teachers' | 'mentors' | 'lessons'>('payments');
  const [payments, setPayments] = useState<DemoPaymentItem[]>(demoAdminPayments);
  const [teachers, setTeachers] = useState<DemoTeacherItem[]>(demoAdminTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New teacher modal / form state
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherRole, setNewTeacherRole] = useState('Куратор практики');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmPayment = (paymentId: string) => {
    const p = payments.find((x) => x.id === paymentId);
    setPayments((prev) =>
      prev.map((item) =>
        item.id === paymentId ? { ...item, status: 'confirmed' } : item
      )
    );
    showToast(
      `Оплата ученика ${p?.studentName || ''} (${p?.amount.toLocaleString()} сомони) успешно подтверждена! Доступ в кабинет активирован.`
    );
  };

  const handleRejectPayment = (paymentId: string) => {
    const p = payments.find((x) => x.id === paymentId);
    setPayments((prev) =>
      prev.map((item) =>
        item.id === paymentId ? { ...item, status: 'rejected' } : item
      )
    );
    showToast(`Заявка ученика ${p?.studentName || ''} отклонена.`);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherEmail) return;

    const newT: DemoTeacherItem = {
      id: `tch-${Date.now()}`,
      name: newTeacherName,
      email: newTeacherEmail,
      role: newTeacherRole,
      studentsCount: 0,
      pendingReviews: 0,
      rating: 5.0,
      active: true,
    };

    setTeachers([...teachers, newT]);
    setNewTeacherName('');
    setNewTeacherEmail('');
    setShowAddTeacherModal(false);
    showToast(`Преподаватель ${newT.name} успешно добавлен в систему!`);
  };

  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    if (paymentFilter === 'all') return matchesSearch;
    return matchesSearch && p.status === paymentFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF5F5] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ADMIN HEADER & KEY FINANCIAL/SYSTEM KPI CARDS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8D4D4] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-[#FAF0F0] to-[#F5E1E1] rounded-full blur-2xl opacity-60 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F0E4E4]">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-neutral-900 text-white rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Панель администратора</span>
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Система активна · Версия 2.4</span>
                </span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
                  Управление школой Airy Plane
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500">
                  Мониторинг оплат, распределение студентов, статистика успеваемости и команда менторов.
                </p>
              </div>
            </div>

            {/* Quick action button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить преподавателя</span>
              </button>
            </div>
          </div>

          {/* 4 KPI CARDS */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FAF5F5] rounded-2xl border border-[#E8D4D4]">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Выручка за месяц
              </span>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 font-display mt-1">
                {demoAdminStats.totalRevenue}
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{demoAdminStats.monthlyGrowth} к пред. потоку</span>
              </span>
            </div>

            <div className="p-4 bg-[#FAF5F5] rounded-2xl border border-[#E8D4D4]">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Всего студентов
              </span>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 font-display mt-1">
                {demoAdminStats.totalStudents}
              </div>
              <span className="text-[11px] text-neutral-500 font-medium mt-1 block">
                {demoAdminStats.activeStudents} активных на курсе
              </span>
            </div>

            <div className="p-4 bg-[#FAF5F5] rounded-2xl border border-[#E8D4D4]">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Ждут подтверждения
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#B86868] font-display mt-1">
                {pendingPaymentsCount} заявки
              </div>
              <span className="text-[11px] text-[#B86868] font-medium mt-1 block">
                Требуют внимания
              </span>
            </div>

            <div className="p-4 bg-[#FAF5F5] rounded-2xl border border-[#E8D4D4]">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Преподаватели
              </span>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 font-display mt-1">
                {teachers.length} ментора
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                Доходимость: {demoAdminStats.completionRate}
              </span>
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
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Оплаты и заявки ({pendingPaymentsCount > 0 ? `${pendingPaymentsCount} новых` : '0'})</span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'teachers'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Преподаватели ({teachers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mentors')}
            className={`flex items-center gap-2 py-3 px-5 font-bold text-xs sm:text-sm border-b-2 -mb-1 transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${
              activeTab === 'mentors'
                ? 'border-[#B86868] text-[#B86868] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Распределение студентов</span>
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
            <span>Тарифы и программа</span>
          </button>
        </div>

        {/* TAB 1: PAYMENTS & ENROLLMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900 font-display">
                  Поступления оплат и подтверждение доступа
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Подтверждайте заявки, чтобы ученики мгновенно получили доступ к закрытым урокам и чату курса.
                </p>
              </div>

              {/* Filters and search */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-white p-1 rounded-full border border-[#E8D4D4] text-xs">
                  <button
                    onClick={() => setPaymentFilter('all')}
                    className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                      paymentFilter === 'all' ? 'bg-[#B86868] text-white' : 'text-neutral-600'
                    }`}
                  >
                    Все ({payments.length})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('pending')}
                    className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                      paymentFilter === 'pending' ? 'bg-[#B86868] text-white' : 'text-neutral-600'
                    }`}
                  >
                    Ожидают ({pendingPaymentsCount})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('confirmed')}
                    className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                      paymentFilter === 'confirmed' ? 'bg-[#B86868] text-white' : 'text-neutral-600'
                    }`}
                  >
                    Оплачено
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск по студенту..."
                    className="pl-9 pr-3 py-1.5 bg-white border border-[#E8D4D4] rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  />
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8D4D4] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F5] border-b border-[#E8D4D4] text-neutral-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Студент</th>
                      <th className="py-3.5 px-6">Выбранный пакет</th>
                      <th className="py-3.5 px-6">Сумма</th>
                      <th className="py-3.5 px-6">Способ оплаты</th>
                      <th className="py-3.5 px-6">Дата</th>
                      <th className="py-3.5 px-6">Статус</th>
                      <th className="py-3.5 px-6 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF5F5]/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-neutral-900 text-sm">{p.studentName}</div>
                          <div className="text-neutral-500 text-[11px]">{p.studentEmail}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              p.packageType === 'vip'
                                ? 'bg-rose-100 text-[#B86868]'
                                : p.packageType === 'standard'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {p.packageName}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-black text-neutral-900 text-sm">
                            {p.amount.toLocaleString()} сомони
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-neutral-700">{p.method}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-neutral-500 text-[11px]">{p.date}</span>
                        </td>
                        <td className="py-4 px-6">
                          {p.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full font-bold text-[11px]">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                              <span>Ожидает</span>
                            </span>
                          )}
                          {p.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[11px]">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Оплачено</span>
                            </span>
                          )}
                          {p.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold text-[11px]">
                              <span>Отклонено</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {p.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleConfirmPayment(p.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                                title="Подтвердить оплату"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Подтвердить</span>
                              </button>
                              <button
                                onClick={() => handleRejectPayment(p.id)}
                                className="p-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-500 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                                title="Отклонить"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">Обработано</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEACHERS MANAGEMENT */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900 font-display">
                  Преподавательский состав и кураторы
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Управляйте доступом менторов, следите за нагрузкой и проверяемыми работами.
                </p>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B86868] hover:bg-[#A05555] text-white rounded-full font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить преподавателя</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teachers.map((tch) => (
                <div
                  key={tch.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8D4D4] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF0F0] text-[#B86868] border border-[#E8D4D4] flex items-center justify-center font-black text-lg">
                          {tch.name[0]}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-neutral-900 font-display">
                            {tch.name}
                          </h3>
                          <p className="text-xs text-neutral-500">{tch.email}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                        ★ {tch.rating}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#FAF5F5] rounded-2xl border border-[#E8D4D4] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                          Роль в команде:
                        </span>
                        <span className="font-bold text-neutral-800">{tch.role}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                          Закреплено учеников:
                        </span>
                        <span className="font-bold text-neutral-900">{tch.studentsCount} студентов</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                    <span className="text-neutral-500">
                      Работ на проверке: <strong className="text-[#B86868]">{tch.pendingReviews}</strong>
                    </span>
                    <button
                      onClick={() => alert(`Редактирование профиля преподавателя: ${tch.name}`)}
                      className="text-[#B86868] font-bold hover:underline"
                    >
                      Настроить доступ →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MENTOR ASSIGNMENT TO STUDENTS */}
        {activeTab === 'mentors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900 font-display">
                Распределение учеников по кураторам
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Закрепите студентов тарифов «Стандарт» и «VIP» за персональными наставниками.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#E8D4D4] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF5F5] border-b border-[#E8D4D4] text-neutral-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Ученик</th>
                    <th className="py-3.5 px-6">Тариф</th>
                    <th className="py-3.5 px-6">Текущий куратор</th>
                    <th className="py-3.5 px-6 text-right">Назначить ментора</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {demoTeacherStudentsList.map((std) => (
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
                        <span className="font-bold text-neutral-800">Муниса Махмуди</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <select
                          defaultValue="tch-1"
                          onChange={() => showToast(`Ментор для ${std.name} успешно обновлен!`)}
                          className="px-3 py-1.5 bg-white border border-[#E8D4D4] rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                        >
                          <option value="tch-1">Муниса Махмуди (Главный)</option>
                          <option value="tch-2">Анна Смирнова</option>
                          <option value="tch-3">Артём Кузнецов</option>
                          <option value="tch-4">Дарья Романова</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PACKAGES & CURRICULUM */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900 font-display">
                Тарифные планы и программа 6 модулей
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Стоимость участия, наполнение пакетов и доступные материалы курса.
              </p>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8D4D4] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-full font-bold text-xs">
                    Базовый
                  </span>
                  <span className="text-xl font-black text-neutral-900 font-display">$76 (700 сомони)</span>
                </div>
                <h3 className="font-bold text-base text-neutral-900">Самостоятельное обучение</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Доступ ко всем 6 модулям видеоуроков, учебным конспектам и самопроверке по критериям. Без обратной связи.
                </p>
                <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                  Активных участников: <strong>32</strong>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-[#B86868] space-y-4 relative">
                <span className="absolute -top-3 right-6 px-3 py-0.5 bg-[#B86868] text-white rounded-full font-bold text-[10px] uppercase tracking-wider">
                  Популярный выбор
                </span>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs">
                    Стандарт
                  </span>
                  <span className="text-xl font-black text-neutral-900 font-display">$162 (1500 сомони)</span>
                </div>
                <h3 className="font-bold text-base text-neutral-900">С куратором и проверками</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Проверка всех 6 домашних заданий, 1 групповой Zoom-воркшоп, закрытый чат потока с куратором.
                </p>
                <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                  Активных участников: <strong>78</strong>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8D4D4] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-rose-100 text-[#B86868] rounded-full font-bold text-xs">
                    VIP Менторство
                  </span>
                  <span className="text-xl font-black text-neutral-900 font-display">$271 (2500 сомони)</span>
                </div>
                <h3 className="font-bold text-base text-neutral-900">Персональное наставничество</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Личные разборы от автора курса Мунисы Махмуди, 4 индивидуальных Zoom-созвона, помощь с портфолио.
                </p>
                <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                  Активных участников: <strong>19</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD TEACHER */}
        {showAddTeacherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E8D4D4] space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#B86868]">
                    Новый сотрудник
                  </span>
                  <h3 className="text-xl font-black text-neutral-900 font-display mt-0.5">
                    Добавить преподавателя
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddTeacherModal(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Имя и фамилия преподавателя:
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    placeholder="Например: Роман Смирнов"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Рабочий Email:
                  </label>
                  <input
                    type="email"
                    required
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    placeholder="roman.smirnov@airyplane.art"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Роль / Направление:
                  </label>
                  <select
                    value={newTeacherRole}
                    onChange={(e) => setNewTeacherRole(e.target.value)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#B86868]"
                  >
                    <option value="Куратор тарифа «Стандарт»">Куратор тарифа «Стандарт»</option>
                    <option value="Куратор практических заданий">Куратор практических заданий</option>
                    <option value="Преподаватель по цвету и свету">Преподаватель по цвету и свету</option>
                    <option value="Ментор дипломных проектов">Ментор дипломных проектов</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowAddTeacherModal(false)}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#B86868] hover:bg-[#A05555] text-white font-bold text-xs rounded-full shadow-xs cursor-pointer"
                  >
                    Сохранить преподавателя
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
