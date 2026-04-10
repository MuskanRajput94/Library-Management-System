-- Library Management System — Supabase Schema
-- Run this in the Supabase SQL Editor to set up tables and seed data

CREATE TABLE IF NOT EXISTS books (
    id        SERIAL PRIMARY KEY,
    title     VARCHAR(255) NOT NULL,
    author    VARCHAR(255) NOT NULL,
    quantity  INT NOT NULL DEFAULT 1,
    available INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS members (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20)  NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id          SERIAL PRIMARY KEY,
    book_id     INT NOT NULL REFERENCES books(id),
    member_id   INT NOT NULL REFERENCES members(id),
    issue_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE DEFAULT NULL,
    fine        DECIMAL(10, 2) DEFAULT 0.00
);

-- RLS policies (public access for demo)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_books" ON books FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_members" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_transactions" ON transactions FOR ALL TO anon USING (true) WITH CHECK (true);

-- Seed data
INSERT INTO books (title, author, quantity, available) VALUES
    ('Atomic Habits',           'James Clear',          5, 3),
    ('The Psychology of Money', 'Morgan Housel',        3, 1),
    ('Deep Work',               'Cal Newport',          4, 3),
    ('Sapiens',                 'Yuval Noah Harari',    3, 2),
    ('Rich Dad Poor Dad',       'Robert Kiyosaki',      4, 2),
    ('The Alchemist',           'Paulo Coelho',         3, 2),
    ('Thinking Fast and Slow',  'Daniel Kahneman',      2, 2),
    ('The Lean Startup',        'Eric Ries',            3, 3),
    ('Zero to One',             'Peter Thiel',          2, 1),
    ('Start with Why',          'Simon Sinek',          3, 2);

INSERT INTO members (name, email, phone) VALUES
    ('Aryan Sharma',  'aryan.sharma@gmail.com',  '9876543210'),
    ('Muskan Verma',  'muskan.verma@gmail.com',  '9123456780'),
    ('Rahul Gupta',   'rahul.gupta@gmail.com',   '9988776655'),
    ('Priya Singh',   'priya.singh@gmail.com',   '9871234567'),
    ('Ankit Patel',   'ankit.patel@gmail.com',   '9009876543');
