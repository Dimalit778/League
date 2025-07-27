create extension if not exists "uuid-ossp";

create table  public.profiles (
    user_id uuid primary key references auth.users(id),
    name text not null,
    image_url text ,
    subscription_plan text check (subscription_plan in ('free', 'premium')) not null default 'free',
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

