-- =============================================================================
-- University Course Learning Platform - PostgreSQL Schema
-- Production-grade, normalized, snake_case naming
-- =============================================================================

-- Extensions (optional, for UUID or full-text search)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- Core: Users & Roles
-- -----------------------------------------------------------------------------

CREATE TABLE users (
    user_id         BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    avatar_url      VARCHAR(500),
    role            VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE students (
    student_id      BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    bio             TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON students(user_id);

CREATE TABLE instructors (
    instructor_id   BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    bio             TEXT,
    title           VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instructors_user_id ON instructors(user_id);

-- -----------------------------------------------------------------------------
-- Categories & Courses
-- -----------------------------------------------------------------------------

CREATE TABLE categories (
    category_id     BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    parent_id       BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);

CREATE TABLE courses (
    course_id       BIGSERIAL PRIMARY KEY,
    instructor_id   BIGINT NOT NULL REFERENCES instructors(instructor_id) ON DELETE RESTRICT,
    category_id     BIGINT NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    short_description VARCHAR(500),
    price           DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    thumbnail_url   VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    level           VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_category_id ON courses(category_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_slug ON courses(slug);

-- -----------------------------------------------------------------------------
-- Enrollments & Structure (Sections, Lessons)
-- -----------------------------------------------------------------------------

CREATE TABLE course_enrollments (
    enrollment_id   BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    completed_at    TIMESTAMPTZ,
    progress_percent DECIMAL(5, 2) DEFAULT 0.00 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

CREATE INDEX idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

CREATE TABLE sections (
    section_id      BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sections_course_id ON sections(course_id);

CREATE TABLE lessons (
    lesson_id       BIGSERIAL PRIMARY KEY,
    section_id      BIGINT NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    lesson_type     VARCHAR(20) NOT NULL DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment')),
    duration_minutes INT,
    video_url       VARCHAR(500),
    sort_order      INT NOT NULL DEFAULT 0,
    is_free_preview BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_section_id ON lessons(section_id);
CREATE INDEX idx_lessons_lesson_type ON lessons(lesson_type);

-- -----------------------------------------------------------------------------
-- Assignments
-- -----------------------------------------------------------------------------

CREATE TABLE assignments (
    assignment_id   BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        TIMESTAMPTZ,
    max_score       DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_course_id ON assignments(course_id);

CREATE TABLE assignment_submissions (
    submission_id   BIGSERIAL PRIMARY KEY,
    assignment_id   BIGINT NOT NULL REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content         TEXT,
    file_url        VARCHAR(500),
    score           DECIMAL(10, 2),
    feedback        TEXT,
    graded_at       TIMESTAMPTZ,
    graded_by       BIGINT REFERENCES instructors(instructor_id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);

-- -----------------------------------------------------------------------------
-- Quizzes, Questions, Answers, Attempts
-- -----------------------------------------------------------------------------

CREATE TABLE quizzes (
    quiz_id         BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    time_limit_minutes INT,
    passing_score   DECIMAL(5, 2) NOT NULL DEFAULT 70.00,
    max_attempts    INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);

CREATE TABLE questions (
    question_id     BIGSERIAL PRIMARY KEY,
    quiz_id         BIGINT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   VARCHAR(30) NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    points          DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);

CREATE TABLE answers (
    answer_id       BIGSERIAL PRIMARY KEY,
    question_id     BIGINT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    answer_text     TEXT NOT NULL,
    is_correct      BOOLEAN NOT NULL DEFAULT false,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answers_question_id ON answers(question_id);

CREATE TABLE quiz_attempts (
    attempt_id      BIGSERIAL PRIMARY KEY,
    quiz_id         BIGINT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    score           DECIMAL(10, 2),
    max_score       DECIMAL(10, 2),
    passed          BOOLEAN,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON quiz_attempts(student_id);

-- -----------------------------------------------------------------------------
-- Reviews, Certificates, Certificate Templates
-- -----------------------------------------------------------------------------

CREATE TABLE reviews (
    review_id       BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    is_approved     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, student_id)
);

CREATE INDEX idx_reviews_course_id ON reviews(course_id);
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE TABLE certificate_templates (
    template_id     BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    template_url    VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE certificates (
    certificate_id  BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    template_id     BIGINT REFERENCES certificate_templates(template_id) ON DELETE SET NULL,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_code VARCHAR(64) UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, student_id)
);

CREATE INDEX idx_certificates_course_id ON certificates(course_id);
CREATE INDEX idx_certificates_student_id ON certificates(student_id);
CREATE INDEX idx_certificates_template_id ON certificates(template_id);

-- -----------------------------------------------------------------------------
-- Notifications, Resources, Progress
-- -----------------------------------------------------------------------------

CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    notification_type VARCHAR(50),
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE TABLE course_resources (
    resource_id     BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    resource_type   VARCHAR(50) NOT NULL CHECK (resource_type IN ('file', 'link', 'document')),
    file_url        VARCHAR(500),
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_resources_course_id ON course_resources(course_id);

CREATE TABLE lesson_progress (
    progress_id     BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    lesson_id       BIGINT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_student_id ON lesson_progress(student_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

CREATE TABLE video_watch_progress (
    progress_id     BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    lesson_id       BIGINT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    watched_seconds INT NOT NULL DEFAULT 0,
    total_seconds   INT,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, lesson_id)
);

CREATE INDEX idx_video_watch_progress_student_id ON video_watch_progress(student_id);
CREATE INDEX idx_video_watch_progress_lesson_id ON video_watch_progress(lesson_id);

CREATE TABLE bookmarks (
    bookmark_id     BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    lesson_id       BIGINT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, lesson_id)
);

CREATE INDEX idx_bookmarks_student_id ON bookmarks(student_id);
CREATE INDEX idx_bookmarks_lesson_id ON bookmarks(lesson_id);

-- -----------------------------------------------------------------------------
-- Discussions
-- -----------------------------------------------------------------------------

CREATE TABLE discussions (
    discussion_id   BIGSERIAL PRIMARY KEY,
    lesson_id       BIGINT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title           VARCHAR(255),
    content         TEXT NOT NULL,
    is_pinned       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussions_lesson_id ON discussions(lesson_id);
CREATE INDEX idx_discussions_user_id ON discussions(user_id);
CREATE INDEX idx_discussions_created_at ON discussions(created_at);

CREATE TABLE discussion_replies (
    reply_id        BIGSERIAL PRIMARY KEY,
    discussion_id   BIGINT NOT NULL REFERENCES discussions(discussion_id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    parent_reply_id BIGINT REFERENCES discussion_replies(reply_id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX idx_discussion_replies_user_id ON discussion_replies(user_id);
CREATE INDEX idx_discussion_replies_parent_reply_id ON discussion_replies(parent_reply_id);

-- -----------------------------------------------------------------------------
-- Announcements, Wishlist, Payments, Coupons
-- -----------------------------------------------------------------------------

CREATE TABLE announcements (
    announcement_id BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    is_pinned       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_course_id ON announcements(course_id);

CREATE TABLE wishlist (
    wishlist_id     BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

CREATE INDEX idx_wishlist_student_id ON wishlist(student_id);
CREATE INDEX idx_wishlist_course_id ON wishlist(course_id);

CREATE TABLE payments (
    payment_id      BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE RESTRICT,
    enrollment_id   BIGINT REFERENCES course_enrollments(enrollment_id) ON DELETE SET NULL,
    amount          DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    gateway         VARCHAR(50),
    gateway_payment_id VARCHAR(255),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_course_id ON payments(course_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE TABLE coupons (
    coupon_id       BIGSERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value  DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until     TIMESTAMPTZ,
    max_uses        INT,
    used_count      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

CREATE TABLE coupon_usage (
    coupon_usage_id BIGSERIAL PRIMARY KEY,
    coupon_id       BIGINT NOT NULL REFERENCES coupons(coupon_id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    payment_id      BIGINT NOT NULL REFERENCES payments(payment_id) ON DELETE CASCADE,
    used_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_student_id ON coupon_usage(student_id);
CREATE INDEX idx_coupon_usage_payment_id ON coupon_usage(payment_id);

-- -----------------------------------------------------------------------------
-- Messages, Activity Log
-- -----------------------------------------------------------------------------

CREATE TABLE messages (
    message_id      BIGSERIAL PRIMARY KEY,
    sender_id       BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id     BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject         VARCHAR(255),
    body            TEXT NOT NULL,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE TABLE activity_log (
    log_id          BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    metadata        JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- -----------------------------------------------------------------------------
-- Tags, Course Tags, Prerequisites
-- -----------------------------------------------------------------------------

CREATE TABLE tags (
    tag_id          BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    slug            VARCHAR(50) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE course_tags (
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    tag_id          BIGINT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (course_id, tag_id)
);

CREATE INDEX idx_course_tags_course_id ON course_tags(course_id);
CREATE INDEX idx_course_tags_tag_id ON course_tags(tag_id);

CREATE TABLE course_prerequisites (
    course_id               BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    prerequisite_course_id   BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (course_id, prerequisite_course_id),
    CHECK (course_id != prerequisite_course_id)
);

CREATE INDEX idx_course_prerequisites_course_id ON course_prerequisites(course_id);
CREATE INDEX idx_course_prerequisites_prerequisite_course_id ON course_prerequisites(prerequisite_course_id);

-- -----------------------------------------------------------------------------
-- Course Ratings History, Instructor Earnings
-- -----------------------------------------------------------------------------

CREATE TABLE course_ratings_history (
    history_id      BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    previous_rating SMALLINT CHECK (previous_rating >= 1 AND previous_rating <= 5),
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_ratings_history_course_id ON course_ratings_history(course_id);
CREATE INDEX idx_course_ratings_history_student_id ON course_ratings_history(student_id);
CREATE INDEX idx_course_ratings_history_changed_at ON course_ratings_history(changed_at);

CREATE TABLE instructor_earnings (
    earning_id      BIGSERIAL PRIMARY KEY,
    instructor_id   BIGINT NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    enrollment_id   BIGINT NOT NULL REFERENCES course_enrollments(enrollment_id) ON DELETE CASCADE,
    amount          DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instructor_earnings_instructor_id ON instructor_earnings(instructor_id);
CREATE INDEX idx_instructor_earnings_course_id ON instructor_earnings(course_id);
CREATE INDEX idx_instructor_earnings_enrollment_id ON instructor_earnings(enrollment_id);
CREATE INDEX idx_instructor_earnings_status ON instructor_earnings(status);

-- -----------------------------------------------------------------------------
-- System Settings
-- -----------------------------------------------------------------------------

CREATE TABLE system_settings (
    setting_id      BIGSERIAL PRIMARY KEY,
    key             VARCHAR(100) NOT NULL UNIQUE,
    value           TEXT,
    value_type      VARCHAR(20) DEFAULT 'string',
    description     VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);

-- -----------------------------------------------------------------------------
-- Auth: Email Verification, Password Reset
-- -----------------------------------------------------------------------------

CREATE TABLE email_verification (
    verification_id BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verification_user_id ON email_verification(user_id);
CREATE INDEX idx_email_verification_token ON email_verification(token);
CREATE INDEX idx_email_verification_expires_at ON email_verification(expires_at);

CREATE TABLE password_reset_tokens (
    token_id        BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- -----------------------------------------------------------------------------
-- Optional: updated_at trigger (reusable)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers to tables that have the column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'users','students','instructors','categories','courses','course_enrollments',
        'sections','lessons','assignments','assignment_submissions','quizzes','questions','answers',
        'quiz_attempts','reviews','certificates','certificate_templates','course_resources',
        'lesson_progress','video_watch_progress','discussions','discussion_replies',
        'announcements','payments','coupons','instructor_earnings','system_settings'
    ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE set_updated_at()',
            t, t
        );
    EXCEPTION WHEN duplicate_object THEN NULL; -- trigger already exists
    END LOOP;
END $$;

COMMENT ON TABLE users IS 'Base user accounts; students and instructors reference this table';
COMMENT ON TABLE course_enrollments IS 'Student enrollments in courses; one row per student per course';
COMMENT ON TABLE lesson_progress IS 'Tracks which lessons a student has completed';
COMMENT ON TABLE video_watch_progress IS 'Tracks video watch position per student per lesson';
-- 1. Refund System

CREATE TYPE refund_reason_type AS ENUM (
    'technical_issue',
    'duplicate_purchase',
    'user_request',
    'fraud'
);

CREATE TABLE IF NOT EXISTS refunds (
    refund_id      BIGSERIAL PRIMARY KEY,
    payment_id     BIGINT NOT NULL REFERENCES payments(payment_id) ON DELETE CASCADE,
    reason         TEXT,
    reason_type    refund_reason_type,
    amount         DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status         VARCHAR(20) NOT NULL CHECK (status IN ('pending','approved','rejected','processed')),
    refunded_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- 2. Fix course_enrollments payment tracking

CREATE TYPE IF NOT EXISTS enrollment_source_type AS ENUM (
    'purchase',
    'coupon',
    'admin_grant',
    'free'
);

ALTER TABLE course_enrollments
    ADD COLUMN IF NOT EXISTS payment_id BIGINT REFERENCES payments(payment_id) ON DELETE SET NULL;

ALTER TABLE course_enrollments
    ADD COLUMN IF NOT EXISTS enrollment_source enrollment_source_type DEFAULT 'purchase';

CREATE INDEX IF NOT EXISTS idx_course_enrollments_payment_id ON course_enrollments(payment_id);

-- 3. Improve Assignments (Retake Support)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'assignments'
          AND column_name = 'max_score'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'assignments'
          AND column_name = 'max_grade'
    ) THEN
        ALTER TABLE assignments RENAME COLUMN max_score TO max_grade;
    END IF;
END $$;

ALTER TABLE assignments
    ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS max_attempts INT DEFAULT 1;

-- 4. Improve Quizzes

ALTER TABLE quizzes
    ADD COLUMN IF NOT EXISTS is_randomized BOOLEAN DEFAULT FALSE;

-- 5. Improve Quiz Attempts

ALTER TABLE quiz_attempts
    ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- 6. Improve Coupons

ALTER TABLE coupons
    ADD COLUMN IF NOT EXISTS min_price DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS course_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'coupons'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'course_id'
    ) THEN
        ALTER TABLE coupons
            ADD CONSTRAINT coupons_course_id_fkey
            FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coupons_course_id ON coupons(course_id);

-- 7. Improve Users (Soft Delete + Login Tracking)

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 8. Lessons Preview

ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS is_preview BOOLEAN;

UPDATE lessons
SET is_preview = COALESCE(is_preview, is_free_preview)
WHERE is_free_preview IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'lessons_preview_sync_trg'
    ) THEN
        CREATE OR REPLACE FUNCTION lessons_preview_sync()
        RETURNS TRIGGER AS $f$
        BEGIN
            IF NEW.is_preview IS NULL AND NEW.is_free_preview IS NOT NULL THEN
                NEW.is_preview := NEW.is_free_preview;
            ELSIF NEW.is_preview IS NOT NULL AND NEW.is_free_preview IS NULL THEN
                NEW.is_free_preview := NEW.is_preview;
            END IF;
            RETURN NEW;
        END;
        $f$ LANGUAGE plpgsql;

        CREATE TRIGGER lessons_preview_sync_trg
        BEFORE INSERT OR UPDATE ON lessons
        FOR EACH ROW EXECUTE PROCEDURE lessons_preview_sync();
    END IF;
END $$;

-- 9. Certificates relation improvement

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'certificates'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'template_id'
    ) THEN
        ALTER TABLE certificates
            ADD CONSTRAINT certificates_template_id_fkey
            FOREIGN KEY (template_id) REFERENCES certificate_templates(template_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 10. Announcements improvement

ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS instructor_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'announcements'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'instructor_id'
    ) THEN
        ALTER TABLE announcements
            ADD CONSTRAINT announcements_instructor_id_fkey
            FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_announcements_instructor_id ON announcements(instructor_id);

-- 11. Messages improvement

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 12. Video captions support

CREATE TABLE IF NOT EXISTS video_captions (
    caption_id    BIGSERIAL PRIMARY KEY,
    lesson_id     BIGINT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    language_code VARCHAR(10),
    caption_url   VARCHAR(500),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_captions_lesson_id ON video_captions(lesson_id);

-- 13. Reviews vs Course Ratings History Conflict

ALTER TABLE course_ratings_history
    ADD COLUMN IF NOT EXISTS review_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'course_ratings_history'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'review_id'
    ) THEN
        ALTER TABLE course_ratings_history
            ADD CONSTRAINT course_ratings_history_review_id_fkey
            FOREIGN KEY (review_id) REFERENCES reviews(review_id);
    END IF;
END $$;

-- 14. Indexing improvements (additional safety)

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_payment_id ON course_enrollments(payment_id);
CREATE INDEX IF NOT EXISTS idx_coupons_course_id ON coupons(course_id);
CREATE INDEX IF NOT EXISTS idx_announcements_instructor_id ON announcements(instructor_id);
CREATE INDEX IF NOT EXISTS idx_video_captions_lesson_id ON video_captions(lesson_id);