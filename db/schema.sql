-- Árbitro Amateur — esquema de base de datos
--
-- Tres cursos independientes, uno por disciplina. La columna `discipline`
-- atraviesa todo el contenido y el progreso: un examen de fútbol nunca sortea
-- una pregunta de futsal, y aprobar fútbol no acredita nada en fútbol playa.
--
-- Postgres / Supabase. Ver docs/cursos.md y src/domain/types.ts.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type discipline as enum ('football', 'futsal', 'beach_soccer');

-- Origen de una regla. Nunca colapsar: presentar una regla privada como
-- reglamento oficial es el único error irrecuperable del producto.
create type rule_source as enum ('official', 'competition', 'private');

create type question_type as enum (
  'multiple_choice', 'true_false', 'decision_tree',
  'image_case', 'video_case', 'positioning'
);

create type match_format as enum (
  'F5', 'F6', 'F7', 'F8', 'F9', 'F11', 'FUTSAL', 'BEACH'
);

create type incident_type as enum (
  'goal', 'caution', 'send_off', 'accumulated_foul', 'timeout', 'other'
);

-- ---------------------------------------------------------------------------
-- Usuario
-- ---------------------------------------------------------------------------

create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Un registro por curso en el que el usuario se inscribió. Los cursos son
-- independientes: se puede estar en el módulo 6 de fútbol y no haber empezado
-- futsal.
create table course_progress (
  user_id       uuid not null references profiles (id) on delete cascade,
  discipline    discipline not null,
  rules_version text not null,
  current_level int not null default 0,
  xp            int not null default 0,
  streak        int not null default 0,
  -- Puntuaciones 0-100 por habilidad. Se guarda como jsonb porque el conjunto
  -- de habilidades varía por disciplina: offside solo aplica a fútbol,
  -- accumulated_fouls solo a futsal.
  skills        jsonb not null default '{}'::jsonb,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  primary key (user_id, discipline)
);

-- ---------------------------------------------------------------------------
-- Contenido del curso
-- ---------------------------------------------------------------------------

create table modules (
  id             text primary key,
  discipline     discipline not null,
  "order"        int not null,
  title          text not null,
  laws           int[] not null default '{}',
  critical       boolean not null default false,
  required_score int not null default 80,
  unique (discipline, "order")
);

create table lessons (
  id             text primary key,
  module_id      text not null references modules (id) on delete cascade,
  "order"        int not null,
  title          text not null,
  -- El cuerpo vive en Markdown en disco, no en la base: se versiona con git y
  -- se actualiza sin migración cuando cambia la edición del reglamento.
  content_path   text not null,
  rule_reference text,
  unique (module_id, "order")
);

create table questions (
  id             uuid primary key default gen_random_uuid(),
  discipline     discipline not null,
  module_id      text not null references modules (id) on delete cascade,
  rules_version  text not null,
  type           question_type not null,
  difficulty     int not null check (difficulty between 1 and 5),
  question       text not null,
  options        jsonb,
  correct_answer jsonb not null,
  -- Obligatoria. Una pregunta sin explicación no enseña nada.
  explanation    text not null,
  rule_reference text,
  source         rule_source not null default 'official',
  tags           text[] not null default '{}'
);

create index questions_by_course on questions (discipline, module_id);
create index questions_by_tags on questions using gin (tags);

-- ---------------------------------------------------------------------------
-- Progreso
-- ---------------------------------------------------------------------------

create table module_progress (
  user_id      uuid not null references profiles (id) on delete cascade,
  module_id    text not null references modules (id) on delete cascade,
  score        int not null default 0,
  completed    boolean not null default false,
  attempts     int not null default 0,
  completed_at timestamptz,
  primary key (user_id, module_id)
);

create table attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  answer      jsonb not null,
  -- Puntos obtenidos sobre 10, para crédito parcial por componentes:
  -- infracción 3, técnica 3, disciplina 2, reanudación 2.
  points      int not null default 0,
  correct     boolean not null,
  created_at  timestamptz not null default now()
);

create index attempts_by_user on attempts (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Videos complementarios
-- ---------------------------------------------------------------------------

-- Catálogo curado de material de terceros. Nunca es fuente reglamentaria: la
-- lección manda. Un video sin revisar no se muestra.
create table lesson_videos (
  youtube_id              text primary key,
  discipline              discipline not null,
  title                   text not null,
  channel                 text not null,
  language                text not null,
  duration_seconds        int not null,
  start_seconds           int,
  end_seconds             int,
  reviewed                boolean not null default false,
  reviewed_at             timestamptz,
  rules_version_at_review text not null,
  caveat                  text,
  available               boolean not null default true,
  last_checked_at         timestamptz
);

create table lesson_video_links (
  youtube_id text not null references lesson_videos (youtube_id) on delete cascade,
  lesson_id  text not null references lessons (id) on delete cascade,
  primary key (youtube_id, lesson_id)
);

-- ---------------------------------------------------------------------------
-- Competencias y partidos
-- ---------------------------------------------------------------------------

create table competitions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  name       text not null,
  discipline discipline not null,
  format     match_format not null,
  -- Ficha del reglamento privado. jsonb porque los campos que tienen sentido
  -- dependen de la disciplina: no hay offside que configurar en futsal.
  rules      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table matches (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles (id) on delete cascade,
  competition_id uuid references competitions (id) on delete set null,
  discipline     discipline not null,
  date           date not null,
  venue          text,
  format         match_format not null,
  team_a         text not null,
  team_b         text not null,
  score_a        int not null default 0,
  score_b        int not null default 0,
  notes          text,
  -- Autoevaluación 1-5 por área, más las tres preguntas abiertas.
  self_assessment jsonb
);

create index matches_by_user on matches (user_id, date desc);

create table match_incidents (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references matches (id) on delete cascade,
  minute      int not null,
  period      int not null default 1,
  type        incident_type not null,
  team        char(1) not null check (team in ('A', 'B')),
  -- Dorsal o iniciales. Nunca nombre completo: los datos de jugadores se
  -- minimizan (especificación § 114).
  player      text,
  description text
);

create table practices (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  discipline discipline not null,
  type       text not null,
  date       date not null,
  duration   int,
  notes      text
);

-- ---------------------------------------------------------------------------
-- Logros
-- ---------------------------------------------------------------------------

create table achievements (
  id          text primary key,
  -- Nulo cuando el logro es transversal a los tres cursos.
  discipline  discipline,
  name        text not null,
  description text not null,
  condition   jsonb not null
);

create table user_achievements (
  user_id        uuid not null references profiles (id) on delete cascade,
  achievement_id text not null references achievements (id) on delete cascade,
  earned_at      timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------------------------------------------------------------------------
-- Certificados
-- ---------------------------------------------------------------------------

-- Uno por curso. Interno: no constituye matrícula, licencia ni habilitación
-- oficial de ninguna asociación, y el texto emitido debe decirlo.
create table certificates (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles (id) on delete cascade,
  discipline     discipline not null,
  rules_version  text not null,
  exam_score     int not null,
  matches_logged int not null,
  issued_at      timestamptz not null default now(),
  unique (user_id, discipline)
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

-- El contenido del curso es de lectura pública. Todo lo que es del usuario
-- queda restringido a su propia fila.

alter table profiles          enable row level security;
alter table course_progress   enable row level security;
alter table module_progress   enable row level security;
alter table attempts          enable row level security;
alter table competitions      enable row level security;
alter table matches           enable row level security;
alter table match_incidents   enable row level security;
alter table practices         enable row level security;
alter table user_achievements enable row level security;
alter table certificates      enable row level security;

create policy own_profile on profiles
  for all using (id = auth.uid());

create policy own_course_progress on course_progress
  for all using (user_id = auth.uid());

create policy own_module_progress on module_progress
  for all using (user_id = auth.uid());

create policy own_attempts on attempts
  for all using (user_id = auth.uid());

create policy own_competitions on competitions
  for all using (user_id = auth.uid());

create policy own_matches on matches
  for all using (user_id = auth.uid());

create policy own_match_incidents on match_incidents
  for all using (
    exists (select 1 from matches m
            where m.id = match_incidents.match_id and m.user_id = auth.uid())
  );

create policy own_practices on practices
  for all using (user_id = auth.uid());

create policy own_achievements on user_achievements
  for all using (user_id = auth.uid());

create policy own_certificates on certificates
  for all using (user_id = auth.uid());
