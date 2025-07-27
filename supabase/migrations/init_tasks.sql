create table public.tasks (
    task_id uuid default uuid_generate_v4() primary key,
    user_id uuid not null references public.profiles on delete cascade,
    title text not null,
    description text,
    completed boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);