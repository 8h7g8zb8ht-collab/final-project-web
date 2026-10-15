/* DEMO, удалить после скриншотов */
export interface DemoStudent {
  id: string;
  name: string;
  email: string;
  package: 'basic' | 'standard' | 'vip';
  packageName: string;
  avatar?: string;
  status: 'active' | 'pending';
  progress: number;
  completedTasks: number;
  totalTasks: number;
  remainingFeedbacks: number;
  totalFeedbacks: number;
  remainingZoomCalls: number;
  totalZoomCalls: number;
  accessEndDate: string;
  teacherName: string;
}

export interface DemoLesson {
  id: string;
  week: number;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  pdfUrl?: string;
  pdfTitle?: string;
  completed: boolean;
}

export interface DemoAssignment {
  id: string;
  week: number;
  title: string;
  description: string;
  deadline: string;
  status: 'reviewed' | 'pending_review' | 'not_submitted';
  score?: string;
  submissionDate?: string;
  submissionText?: string;
  submissionFile?: string;
  teacherComment?: string;
  teacherCommentDate?: string;
  teacherName?: string;
}

export interface DemoZoomCall {
  id: string;
  title: string;
  date: string;
  time: string;
  teacher: string;
  status: 'upcoming' | 'completed';
  zoomLink: string;
  duration: string;
}

export interface DemoSubmissionItem {
  id: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  week: number;
  submittedAt: string;
  text: string;
  fileName?: string;
  status: 'pending' | 'reviewed';
  teacherComment?: string;
  grade?: string;
}

export interface DemoPaymentItem {
  id: string;
  studentName: string;
  studentEmail: string;
  packageName: string;
  packageType: 'basic' | 'standard' | 'vip';
  amount: number;
  method: string;
  date: string;
  status: 'confirmed' | 'pending' | 'rejected';
}

export interface DemoTeacherItem {
  id: string;
  name: string;
  email: string;
  role: string;
  studentsCount: number;
  pendingReviews: number;
  rating: number;
  active: boolean;
}

/* =========================================================================
   1. ДАННЫЕ ДЛЯ КАБИНЕТА УЧЕНИКА
   ========================================================================= */
export const demoCurrentStudent: DemoStudent = {
  id: 'student-demo-1',
  name: 'Александра Морозова',
  email: 'alexandra.art@example.com',
  package: 'vip',
  packageName: 'Тариф «Про» ($271 / 2500 сомони)',
  status: 'active',
  progress: 67,
  completedTasks: 4,
  totalTasks: 6,
  remainingFeedbacks: 6,
  totalFeedbacks: 10,
  remainingZoomCalls: 3,
  totalZoomCalls: 4,
  accessEndDate: '15 декабря 2026',
  teacherName: 'Муниса Махмуди',
};

export const demoStudentLessons: DemoLesson[] = [
  {
    id: 'les-1',
    week: 1,
    title: 'Модуль 1: Анатомия бумажного самолётика и базовые пропорции',
    description: 'Основы построения аэродинамических форм, законы перспективы и пластика сгиба бумаги в иллюстрации.',
    duration: '48 минут',
    pdfTitle: 'Конспект_Неделя_1_Пропорции_и_Складки.pdf',
    completed: true,
  },
  {
    id: 'les-2',
    week: 2,
    title: 'Модуль 2: Светотень, объём и динамические тени в полёте',
    description: 'Техника передачи воздушного пространства, мягкие градиенты и передача скорости с помощью штриха.',
    duration: '52 минуты',
    pdfTitle: 'Гайд_Светотень_и_Воздушная_Перспектива.pdf',
    completed: true,
  },
  {
    id: 'les-3',
    week: 3,
    title: 'Модуль 3: Композиция и ракурсы: вид снизу, сверху и в вираже',
    description: 'Построение драматичной сцены с несколькими плоскостями, правило третей и кинематика движения.',
    duration: '1 час 05 минут',
    pdfTitle: 'Чеклист_Композиция_динамичного_кадра.pdf',
    completed: true,
  },
  {
    id: 'les-4',
    week: 4,
    title: 'Модуль 4: Работа с текстурой бумаги и акварельными заливками',
    description: 'Имитация фактуры крафта, рисовой бумаги и пергамента. Эффект винтажной авиационной графики.',
    duration: '44 минуты',
    pdfTitle: 'Текстуры_и_Кисти_для_Procreate_Photoshop.pdf',
    completed: false,
  },
  {
    id: 'les-5',
    week: 5,
    title: 'Модуль 5: Окружение: облака, небесный градиент и закатное солнце',
    description: 'Создание реалистичной атмосферы, работа с контровым светом и золотым часом.',
    duration: '58 минут',
    pdfTitle: 'Цветовые_Палитры_Небо_и_Закаты.pdf',
    completed: false,
  },
  {
    id: 'les-6',
    week: 6,
    title: 'Модуль 6: Финальный дипломный проект: Серия из трёх иллюстраций',
    description: 'Подготовка серии работ к публикации в портфолио Behance/ArtStation и оформление мокапов.',
    duration: '1 час 15 минут',
    pdfTitle: 'Требования_к_Дипломному_Проекту.pdf',
    completed: false,
  },
];

export const demoStudentAssignments: DemoAssignment[] = [
  {
    id: 'asg-1',
    week: 1,
    title: 'Задание 1: Базовый контур и линейный эскиз трёх моделей самолётов',
    description: 'Постройте три различных силуэта самолётиков в изометрии и ракурсе 3/4. Соблюдайте симметрию крыльев и направляющие сгибов.',
    deadline: 'Сдано 28 сентября',
    status: 'reviewed',
    score: '5 / 5 (Отлично)',
    submissionDate: '27 сентября, 19:40',
    submissionText: 'Выполнила построение трёх моделей: классический истребитель, стреловидный планер и японский оригами-джет. Сетка перспективы сохранена во втором слое.',
    submissionFile: 'Morozova_Assignment_Week1_Final.pdf',
    teacherName: 'Муниса Махмуди',
    teacherComment: 'Александра, великолепная работа с линиями! Особо отмечу идеальный баланс крыльев и точность узла сгиба на носу планера. Линейный вес выстроен грамотно. Переходим ко второму модулю!',
    teacherCommentDate: '28 сентября, 11:15',
  },
  {
    id: 'asg-2',
    week: 2,
    title: 'Задание 2: Тональный этюд и распределение светотени',
    description: 'Определите единственный источник света под углом 45 градусов. Нанесите собственные и падающие тени с учётом прозрачности бумаги.',
    deadline: 'Сдано 5 октября',
    status: 'reviewed',
    score: '5 / 5 (Превосходно)',
    submissionDate: '4 октября, 22:15',
    submissionText: 'Сделала акцент на контрасте между освещённым килем и затенённой нижней плоскостью. Добавила лёгкий рефлекс от облаков снизу.',
    submissionFile: 'Morozova_Light_and_Shadow_Study.png',
    teacherName: 'Муниса Махмуди',
    teacherComment: 'Очень тонкое чувство рефлекса! Нижняя плоскость крыла не провалилась в темноту, а осталась воздушной. Это именно то ощущение полёта, которого мы добивались на лекции.',
    teacherCommentDate: '5 октября, 14:30',
  },
  {
    id: 'asg-3',
    week: 3,
    title: 'Задание 3: Ракурс в глубокой перспективе и динамика виража',
    description: 'Изобразите самолётик, выходящий из крутого виража прямо на зрителя. Используйте динамические направляющие движения.',
    deadline: 'На проверке',
    status: 'pending_review',
    submissionDate: 'Сегодня, 11:20',
    submissionText: 'Отправила композицию с сильным ракурсом снизу вверх. Сделала лёгкий моушн-блюр на законцовках крыльев, чтобы подчеркнуть скорость.',
    submissionFile: 'Morozova_Week3_Flight_Composition_v2.pdf',
    teacherName: 'Муниса Махмуди',
    teacherComment: 'Работа принята куратором, идёт детальная проверка ментором...',
  },
  {
    id: 'asg-4',
    week: 4,
    title: 'Задание 4: Фактура акварельного листа и гранжевые края',
    description: 'Наложите текстуру плотной акварельной бумаги плотностью 300 г/м² с мягкими потёками цвета вдоль сгибов.',
    deadline: 'До 20 октября, 23:59',
    status: 'not_submitted',
  },
  {
    id: 'asg-5',
    week: 5,
    title: 'Задание 5: Пейзажное окружение: золотой закат над облаками',
    description: 'Разработайте фон с кучевыми облаками в тёплой закатной гамме. Самолётик должен гармонично вписываться в цветовую среду.',
    deadline: 'До 28 октября, 23:59',
    status: 'not_submitted',
  },
  {
    id: 'asg-6',
    week: 6,
    title: 'Дипломная работа: Презентационная триптих-серия',
    description: 'Финальная серия из трёх готовых постеров высокой чёткости для портфолио с описанием концепции.',
    deadline: 'До 10 ноября, 23:59',
    status: 'not_submitted',
  },
];

export const demoZoomSchedule: DemoZoomCall[] = [
  {
    id: 'zm-1',
    title: 'Индивидуальный разбор портфолио и дипломной концепции',
    date: '18 октября 2026',
    time: '19:00 МСК',
    teacher: 'Муниса Махмуди',
    status: 'upcoming',
    zoomLink: 'https://zoom.us/j/demo-airy-plane-call',
    duration: '45 минут',
  },
  {
    id: 'zm-2',
    title: 'Групповой воркшоп: Лайфхаки работы со светом в сложной сцене',
    date: '25 октября 2026',
    time: '18:30 МСК',
    teacher: 'Муниса Махмуди',
    status: 'upcoming',
    zoomLink: 'https://zoom.us/j/demo-airy-plane-group',
    duration: '1 час 30 минут',
  },
  {
    id: 'zm-3',
    title: 'Разбор ошибок 1-2 недели и ответы на вопросы потока',
    date: '4 октября 2026',
    time: '19:00 МСК',
    teacher: 'Муниса Махмуди',
    status: 'completed',
    zoomLink: 'https://zoom.us/rec/demo-recording-1',
    duration: '1 час 15 минут',
  },
];

/* =========================================================================
   2. ДАННЫЕ ДЛЯ КАБИНЕТА ПРЕПОДАВАТЕЛЯ
   ========================================================================= */
export const demoTeacherProfile = {
  name: 'Муниса Махмуди',
  role: 'Ведущий ментор & основатель курса',
  email: 'mahmudimunisa8@gmail.com',
  activeStudents: 18,
  pendingSubmissionsCount: 4,
  reviewedThisMonth: 52,
  averageRating: 4.95,
  upcomingCallsCount: 2,
};

export const demoTeacherSubmissions: DemoSubmissionItem[] = [
  {
    id: 'sub-t-1',
    studentName: 'Александра Морозова',
    studentEmail: 'alexandra.art@example.com',
    assignmentTitle: 'Задание 3: Ракурс в глубокой перспективе и динамика виража',
    week: 3,
    submittedAt: 'Сегодня, 11:20',
    text: 'Отправила композицию с сильным ракурсом снизу вверх. Сделала лёгкий моушн-блюр на законцовках крыльев, чтобы подчеркнуть скорость. Проверьте, пожалуйста, пропорцию дальнего закрылка.',
    fileName: 'Morozova_Week3_Flight_Composition_v2.pdf',
    status: 'pending',
  },
  {
    id: 'sub-t-2',
    studentName: 'Даниил Соколов',
    studentEmail: 'daniil.sokol@example.com',
    assignmentTitle: 'Задание 2: Тональный этюд и распределение светотени',
    week: 2,
    submittedAt: 'Сегодня, 09:45',
    text: 'Добавил контрастные тени и пробовал сделать глянцевый блик на носу самолётика. Жду ваших замечаний по плотности тени!',
    fileName: 'Sokolov_Shadows_Assignment2.png',
    status: 'pending',
  },
  {
    id: 'sub-t-3',
    studentName: 'Екатерина Васильева',
    studentEmail: 'ekaterina.v@example.com',
    assignmentTitle: 'Задание 1: Базовый контур и линейный эскиз',
    week: 1,
    submittedAt: 'Вчера, 21:10',
    text: 'Здравствуйте! Первый раз рисую самолётики в векторе. Проверила все углы по сетке, надеюсь пропорции точные.',
    fileName: 'Vasilyeva_Shapes_Week1.pdf',
    status: 'pending',
  },
  {
    id: 'sub-t-4',
    studentName: 'Михаил Орлов',
    studentEmail: 'mikhail.orlov@example.com',
    assignmentTitle: 'Задание 4: Фактура акварельного листа',
    week: 4,
    submittedAt: 'Вчера, 18:30',
    text: 'Экспериментировал с кистями сухого мазка и солевыми разводами. Посмотрите, не перегрузил ли я задний план фактурой?',
    fileName: 'Orlov_Watercolor_Texture_v1.jpg',
    status: 'pending',
  },
  {
    id: 'sub-t-5',
    studentName: 'Ирина Кузнецова',
    studentEmail: 'irina.k@example.com',
    assignmentTitle: 'Задание 2: Тональный этюд и распределение светотени',
    week: 2,
    submittedAt: '12 октября, 16:00',
    text: 'Исправила ошибки первой итерации, добавила мягкий градиент на фоне.',
    fileName: 'Kuznetsova_Shading_Final.pdf',
    status: 'reviewed',
    grade: '5 / 5 (Отлично)',
    teacherComment: 'Ирина, правки пошли на пользу! Тень стала значительно естественнее, ушла излишняя резкость на границах.',
  },
  {
    id: 'sub-t-6',
    studentName: 'Сергей Белов',
    studentEmail: 'sergey.belov@example.com',
    assignmentTitle: 'Задание 1: Линейный эскиз трёх моделей',
    week: 1,
    submittedAt: '10 октября, 14:20',
    text: 'Сдал построение классического бумажного самолёта.',
    fileName: 'Belov_Planes_Sketch.png',
    status: 'reviewed',
    grade: '4 / 5 (Хорошо)',
    teacherComment: 'Хороший каркас! Обрати внимание на правое крыло — в точке сгиба угол чуть острее, чем должен быть по чертежу.',
  },
];

export const demoTeacherStudentsList = [
  {
    id: 'std-1',
    name: 'Александра Морозова',
    email: 'alexandra.art@example.com',
    packageName: 'VIP Менторство',
    packageBadge: 'bg-rose-100 text-[#B86868]',
    progress: '67%',
    completed: '4 из 6 заданий',
    feedbacksLeft: '6 из 10 проверок',
    zoomCallsLeft: '3 звонка',
    lastActive: 'Сегодня в 11:20',
    status: 'Активна',
  },
  {
    id: 'std-2',
    name: 'Даниил Соколов',
    email: 'daniil.sokol@example.com',
    packageName: 'Стандарт',
    packageBadge: 'bg-blue-100 text-blue-800',
    progress: '33%',
    completed: '2 из 6 заданий',
    feedbacksLeft: '4 из 6 проверок',
    zoomCallsLeft: '1 звонок',
    lastActive: 'Сегодня в 09:45',
    status: 'Активен',
  },
  {
    id: 'std-3',
    name: 'Екатерина Васильева',
    email: 'ekaterina.v@example.com',
    packageName: 'VIP Менторство',
    packageBadge: 'bg-rose-100 text-[#B86868]',
    progress: '17%',
    completed: '1 из 6 заданий',
    feedbacksLeft: '9 из 10 проверок',
    zoomCallsLeft: '4 звонка',
    lastActive: 'Вчера в 21:10',
    status: 'Активна',
  },
  {
    id: 'std-4',
    name: 'Михаил Орлов',
    email: 'mikhail.orlov@example.com',
    packageName: 'Стандарт',
    packageBadge: 'bg-blue-100 text-blue-800',
    progress: '67%',
    completed: '4 из 6 заданий',
    feedbacksLeft: '2 из 6 проверок',
    zoomCallsLeft: '0 звонков',
    lastActive: 'Вчера в 18:30',
    status: 'Активен',
  },
  {
    id: 'std-5',
    name: 'Ирина Кузнецова',
    email: 'irina.k@example.com',
    packageName: 'Базовый',
    packageBadge: 'bg-neutral-100 text-neutral-800',
    progress: '33%',
    completed: '2 из 6 заданий',
    feedbacksLeft: 'Самопроверка',
    zoomCallsLeft: 'Нет',
    lastActive: '12 октября',
    status: 'Активна',
  },
  {
    id: 'std-6',
    name: 'Сергей Белов',
    email: 'sergey.belov@example.com',
    packageName: 'Стандарт',
    packageBadge: 'bg-blue-100 text-blue-800',
    progress: '17%',
    completed: '1 из 6 заданий',
    feedbacksLeft: '5 из 6 проверок',
    zoomCallsLeft: '1 звонок',
    lastActive: '10 октября',
    status: 'Активен',
  },
];

/* =========================================================================
   3. ДАННЫЕ ДЛЯ КАБИНЕТА АДМИНИСТРАТОРА
   ========================================================================= */
export const demoAdminStats = {
  totalRevenue: '142 500 сомони ($15 450)',
  monthlyGrowth: '+24.5%',
  totalStudents: 142,
  activeStudents: 89,
  pendingPaymentsCount: 3,
  teachersCount: 4,
  completionRate: '88.4%',
};

export const demoAdminPayments: DemoPaymentItem[] = [
  {
    id: 'pay-101',
    studentName: 'Полина Григорьева',
    studentEmail: 'polina.g@example.com',
    packageName: 'Тариф «Про» ($271)',
    packageType: 'vip',
    amount: 2500,
    method: 'Корти Милли / DCB',
    date: 'Сегодня, 13:40',
    status: 'pending',
  },
  {
    id: 'pay-102',
    studentName: 'Роман Демидов',
    studentEmail: 'roman.demidov@example.com',
    packageName: 'Тариф «Стандарт» ($162)',
    packageType: 'standard',
    amount: 1500,
    method: 'Банковская карта (Т-Банк)',
    date: 'Сегодня, 11:15',
    status: 'pending',
  },
  {
    id: 'pay-103',
    studentName: 'Марина Сорокина',
    studentEmail: 'marina.s@example.com',
    packageName: 'Тариф «Базовый» ($76)',
    packageType: 'basic',
    amount: 700,
    method: 'Корти Милли (Алиф)',
    date: 'Сегодня, 08:20',
    status: 'pending',
  },
  {
    id: 'pay-104',
    studentName: 'Александра Морозова',
    studentEmail: 'alexandra.art@example.com',
    packageName: 'Тариф «Про» ($271)',
    packageType: 'vip',
    amount: 2500,
    method: 'DCB / Корти Милли',
    date: '26 сентября, 15:30',
    status: 'confirmed',
  },
  {
    id: 'pay-105',
    studentName: 'Даниил Соколов',
    studentEmail: 'daniil.sokol@example.com',
    packageName: 'Тариф «Стандарт» ($162)',
    packageType: 'standard',
    amount: 1500,
    method: 'Банковская карта',
    date: '28 сентября, 19:10',
    status: 'confirmed',
  },
  {
    id: 'pay-106',
    studentName: 'Екатерина Васильева',
    studentEmail: 'ekaterina.v@example.com',
    packageName: 'Тариф «Про» ($271)',
    packageType: 'vip',
    amount: 2500,
    method: 'Безналичный расчет',
    date: '30 сентября, 12:00',
    status: 'confirmed',
  },
  {
    id: 'pay-107',
    studentName: 'Михаил Орлов',
    studentEmail: 'mikhail.orlov@example.com',
    packageName: 'Тариф «Стандарт» ($162)',
    packageType: 'standard',
    amount: 1500,
    method: 'Сбер / Т-Банк',
    date: '1 октября, 17:45',
    status: 'confirmed',
  },
  {
    id: 'pay-108',
    studentName: 'Олег Новиков',
    studentEmail: 'oleg.nov@example.com',
    packageName: 'Тариф «Базовый» ($76)',
    packageType: 'basic',
    amount: 700,
    method: 'Банковская карта',
    date: '3 октября, 10:15',
    status: 'rejected',
  },
];

export const demoAdminTeachers: DemoTeacherItem[] = [
  {
    id: 'tch-1',
    name: 'Муниса Махмуди',
    email: 'mahmudimunisa8@gmail.com',
    role: 'Главный ментор & Автор курса',
    studentsCount: 18,
    pendingReviews: 4,
    rating: 4.95,
    active: true,
  },
  {
    id: 'tch-2',
    name: 'Анна Смирнова',
    email: 'anna.smirnova@example.com',
    role: 'Куратор тарифа «Стандарт»',
    studentsCount: 26,
    pendingReviews: 3,
    rating: 4.88,
    active: true,
  },
  {
    id: 'tch-3',
    name: 'Артём Кузнецов',
    email: 'artem.kuznetsov@example.com',
    role: 'Преподаватель по 3D и композиции',
    studentsCount: 15,
    pendingReviews: 1,
    rating: 4.92,
    active: true,
  },
  {
    id: 'tch-4',
    name: 'Дарья Романова',
    email: 'daria.romanova@example.com',
    role: 'Куратор практических заданий',
    studentsCount: 22,
    pendingReviews: 2,
    rating: 4.85,
    active: true,
  },
];
