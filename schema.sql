-- ==============================================================================
-- СХЕМА БАЗЫ ДАННЫХ ДЛЯ ПРОЕКТА «ШКОЛА ГРАФИЧЕСКОГО ДИЗАЙНА» (AIRY PLANE)
-- Выполните данный скрипт в Supabase SQL Editor (вкладка SQL Editor в консоли проекта)
-- ==============================================================================

-- 1. ТАБЛИЦА ПРОФИЛЕЙ (PROFILES)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  created_at timestamp with time zone default now() not null
);

-- Если таблица уже создана ранее со старым ограничением ('student', 'admin'),
-- обновляем ограничение для поддержки роли 'teacher':
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('student', 'teacher', 'admin'));

-- 2. ТАБЛИЦА ЗАПИСЕЙ НА КУРС (ENROLLMENTS)
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  package text not null check (package in ('basic', 'standard', 'pro')),
  status text not null default 'pending' check (status in ('pending', 'active')),
  access_until date,
  feedback_left integer not null default 0,
  zoom_left integer not null default 0,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now() not null
);

-- Добавляем колонку teacher_id, если таблица уже создана
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'enrollments' and column_name = 'teacher_id') then
    alter table public.enrollments add column teacher_id uuid references public.profiles(id) on delete set null;
  end if;
end $$;

-- 3. ТАБЛИЦА УРОКОВ (LESSONS)
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  week integer not null check (week between 1 and 12),
  description text not null,
  pdf_path text,
  created_at timestamp with time zone default now() not null
);

-- 4. ТАБЛИЦА ДОМАШНИХ ЗАДАНИЙ (ASSIGNMENTS)
create table if not exists public.assignments (
  id uuid default gen_random_uuid() primary key,
  week integer not null check (week between 1 and 12),
  title text not null,
  description text not null,
  file_path text,
  deadline text,
  target_user_id uuid references auth.users(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now() not null
);

-- Добавляем колонки deadline, target_user_id, teacher_id, file_path если отсутствуют
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'assignments' and column_name = 'deadline') then
    alter table public.assignments add column deadline text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'assignments' and column_name = 'target_user_id') then
    alter table public.assignments add column target_user_id uuid references auth.users(id) on delete cascade;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'assignments' and column_name = 'teacher_id') then
    alter table public.assignments add column teacher_id uuid references public.profiles(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'assignments' and column_name = 'file_path') then
    alter table public.assignments add column file_path text;
  end if;
end $$;

-- 5. ТАБЛИЦА СДАННЫХ РАБОТ УЧЕНИКОВ (SUBMISSIONS)
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  text text not null,
  file_path text,
  status text not null default 'sent' check (status in ('sent', 'reviewed')),
  teacher_comment text,
  created_at timestamp with time zone default now() not null
);

-- 6. ТАБЛИЦА РАСПИСАНИЯ ZOOM-СЕССИЙ (ZOOM_CALLS)
create table if not exists public.zoom_calls (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date_time text not null,
  zoom_link text not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now() not null
);

-- ==============================================================================
-- ИНДЕКСЫ ДЛЯ БЫСТРОДЕЙСТВИЯ (INDEXES)
-- ==============================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_enrollments_user_id on public.enrollments(user_id);
create index if not exists idx_enrollments_teacher_id on public.enrollments(teacher_id);
create index if not exists idx_submissions_user_id on public.submissions(user_id);
create index if not exists idx_submissions_assignment_id on public.submissions(assignment_id);
create index if not exists idx_assignments_target_user_id on public.assignments(target_user_id);

-- ==============================================================================
-- ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО СОЗДАНИЯ ПРОФИЛЯ ПРИ РЕГИСТРАЦИИ (TRIGGER)
-- Создает профиль с ролью 'student' для каждого нового пользователя auth.users
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- BACKFILL: ЗАПОЛНЕНИЕ ПРОФИЛЕЙ ДЛЯ УЖЕ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ
-- ==============================================================================
insert into public.profiles (id, full_name, role)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'student'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- ==============================================================================
-- НАЗНАЧЕНИЕ РОЛЕЙ АДМИНИСТРАТОРА И ПРЕПОДАВАТЕЛЯ (RUN AFTER REGISTRATION)
-- ==============================================================================
-- Назначить роль 'teacher' для преподавателя (например mahmudimunisa8@gmail.com):
update public.profiles
set role = 'teacher'
where id = (select id from auth.users where lower(email) = lower('mahmudimunisa8@gmail.com'));

-- Или назначить роль 'admin' (администратор имеет полный доступ ко всем окнам):
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where lower(email) = lower('mahmudimunisa8@gmail.com'));

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) ПОЛИТИКИ
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.lessons enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.zoom_calls enable row level security;

-- Вспомогательная функция для проверки роли текущего пользователя
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$ language sql stable security definer;

-- PROFILES
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select to authenticated using (true);

drop policy if exists "Users can update own profile or admins can update any" on public.profiles;
create policy "Users can update own profile or admins can update any" on public.profiles
  for update to authenticated using (
    id = auth.uid() or public.get_my_role() = 'admin'
  );

drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert profiles" on public.profiles
  for insert to authenticated with check (
    id = auth.uid() or public.get_my_role() = 'admin'
  );

-- ENROLLMENTS
drop policy if exists "Enrollments viewable by owner, teacher or admin" on public.enrollments;
create policy "Enrollments viewable by owner, teacher or admin" on public.enrollments
  for select to authenticated using (
    user_id = auth.uid() or teacher_id = auth.uid() or public.get_my_role() in ('teacher', 'admin')
  );

drop policy if exists "Enrollments insertable by authenticated users" on public.enrollments;
create policy "Enrollments insertable by authenticated users" on public.enrollments
  for insert to authenticated with check (
    user_id = auth.uid() or public.get_my_role() = 'admin'
  );

drop policy if exists "Enrollments updatable by admin or teacher" on public.enrollments;
create policy "Enrollments updatable by admin or teacher" on public.enrollments
  for update to authenticated using (
    public.get_my_role() in ('admin', 'teacher')
  );

-- LESSONS
drop policy if exists "Lessons viewable by authenticated users" on public.lessons;
create policy "Lessons viewable by authenticated users" on public.lessons
  for select to authenticated using (true);

drop policy if exists "Lessons editable by teachers and admins" on public.lessons;
create policy "Lessons editable by teachers and admins" on public.lessons
  for all to authenticated using (
    public.get_my_role() in ('teacher', 'admin')
  );

-- ASSIGNMENTS
drop policy if exists "Assignments viewable by students, teachers and admins" on public.assignments;
create policy "Assignments viewable by students, teachers and admins" on public.assignments
  for select to authenticated using (
    target_user_id is null or target_user_id = auth.uid() or public.get_my_role() in ('teacher', 'admin')
  );

drop policy if exists "Assignments editable by teachers and admins" on public.assignments;
create policy "Assignments editable by teachers and admins" on public.assignments
  for all to authenticated using (
    public.get_my_role() in ('teacher', 'admin')
  );

-- SUBMISSIONS
drop policy if exists "Submissions viewable by owner, teacher or admin" on public.submissions;
create policy "Submissions viewable by owner, teacher or admin" on public.submissions
  for select to authenticated using (
    user_id = auth.uid() or public.get_my_role() in ('teacher', 'admin')
  );

drop policy if exists "Students can insert own submissions" on public.submissions;
create policy "Students can insert own submissions" on public.submissions
  for insert to authenticated with check (
    user_id = auth.uid()
  );

drop policy if exists "Submissions updatable by owner, teacher or admin" on public.submissions;
create policy "Submissions updatable by owner, teacher or admin" on public.submissions
  for update to authenticated using (
    user_id = auth.uid() or public.get_my_role() in ('teacher', 'admin')
  );

-- ZOOM CALLS
drop policy if exists "Zoom calls viewable by authenticated users" on public.zoom_calls;
create policy "Zoom calls viewable by authenticated users" on public.zoom_calls
  for select to authenticated using (true);

drop policy if exists "Zoom calls editable by teachers and admins" on public.zoom_calls;
create policy "Zoom calls editable by teachers and admins" on public.zoom_calls
  for all to authenticated using (
    public.get_my_role() in ('teacher', 'admin')
  );

-- ==============================================================================
-- СТАРТОВЫЙ НАБОР УРОКОВ (6 НЕДЕЛЬ)
-- ==============================================================================
insert into public.lessons (week, title, description, pdf_path)
values
  (
    1,
    'Неделя 1. Визуальная коммуникация и референсы',
    'Как устроена визуальная коммуникация, как развивать насмотренность, портрет аудитории. Анализ референсов и визуального контекста.',
    'https://example.com/materials/week-1-visual-communication.pdf'
  ),
  (
    2,
    'Неделя 2. Композиция и сетки',
    'Основы композиции, модульные сетки в дизайне, баланс, ритм, воздух и поля. Аргументация решений перед заказчиком.',
    'https://example.com/materials/week-2-composition-grids.pdf'
  ),
  (
    3,
    'Неделя 3. Типографика и работа с текстом',
    'Шрифты, иерархия, кегль, интерлиньяж, длина строки, микротипографика, гармоничные пары и верстка брифа.',
    'https://example.com/materials/week-3-typography.pdf'
  ),
  (
    4,
    'Неделя 4. Цвет и изображения',
    'Основы цвета, цветовые гармонии, поиск и обработка изображений, работа с масками и слоями в Adobe Photoshop.',
    'https://example.com/materials/week-4-color-photoshop.pdf'
  ),
  (
    5,
    'Неделя 5. Векторная графика в Adobe Illustrator',
    'Иконки, паттерны, стилизация иллюстраций, кривые Безье и точная векторная графика.',
    'https://example.com/materials/week-5-illustrator-vector.pdf'
  ),
  (
    6,
    'Неделя 6. Брендинг и портфолио',
    'Что такое фирменный стиль, логотип и знак, как оформить портфолио и презентовать кейс клиенту.',
    'https://example.com/materials/week-6-branding-portfolio.pdf'
  )
on conflict do nothing;

-- Стартовый набор заданий
insert into public.assignments (week, title, description)
values
  (
    1,
    'Мини-проект: Мудборд визуальной коммуникации',
    'Соберите концептуальный мудборд для выбранного проекта или бренда. Опишите портрет целевой аудитории, подберите качественные визуальные референсы, текстуры, типографические настроения и цветовую палитру.'
  ),
  (
    2,
    'Мини-проект: Исправить слабый макет и оформить 3 поста для соцсетей',
    'Проанализируйте слабый макет, выявите ошибки в композиции и сетке. Переработайте структуру и оформите серию из 3 гармоничных постов для социальных сетей (1080x1080) с соблюдением модульной сетки и полей.'
  ),
  (
    3,
    'Мини-проект: Сверстать статью или афишу',
    'Сверстайте журнальную статью или выставочную афишу по брифу. Проработайте строгую шрифтовую иерархию (заголовок, лид, врезы, основной текст), выверите кегль, интерлиньяж и комфортную длину строки.'
  ),
  (
    4,
    'Мини-проект: Цифровой плакат в Adobe Photoshop',
    'Создайте выразительный цифровой плакат в Adobe Photoshop. Продемонстрируйте осознанную работу с цветом, кадрированием и обработкой изображений, соедините типографику с графической основой.'
  ),
  (
    5,
    'Мини-проект: Набор иконок и паттерн в Adobe Illustrator',
    'В Adobe Illustrator нарисуйте авторский набор из 6 векторных иконок в единой стилистике (толщина линий, скругления, пропорции) и разработайте бесшовный паттерн для фирменного носителя.'
  ),
  (
    6,
    'Финальный проект: Мини-айдентика бренда (логотип, цвета, шрифты, 3 примера применения)',
    'Разработайте комплексную мини-айдентику бренда: логотип и знак, фирменную палитру, шрифтовую систему и минимум 3 примера применения на реальных носителях (визитка, упаковка, мерч, вывеска или баннер).'
  )
on conflict do nothing;
