-- created a users table to store the user details ( user can be admin or center_head)
-- user table is created and there is also a user table in auth.user which handles auth
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    name text not null,
    center_name text not null,
    is_verified boolean default false,
    created_at timestamp default now()
);


-- student_schema --

-- Table for Centers (Merged with Regions & States)
CREATE TABLE public.centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL
);

-- Table for Students
CREATE TABLE public.students (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    date_of_registration DATE NOT NULL,
    month VARCHAR(10),
    mode_of_registration VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile_no VARCHAR(15) UNIQUE NOT NULL,
    aadhar_no VARCHAR(12) UNIQUE NOT NULL,
    gender CHAR(1),
    date_of_birth DATE,
    age INT,
    qualification VARCHAR(50),
    working_status BOOLEAN,
    family_income FLOAT,
    purpose TEXT,
    job_required BOOLEAN,
    interest_field VARCHAR(100),
    center_id INT REFERENCES centers(id) ON DELETE SET NULL,
    course_name VARCHAR(100) NOT NULL,
    total_course_fee FLOAT,
    nsdc_certificate_fees FLOAT,
    amount_paid_1 FLOAT,
    amount_paid_2 FLOAT,
    amount_paid_3 FLOAT,
    amount_paid_4 FLOAT,
    fee_outstanding FLOAT,
    receipt_number VARCHAR(50),
    bank_utr_1 VARCHAR(50),
    fee_receipt_date_1 DATE,
    bank_utr_2 VARCHAR(50),
    fee_receipt_date_2 DATE,
    bank_utr_3 VARCHAR(50),
    fee_receipt_date_3 DATE,
    bank_utr_4 VARCHAR(50),
    fee_receipt_date_4 DATE
);

-- Indexing for faster search
-- CREATE INDEX idx_students_center ON students(center_id);
-- CREATE INDEX idx_students_course ON students(course_name);
-- CREATE INDEX idx_students_email ON students(email);
-- CREATE INDEX idx_students_mobile ON students(mobile_no);
