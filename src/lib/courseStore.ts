import { supabase, isSupabaseConfigured } from './supabase';
import { Lesson, Assignment, Submission, Enrollment } from '../types/database';

// 6-Week Curriculum: 6 Lessons
export const initialLessons: Lesson[] = [
  {
    id: 'lesson-1',
    week: 1,
    title: 'Неделя 1. Визуальная коммуникация и референсы',
    description: 'Как устроена визуальная коммуникация, как развивать насмотренность, портрет аудитории. Анализ референсов и визуального контекста.',
    pdf_path: 'https://example.com/materials/week-1-visual-communication.pdf',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: 'lesson-2',
    week: 2,
    title: 'Неделя 2. Композиция и сетки',
    description: 'Основы композиции, сетки в дизайне, баланс, ритм, воздух и поля. Как объяснять и аргументировать свои решения перед заказчиком.',
    pdf_path: 'https://example.com/materials/week-2-composition-grids.pdf',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'lesson-3',
    week: 3,
    title: 'Неделя 3. Типографика и работа с текстом',
    description: 'Шрифты, иерархия, кегль, интерлиньяж, длина строки, микротипографика, гармоничные пары и работа с брифом.',
    pdf_path: 'https://example.com/materials/week-3-typography.pdf',
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
  {
    id: 'lesson-4',
    week: 4,
    title: 'Неделя 4. Цвет и изображения',
    description: 'Основы цвета, цветовые гармонии, поиск и обработка изображений, работа с масками и слоями в Adobe Photoshop.',
    pdf_path: 'https://example.com/materials/week-4-color-photoshop.pdf',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'lesson-5',
    week: 5,
    title: 'Неделя 5. Векторная графика в Adobe Illustrator',
    description: 'Иконки, контуры, инструмент Pen Tool и Pathfinder, создание бесшовных паттернов, стилизация векторных иллюстраций.',
    pdf_path: 'https://example.com/materials/week-5-illustrator-vector.pdf',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'lesson-6',
    week: 6,
    title: 'Неделя 6. Брендинг и портфолио',
    description: 'Что такое фирменный стиль, построение логотипа и знака, оформление презентационного кейса в портфолио.',
    pdf_path: 'https://example.com/materials/week-6-branding-portfolio.pdf',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// 6-Week Curriculum: 6 Assignments (5 Mini-Projects + 1 Final Project)
export const initialAssignments: Assignment[] = [
  {
    id: 'assign-1',
    week: 1,
    title: 'Мини-проект 1: Мудборд визуальной коммуникации',
    description: 'Соберите концептуальный мудборд для выбранного проекта или бренда. Опишите портрет целевой аудитории, подберите качественные визуальные референсы, текстуры, типографические настроения и цветовую палитру.',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: 'assign-2',
    week: 2,
    title: 'Мини-проект 2: Исправить слабый макет и оформить 3 поста для соцсетей',
    description: 'Проанализируйте слабый макет, выявите ошибки в композиции и сетке. Переработайте структуру и оформите серию из 3 гармоничных постов для социальных сетей (1080x1080) с соблюдением модульной сетки и полей.',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'assign-3',
    week: 3,
    title: 'Мини-проект 3: Сверстать статью или афишу',
    description: 'Сверстайте журнальную статью или выставочную афишу по брифу. Проработайте строгую шрифтовую иерархию (заголовок, лид, врезы, основной текст), выверите кегль, интерлиньяж и комфортную длину строки.',
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
  {
    id: 'assign-4',
    week: 4,
    title: 'Мини-проект 4: Цифровой плакат в Adobe Photoshop',
    description: 'Создайте выразительный цифровой плакат в Adobe Photoshop. Продемонстрируйте осознанную работу с цветом, кадрированием и обработкой изображений, соедините типографику с графической основой.',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'assign-5',
    week: 5,
    title: 'Мини-проект 5: Набор иконок и паттерн в Adobe Illustrator',
    description: 'В Adobe Illustrator нарисуйте авторский набор из 6 векторных иконок в единой стилистике (толщина линий, скругления, пропорции) и разработайте бесшовный паттерн для фирменного носителя.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'assign-6',
    week: 6,
    title: 'Финальный проект: Мини-айдентика бренда',
    description: 'Разработайте комплексную мини-айдентику бренда: логотип и знак, фирменную палитру, шрифтовую систему и минимум 3 примера применения на реальных носителях (визитка, упаковка, мерч, вывеска или баннер).',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Self-Check Criteria for each week (used in Basic tier and self-evaluation)
export const assignmentChecklists: Record<number, string[]> = {
  1: [
    'Определен портрет целевой аудитории и её визуальные предпочтения',
    'Референсы сгруппированы по стилистике, колористике и настроению',
    'В мудборде выделена доминирующая концептуальная идея',
    'Мудборд аккуратно оформлен в единый презентационный лист',
  ],
  2: [
    'Использована модульная или колоночная сетка с четкими полями',
    'Соблюдено оптическое и динамическое равновесие элементов',
    'Устранены визуальный шум, слипания и ошибки в выравнивании',
    'Все 3 поста серии визуально объединены и согласованы',
  ],
  3: [
    'Подобрана гармоничная шрифтовая пара (не более 2 гарнитур)',
    'Четко выстроена иерархия: H1, подзаголовок, лид, основной текст',
    'Интерлиньяж пропорционален кеглю, длина строки комфортна (45–75 знаков)',
    'Устранены висячие предлоги, случайные переносы и «вдовы/сироты»',
  ],
  4: [
    'Выбрана осознанная цветовая палитра (правило 60-30-10)',
    'Изображение качественно откадрировано, без артефактов и мыла',
    'Текст контрастно читается на фоне графических элементов',
    'Файл сохранен в правильном цветовом профиле (RGB / sRGB)',
  ],
  5: [
    'Иконки построены по единой сетке и визуальным правилам',
    'Одинаковая толщина обводки и радиусы скругления во всех элементах',
    'Паттерн бесшовно стыкуется по вертикали и горизонтали',
    'Все векторные контуры замкнуты, векторная сетка аккуратна',
  ],
  6: [
    'Логотип и знак читаются как в крупном, так и в мелком масштабе',
    'Зафиксированы точные цветовые коды (HEX, RGB, CMYK)',
    'Определены основные и акцидентные шрифты бренда',
    'Оформлены 3 реальных носителя айдентики (визитка, мерч, упаковка и т.д.)',
  ],
};

// Helper: Get lessons from localStorage or defaults
export function getLocalLessons(): Lesson[] {
  if (typeof window === 'undefined') return initialLessons;
  const saved = localStorage.getItem('AIRY_LOCAL_LESSONS_V2');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 6) return parsed;
    } catch {}
  }
  localStorage.setItem('AIRY_LOCAL_LESSONS_V2', JSON.stringify(initialLessons));
  return initialLessons;
}

export function saveLocalLessons(lessons: Lesson[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('AIRY_LOCAL_LESSONS_V2', JSON.stringify(lessons));
  }
}

// Helper: Get assignments from localStorage or defaults
export function getLocalAssignments(): Assignment[] {
  if (typeof window === 'undefined') return initialAssignments;
  const saved = localStorage.getItem('AIRY_LOCAL_ASSIGNMENTS_V2');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 6) return parsed;
    } catch {}
  }
  localStorage.setItem('AIRY_LOCAL_ASSIGNMENTS_V2', JSON.stringify(initialAssignments));
  return initialAssignments;
}

export function saveLocalAssignments(assignments: Assignment[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('AIRY_LOCAL_ASSIGNMENTS_V2', JSON.stringify(assignments));
  }
}

export function getLocalSubmissions(): Submission[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('AIRY_LOCAL_SUBMISSIONS_V2');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  const sampleSubmissions: Submission[] = [
    {
      id: 'sub-sample-1',
      user_id: 'sample-student-1',
      assignment_id: 'assign-1',
      text: 'Здравствуйте, Муниса! Отправляю мудборд для бренда архитектурного бюро. Подобрала минималистичные референсы, бруталистские формы и пыльную теплую гамму. Буду рада комментариям!',
      file_path: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      status: 'sent',
      teacher_comment: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
  localStorage.setItem('AIRY_LOCAL_SUBMISSIONS_V2', JSON.stringify(sampleSubmissions));
  return sampleSubmissions;
}

export function saveLocalSubmissions(submissions: Submission[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('AIRY_LOCAL_SUBMISSIONS_V2', JSON.stringify(submissions));
  }
}

// Checklist state per assignment
export function getLocalChecklistState(assignmentId: string): boolean[] {
  if (typeof window === 'undefined') return [];
  const key = `AIRY_CHECKLIST_${assignmentId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return [];
}

export function saveLocalChecklistState(assignmentId: string, state: boolean[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`AIRY_CHECKLIST_${assignmentId}`, JSON.stringify(state));
  }
}

// Completed assignments tracker for self-check / basic package
export function getLocalCompletedTaskIds(): string[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('AIRY_COMPLETED_TASKS');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return [];
}

export function toggleLocalCompletedTask(assignmentId: string): boolean {
  if (typeof window === 'undefined') return false;
  const current = getLocalCompletedTaskIds();
  let updated: string[];
  let isNowDone = false;
  if (current.includes(assignmentId)) {
    updated = current.filter((id) => id !== assignmentId);
    isNowDone = false;
  } else {
    updated = [...current, assignmentId];
    isNowDone = true;
  }
  localStorage.setItem('AIRY_COMPLETED_TASKS', JSON.stringify(updated));
  return isNowDone;
}

// Mock enrollments
export function getLocalEnrollments(): (Enrollment & { profile?: { full_name: string; role: 'student' | 'admin' } })[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('AIRY_LOCAL_ENROLLMENTS_V2');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  const sampleEnrollments: (Enrollment & { profile?: { full_name: string; role: 'student' | 'admin' } })[] = [
    {
      id: 'enr-sample-1',
      user_id: 'sample-student-1',
      package: 'standard',
      status: 'active',
      access_until: new Date(Date.now() + 150 * 86400000).toISOString().split('T')[0],
      feedback_left: 2,
      zoom_left: 2,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      profile: {
        id: 'sample-student-1',
        full_name: 'Алина Соколова',
        role: 'student',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    },
    {
      id: 'enr-sample-2',
      user_id: 'sample-student-2',
      package: 'pro',
      status: 'pending',
      access_until: null,
      feedback_left: 10,
      zoom_left: 10,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profile: {
        id: 'sample-student-2',
        full_name: 'Далер Рахимов',
        role: 'student',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    },
  ];
  localStorage.setItem('AIRY_LOCAL_ENROLLMENTS_V2', JSON.stringify(sampleEnrollments));
  return sampleEnrollments;
}

export function saveLocalEnrollments(enrollments: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('AIRY_LOCAL_ENROLLMENTS_V2', JSON.stringify(enrollments));
  }
}
