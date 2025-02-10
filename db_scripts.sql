-- created a users table to store the user details ( user can be admin or center_head)
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    name text not null,
    center_name text not null,
    is_verified boolean default false,
    created_at timestamp default now()
);
