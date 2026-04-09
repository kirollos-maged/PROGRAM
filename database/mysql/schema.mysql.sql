-- =============================================================================
-- University Course Learning Platform - MySQL 8+ Schema (converted from PostgreSQL)
-- Charset/Collation: utf8mb4
-- Engine: InnoDB
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Recommended SQL mode for stricter behavior
-- (Adjust to your environment as needed)
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ---------------------------------------------------------------------------
-- Core: Users & Roles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  user_id            BIGINT NOT NULL AUTO_INCREMENT,
  email              VARCHAR(255) NOT NULL,
  password_hash      VARCHAR(255) NOT NULL,
  first_name         VARCHAR(100) NOT NULL,
  last_name          VARCHAR(100) NOT NULL,
  avatar_url         VARCHAR(500) NULL,
  role               VARCHAR(20) NOT NULL DEFAULT 'student',
  is_active          TINYINT(1) NOT NULL DEFAULT 1,
  is_email_verified  TINYINT(1) NOT NULL DEFAULT 0,
  last_login_at      TIMESTAMP NULL DEFAULT NULL,
  deleted_at         TIMESTAMP NULL DEFAULT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_role CHECK (role IN ('student','instructor','admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
  student_id   BIGINT NOT NULL AUTO_INCREMENT,
  user_id      BIGINT NOT NULL,
  bio          TEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id),
  UNIQUE KEY uq_students_user_id (user_id),
  KEY idx_students_user_id (user_id),
  CONSTRAINT fk_students_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS instructors (
  instructor_id  BIGINT NOT NULL AUTO_INCREMENT,
  user_id        BIGINT NOT NULL,
  bio            TEXT NULL,
  title          VARCHAR(100) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (instructor_id),
  UNIQUE KEY uq_instructors_user_id (user_id),
  KEY idx_instructors_user_id (user_id),
  CONSTRAINT fk_instructors_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Categories & Courses
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  category_id   BIGINT NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL,
  description   TEXT NULL,
  parent_id     BIGINT NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent_id (parent_id),
  CONSTRAINT fk_categories_parent_id FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS courses (
  course_id          BIGINT NOT NULL AUTO_INCREMENT,
  instructor_id      BIGINT NOT NULL,
  category_id        BIGINT NOT NULL,
  title              VARCHAR(255) NOT NULL,
  slug               VARCHAR(255) NOT NULL,
  description        TEXT NULL,
  short_description  VARCHAR(500) NULL,
  price              DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  thumbnail_url      VARCHAR(500) NULL,
  status             VARCHAR(20) NOT NULL DEFAULT 'draft',
  level              VARCHAR(20) NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (course_id),
  UNIQUE KEY uq_courses_slug (slug),
  KEY idx_courses_instructor_id (instructor_id),
  KEY idx_courses_category_id (category_id),
  KEY idx_courses_status (status),
  CONSTRAINT fk_courses_instructor_id FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE RESTRICT,
  CONSTRAINT fk_courses_category_id FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
  CONSTRAINT chk_courses_price CHECK (price >= 0),
  CONSTRAINT chk_courses_status CHECK (status IN ('draft','published','archived')),
  CONSTRAINT chk_courses_level CHECK (level IS NULL OR level IN ('beginner','intermediate','advanced','all'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Enrollments & Structure (Sections, Lessons)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS course_enrollments (
  enrollment_id      BIGINT NOT NULL AUTO_INCREMENT,
  student_id         BIGINT NOT NULL,
  course_id          BIGINT NOT NULL,
  payment_id         BIGINT NULL,
  enrollment_source  ENUM('purchase','coupon','admin_grant','free') NOT NULL DEFAULT 'purchase',
  enrolled_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status             VARCHAR(20) NOT NULL DEFAULT 'active',
  completed_at       TIMESTAMP NULL DEFAULT NULL,
  progress_percent   DECIMAL(5,2) NULL DEFAULT 0.00,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (enrollment_id),
  UNIQUE KEY uq_course_enrollments_student_course (student_id, course_id),
  KEY idx_course_enrollments_student_id (student_id),
  KEY idx_course_enrollments_course_id (course_id),
  KEY idx_course_enrollments_status (status),
  KEY idx_course_enrollments_payment_id (payment_id),
  CONSTRAINT fk_course_enrollments_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_enrollments_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_enrollments_payment_id FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE SET NULL,
  CONSTRAINT chk_course_enrollments_status CHECK (status IN ('active','completed','dropped')),
  CONSTRAINT chk_course_enrollments_progress CHECK (progress_percent >= 0 AND progress_percent <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sections (
  section_id   BIGINT NOT NULL AUTO_INCREMENT,
  course_id    BIGINT NOT NULL,
  title        VARCHAR(255) NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (section_id),
  KEY idx_sections_course_id (course_id),
  CONSTRAINT fk_sections_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lessons (
  lesson_id        BIGINT NOT NULL AUTO_INCREMENT,
  section_id       BIGINT NOT NULL,
  title            VARCHAR(255) NOT NULL,
  content          TEXT NULL,
  lesson_type      VARCHAR(20) NOT NULL DEFAULT 'video',
  duration_minutes INT NULL,
  video_url        VARCHAR(500) NULL,
  sort_order       INT NOT NULL DEFAULT 0,
  is_free_preview  TINYINT(1) NOT NULL DEFAULT 0,
  is_preview       TINYINT(1) NULL DEFAULT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (lesson_id),
  KEY idx_lessons_section_id (section_id),
  KEY idx_lessons_lesson_type (lesson_type),
  CONSTRAINT fk_lessons_section_id FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE,
  CONSTRAINT chk_lessons_lesson_type CHECK (lesson_type IN ('video','text','quiz','assignment'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Keep backward compatibility between is_free_preview and is_preview
DROP TRIGGER IF EXISTS lessons_preview_sync_bi;
DROP TRIGGER IF EXISTS lessons_preview_sync_bu;
DELIMITER $$
CREATE TRIGGER lessons_preview_sync_bi
BEFORE INSERT ON lessons
FOR EACH ROW
BEGIN
  IF NEW.is_preview IS NULL THEN
    SET NEW.is_preview = NEW.is_free_preview;
  END IF;
  SET NEW.is_free_preview = COALESCE(NEW.is_preview, NEW.is_free_preview);
END$$
CREATE TRIGGER lessons_preview_sync_bu
BEFORE UPDATE ON lessons
FOR EACH ROW
BEGIN
  IF NEW.is_preview IS NULL THEN
    SET NEW.is_preview = NEW.is_free_preview;
  END IF;
  SET NEW.is_free_preview = COALESCE(NEW.is_preview, NEW.is_free_preview);
END$$
DELIMITER ;

-- ---------------------------------------------------------------------------
-- Assignments
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assignments (
  assignment_id        BIGINT NOT NULL AUTO_INCREMENT,
  course_id            BIGINT NOT NULL,
  title                VARCHAR(255) NOT NULL,
  description          TEXT NULL,
  due_date             TIMESTAMP NULL DEFAULT NULL,
  max_grade            DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  allow_resubmission   TINYINT(1) NULL DEFAULT 0,
  max_attempts         INT NULL DEFAULT 1,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (assignment_id),
  KEY idx_assignments_course_id (course_id),
  CONSTRAINT fk_assignments_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assignment_submissions (
  submission_id  BIGINT NOT NULL AUTO_INCREMENT,
  assignment_id  BIGINT NOT NULL,
  student_id     BIGINT NOT NULL,
  submitted_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  content        TEXT NULL,
  file_url       VARCHAR(500) NULL,
  score          DECIMAL(10,2) NULL,
  feedback       TEXT NULL,
  graded_at      TIMESTAMP NULL DEFAULT NULL,
  graded_by      BIGINT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (submission_id),
  KEY idx_assignment_submissions_assignment_id (assignment_id),
  KEY idx_assignment_submissions_student_id (student_id),
  KEY idx_assignment_submissions_graded_by (graded_by),
  CONSTRAINT fk_assignment_submissions_assignment_id FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_submissions_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES instructors(instructor_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Quizzes, Questions, Answers, Attempts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS quizzes (
  quiz_id             BIGINT NOT NULL AUTO_INCREMENT,
  course_id           BIGINT NOT NULL,
  title               VARCHAR(255) NOT NULL,
  description         TEXT NULL,
  time_limit_minutes  INT NULL,
  passing_score       DECIMAL(5,2) NOT NULL DEFAULT 70.00,
  max_attempts        INT NULL,
  is_randomized       TINYINT(1) NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (quiz_id),
  KEY idx_quizzes_course_id (course_id),
  CONSTRAINT fk_quizzes_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS questions (
  question_id     BIGINT NOT NULL AUTO_INCREMENT,
  quiz_id         BIGINT NOT NULL,
  question_text   TEXT NOT NULL,
  question_type   VARCHAR(30) NOT NULL DEFAULT 'multiple_choice',
  points          DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (question_id),
  KEY idx_questions_quiz_id (quiz_id),
  CONSTRAINT fk_questions_quiz_id FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  CONSTRAINT chk_questions_type CHECK (question_type IN ('multiple_choice','true_false','short_answer'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS answers (
  answer_id      BIGINT NOT NULL AUTO_INCREMENT,
  question_id    BIGINT NOT NULL,
  answer_text    TEXT NOT NULL,
  is_correct     TINYINT(1) NOT NULL DEFAULT 0,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (answer_id),
  KEY idx_answers_question_id (question_id),
  CONSTRAINT fk_answers_question_id FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  attempt_id     BIGINT NOT NULL AUTO_INCREMENT,
  quiz_id        BIGINT NOT NULL,
  student_id     BIGINT NOT NULL,
  started_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at   TIMESTAMP NULL DEFAULT NULL,
  completed      TINYINT(1) NOT NULL DEFAULT 0,
  score          DECIMAL(10,2) NULL,
  max_score      DECIMAL(10,2) NULL,
  passed         TINYINT(1) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  KEY idx_quiz_attempts_quiz_id (quiz_id),
  KEY idx_quiz_attempts_student_id (student_id),
  CONSTRAINT fk_quiz_attempts_quiz_id FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_attempts_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  attempt_answer_id  BIGINT NOT NULL AUTO_INCREMENT,
  attempt_id         BIGINT NOT NULL,
  question_id        BIGINT NOT NULL,
  answer_id          BIGINT NULL,
  answer_text        TEXT NULL,
  is_correct         TINYINT(1) NULL,
  points_awarded     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_answer_id),
  UNIQUE KEY uq_quiz_attempt_answers_attempt_question (attempt_id, question_id),
  KEY idx_quiz_attempt_answers_attempt_id (attempt_id),
  KEY idx_quiz_attempt_answers_question_id (question_id),
  KEY idx_quiz_attempt_answers_answer_id (answer_id),
  CONSTRAINT fk_quiz_attempt_answers_attempt_id FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_attempt_answers_question_id FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_attempt_answers_answer_id FOREIGN KEY (answer_id) REFERENCES answers(answer_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Reviews, Certificates, Certificate Templates
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reviews (
  review_id     BIGINT NOT NULL AUTO_INCREMENT,
  course_id     BIGINT NOT NULL,
  student_id    BIGINT NOT NULL,
  rating        SMALLINT NOT NULL,
  comment       TEXT NULL,
  is_approved   TINYINT(1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  UNIQUE KEY uq_reviews_course_student (course_id, student_id),
  KEY idx_reviews_course_id (course_id),
  KEY idx_reviews_student_id (student_id),
  KEY idx_reviews_rating (rating),
  CONSTRAINT fk_reviews_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS certificate_templates (
  template_id   BIGINT NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  template_url  VARCHAR(500) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS certificates (
  certificate_id      BIGINT NOT NULL AUTO_INCREMENT,
  course_id           BIGINT NOT NULL,
  student_id          BIGINT NOT NULL,
  template_id         BIGINT NULL,
  issued_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verification_code   VARCHAR(64) NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (certificate_id),
  UNIQUE KEY uq_certificates_course_student (course_id, student_id),
  UNIQUE KEY uq_certificates_verification_code (verification_code),
  KEY idx_certificates_course_id (course_id),
  KEY idx_certificates_student_id (student_id),
  KEY idx_certificates_template_id (template_id),
  CONSTRAINT fk_certificates_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_certificates_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_certificates_template_id FOREIGN KEY (template_id) REFERENCES certificate_templates(template_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Notifications, Resources, Progress
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  notification_id    BIGINT NOT NULL AUTO_INCREMENT,
  user_id            BIGINT NOT NULL,
  title              VARCHAR(255) NOT NULL,
  body               TEXT NULL,
  notification_type  VARCHAR(50) NULL,
  entity_type        VARCHAR(50) NULL,
  entity_id          BIGINT NULL,
  read_at            TIMESTAMP NULL DEFAULT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_read_at (read_at),
  KEY idx_notifications_created_at (created_at),
  CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_resources (
  resource_id     BIGINT NOT NULL AUTO_INCREMENT,
  course_id       BIGINT NOT NULL,
  title           VARCHAR(255) NOT NULL,
  resource_type   VARCHAR(50) NOT NULL,
  file_url        VARCHAR(500) NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (resource_id),
  KEY idx_course_resources_course_id (course_id),
  CONSTRAINT fk_course_resources_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT chk_course_resources_type CHECK (resource_type IN ('file','link','document'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lesson_progress (
  progress_id    BIGINT NOT NULL AUTO_INCREMENT,
  student_id     BIGINT NOT NULL,
  lesson_id      BIGINT NOT NULL,
  completed_at   TIMESTAMP NULL DEFAULT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (progress_id),
  UNIQUE KEY uq_lesson_progress_student_lesson (student_id, lesson_id),
  KEY idx_lesson_progress_student_id (student_id),
  KEY idx_lesson_progress_lesson_id (lesson_id),
  CONSTRAINT fk_lesson_progress_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_progress_lesson_id FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS video_watch_progress (
  progress_id      BIGINT NOT NULL AUTO_INCREMENT,
  student_id       BIGINT NOT NULL,
  lesson_id        BIGINT NOT NULL,
  watched_seconds  INT NOT NULL DEFAULT 0,
  total_seconds    INT NULL,
  last_watched_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (progress_id),
  UNIQUE KEY uq_video_watch_progress_student_lesson (student_id, lesson_id),
  KEY idx_video_watch_progress_student_id (student_id),
  KEY idx_video_watch_progress_lesson_id (lesson_id),
  CONSTRAINT fk_video_watch_progress_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_video_watch_progress_lesson_id FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookmarks (
  bookmark_id   BIGINT NOT NULL AUTO_INCREMENT,
  student_id    BIGINT NOT NULL,
  lesson_id     BIGINT NOT NULL,
  note          TEXT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (bookmark_id),
  UNIQUE KEY uq_bookmarks_student_lesson (student_id, lesson_id),
  KEY idx_bookmarks_student_id (student_id),
  KEY idx_bookmarks_lesson_id (lesson_id),
  CONSTRAINT fk_bookmarks_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_lesson_id FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Discussions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS discussions (
  discussion_id  BIGINT NOT NULL AUTO_INCREMENT,
  lesson_id      BIGINT NOT NULL,
  user_id        BIGINT NOT NULL,
  title          VARCHAR(255) NULL,
  content        TEXT NOT NULL,
  is_pinned      TINYINT(1) NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (discussion_id),
  KEY idx_discussions_lesson_id (lesson_id),
  KEY idx_discussions_user_id (user_id),
  KEY idx_discussions_created_at (created_at),
  CONSTRAINT fk_discussions_lesson_id FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  CONSTRAINT fk_discussions_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS discussion_replies (
  reply_id         BIGINT NOT NULL AUTO_INCREMENT,
  discussion_id    BIGINT NOT NULL,
  user_id          BIGINT NOT NULL,
  content          TEXT NOT NULL,
  parent_reply_id  BIGINT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reply_id),
  KEY idx_discussion_replies_discussion_id (discussion_id),
  KEY idx_discussion_replies_user_id (user_id),
  KEY idx_discussion_replies_parent_reply_id (parent_reply_id),
  CONSTRAINT fk_discussion_replies_discussion_id FOREIGN KEY (discussion_id) REFERENCES discussions(discussion_id) ON DELETE CASCADE,
  CONSTRAINT fk_discussion_replies_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_discussion_replies_parent_reply_id FOREIGN KEY (parent_reply_id) REFERENCES discussion_replies(reply_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Announcements, Wishlist, Payments, Coupons, Refunds
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id  BIGINT NOT NULL AUTO_INCREMENT,
  course_id        BIGINT NOT NULL,
  instructor_id    BIGINT NULL,
  title            VARCHAR(255) NOT NULL,
  content          TEXT NOT NULL,
  is_pinned        TINYINT(1) NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (announcement_id),
  KEY idx_announcements_course_id (course_id),
  KEY idx_announcements_instructor_id (instructor_id),
  CONSTRAINT fk_announcements_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_announcements_instructor_id FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id  BIGINT NOT NULL AUTO_INCREMENT,
  student_id   BIGINT NOT NULL,
  course_id    BIGINT NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (wishlist_id),
  UNIQUE KEY uq_wishlist_student_course (student_id, course_id),
  KEY idx_wishlist_student_id (student_id),
  KEY idx_wishlist_course_id (course_id),
  CONSTRAINT fk_wishlist_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  payment_id           BIGINT NOT NULL AUTO_INCREMENT,
  student_id           BIGINT NOT NULL,
  course_id            BIGINT NOT NULL,
  enrollment_id        BIGINT NULL,
  amount               DECIMAL(10,2) NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'USD',
  status               VARCHAR(20) NOT NULL DEFAULT 'pending',
  gateway              VARCHAR(50) NULL,
  gateway_payment_id   VARCHAR(255) NULL,
  metadata             JSON NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  KEY idx_payments_student_id (student_id),
  KEY idx_payments_course_id (course_id),
  KEY idx_payments_status (status),
  KEY idx_payments_created_at (created_at),
  CONSTRAINT fk_payments_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_enrollment_id FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(enrollment_id) ON DELETE SET NULL,
  CONSTRAINT chk_payments_amount CHECK (amount >= 0),
  CONSTRAINT chk_payments_status CHECK (status IN ('pending','completed','failed','refunded'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupons (
  coupon_id        BIGINT NOT NULL AUTO_INCREMENT,
  code             VARCHAR(50) NOT NULL,
  discount_type    VARCHAR(20) NOT NULL,
  discount_value   DECIMAL(10,2) NOT NULL,
  min_price        DECIMAL(10,2) NULL,
  course_id        BIGINT NULL,
  valid_from       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until      TIMESTAMP NULL DEFAULT NULL,
  max_uses         INT NULL,
  used_count       INT NOT NULL DEFAULT 0,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (coupon_id),
  UNIQUE KEY uq_coupons_code (code),
  KEY idx_coupons_code (code),
  KEY idx_coupons_course_id (course_id),
  CONSTRAINT fk_coupons_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT chk_coupons_discount_type CHECK (discount_type IN ('percent','fixed')),
  CONSTRAINT chk_coupons_discount_value CHECK (discount_value > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupon_usage (
  coupon_usage_id  BIGINT NOT NULL AUTO_INCREMENT,
  coupon_id        BIGINT NOT NULL,
  student_id       BIGINT NOT NULL,
  payment_id       BIGINT NOT NULL,
  used_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (coupon_usage_id),
  KEY idx_coupon_usage_coupon_id (coupon_id),
  KEY idx_coupon_usage_student_id (student_id),
  KEY idx_coupon_usage_payment_id (payment_id),
  CONSTRAINT fk_coupon_usage_coupon_id FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usage_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usage_payment_id FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refunds (
  refund_id     BIGINT NOT NULL AUTO_INCREMENT,
  payment_id    BIGINT NOT NULL,
  reason        TEXT NULL,
  reason_type   ENUM('technical_issue','duplicate_purchase','user_request','fraud') NULL,
  amount        DECIMAL(10,2) NOT NULL,
  status        VARCHAR(20) NOT NULL,
  refunded_at   TIMESTAMP NULL DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (refund_id),
  KEY idx_refunds_payment_id (payment_id),
  KEY idx_refunds_status (status),
  CONSTRAINT fk_refunds_payment_id FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE,
  CONSTRAINT chk_refunds_amount CHECK (amount >= 0),
  CONSTRAINT chk_refunds_status CHECK (status IN ('pending','approved','rejected','processed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Messages, Activity Log
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS messages (
  message_id   BIGINT NOT NULL AUTO_INCREMENT,
  sender_id    BIGINT NOT NULL,
  receiver_id  BIGINT NOT NULL,
  subject      VARCHAR(255) NULL,
  body         TEXT NOT NULL,
  read_at      TIMESTAMP NULL DEFAULT NULL,
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id),
  KEY idx_messages_sender_id (sender_id),
  KEY idx_messages_receiver_id (receiver_id),
  KEY idx_messages_created_at (created_at),
  CONSTRAINT fk_messages_sender_id FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_receiver_id FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_log (
  log_id       BIGINT NOT NULL AUTO_INCREMENT,
  user_id      BIGINT NULL,
  action       VARCHAR(100) NOT NULL,
  entity_type  VARCHAR(50) NULL,
  entity_id    BIGINT NULL,
  metadata     JSON NULL,
  ip_address   VARCHAR(45) NULL,
  user_agent   TEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY idx_activity_log_user_id (user_id),
  KEY idx_activity_log_entity (entity_type, entity_id),
  KEY idx_activity_log_created_at (created_at),
  CONSTRAINT fk_activity_log_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Tags, Course Tags, Prerequisites
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tags (
  tag_id      BIGINT NOT NULL AUTO_INCREMENT,
  name        VARCHAR(50) NOT NULL,
  slug        VARCHAR(50) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tag_id),
  UNIQUE KEY uq_tags_name (name),
  UNIQUE KEY uq_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_tags (
  course_id   BIGINT NOT NULL,
  tag_id      BIGINT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (course_id, tag_id),
  KEY idx_course_tags_course_id (course_id),
  KEY idx_course_tags_tag_id (tag_id),
  CONSTRAINT fk_course_tags_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_tags_tag_id FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_prerequisites (
  course_id              BIGINT NOT NULL,
  prerequisite_course_id BIGINT NOT NULL,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (course_id, prerequisite_course_id),
  KEY idx_course_prerequisites_course_id (course_id),
  KEY idx_course_prerequisites_prerequisite_course_id (prerequisite_course_id),
  CONSTRAINT fk_course_prereq_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_prereq_prereq_course_id FOREIGN KEY (prerequisite_course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT chk_course_prereq_not_self CHECK (course_id <> prerequisite_course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Course Ratings History, Instructor Earnings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS course_ratings_history (
  history_id       BIGINT NOT NULL AUTO_INCREMENT,
  course_id        BIGINT NOT NULL,
  student_id       BIGINT NOT NULL,
  review_id        BIGINT NULL,
  rating           SMALLINT NOT NULL,
  previous_rating  SMALLINT NULL,
  changed_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (history_id),
  KEY idx_course_ratings_history_course_id (course_id),
  KEY idx_course_ratings_history_student_id (student_id),
  KEY idx_course_ratings_history_changed_at (changed_at),
  KEY idx_course_ratings_history_review_id (review_id),
  CONSTRAINT fk_course_ratings_history_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_ratings_history_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_ratings_history_review_id FOREIGN KEY (review_id) REFERENCES reviews(review_id),
  CONSTRAINT chk_course_ratings_history_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT chk_course_ratings_history_prev_rating CHECK (previous_rating IS NULL OR (previous_rating >= 1 AND previous_rating <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS instructor_earnings (
  earning_id     BIGINT NOT NULL AUTO_INCREMENT,
  instructor_id  BIGINT NOT NULL,
  course_id      BIGINT NOT NULL,
  enrollment_id  BIGINT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending',
  paid_at        TIMESTAMP NULL DEFAULT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (earning_id),
  KEY idx_instructor_earnings_instructor_id (instructor_id),
  KEY idx_instructor_earnings_course_id (course_id),
  KEY idx_instructor_earnings_enrollment_id (enrollment_id),
  KEY idx_instructor_earnings_status (status),
  CONSTRAINT fk_instructor_earnings_instructor_id FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  CONSTRAINT fk_instructor_earnings_course_id FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_instructor_earnings_enrollment_id FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(enrollment_id) ON DELETE CASCADE,
  CONSTRAINT chk_instructor_earnings_amount CHECK (amount >= 0),
  CONSTRAINT chk_instructor_earnings_status CHECK (status IN ('pending','paid','cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- System Settings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS system_settings (
  setting_id    BIGINT NOT NULL AUTO_INCREMENT,
  `key`         VARCHAR(100) NOT NULL,
  value         TEXT NULL,
  value_type    VARCHAR(20) NULL DEFAULT 'string',
  description   VARCHAR(255) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_id),
  UNIQUE KEY uq_system_settings_key (`key`),
  KEY idx_system_settings_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Auth: Email Verification, Password Reset + Sessions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS email_verification (
  verification_id  BIGINT NOT NULL AUTO_INCREMENT,
  user_id          BIGINT NOT NULL,
  token            VARCHAR(255) NOT NULL,
  expires_at       TIMESTAMP NOT NULL,
  verified_at      TIMESTAMP NULL DEFAULT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (verification_id),
  KEY idx_email_verification_user_id (user_id),
  KEY idx_email_verification_token (token),
  KEY idx_email_verification_expires_at (expires_at),
  CONSTRAINT fk_email_verification_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_id     BIGINT NOT NULL AUTO_INCREMENT,
  user_id      BIGINT NOT NULL,
  token        VARCHAR(255) NOT NULL,
  expires_at   TIMESTAMP NOT NULL,
  used_at      TIMESTAMP NULL DEFAULT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token_id),
  KEY idx_password_reset_tokens_user_id (user_id),
  KEY idx_password_reset_tokens_token (token),
  KEY idx_password_reset_tokens_expires_at (expires_at),
  CONSTRAINT fk_password_reset_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  refresh_token_id       BIGINT NOT NULL AUTO_INCREMENT,
  user_id                BIGINT NOT NULL,
  token_hash             VARCHAR(128) NOT NULL,
  device_fingerprint     VARCHAR(255) NULL,
  ip_address             VARCHAR(45) NULL,
  user_agent             TEXT NULL,
  expires_at             TIMESTAMP NOT NULL,
  revoked_at             TIMESTAMP NULL DEFAULT NULL,
  rotated_from_token_id  BIGINT NULL,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (refresh_token_id),
  UNIQUE KEY uq_refresh_tokens_token_hash (token_hash),
  KEY idx_refresh_tokens_user_id (user_id),
  KEY idx_refresh_tokens_expires_at (expires_at),
  KEY idx_refresh_tokens_revoked_at (revoked_at),
  CONSTRAINT fk_refresh_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_refresh_tokens_rotated_from FOREIGN KEY (rotated_from_token_id) REFERENCES refresh_tokens(refresh_token_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_attempts (
  login_attempt_id  BIGINT NOT NULL AUTO_INCREMENT,
  user_id           BIGINT NULL,
  email             VARCHAR(255) NULL,
  ip_address        VARCHAR(45) NULL,
  user_agent        TEXT NULL,
  success           TINYINT(1) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (login_attempt_id),
  KEY idx_login_attempts_user_id (user_id),
  KEY idx_login_attempts_email (email),
  KEY idx_login_attempts_ip_address (ip_address),
  KEY idx_login_attempts_created_at (created_at),
  CONSTRAINT fk_login_attempts_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Video Captions + Video Bookmarks
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS video_captions (
  caption_id     BIGINT NOT NULL AUTO_INCREMENT,
  lesson_id      BIGINT NULL,
  language_code  VARCHAR(10) NULL,
  caption_url    VARCHAR(500) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (caption_id),
  KEY idx_video_captions_lesson_id (lesson_id),
  CONSTRAINT fk_video_captions_lesson_id FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS video_bookmarks (
  video_bookmark_id  BIGINT NOT NULL AUTO_INCREMENT,
  student_id         BIGINT NOT NULL,
  lesson_id          BIGINT NOT NULL,
  position_seconds   INT NOT NULL,
  note               TEXT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (video_bookmark_id),
  KEY idx_video_bookmarks_student_id (student_id),
  KEY idx_video_bookmarks_lesson_id (lesson_id),
  KEY idx_video_bookmarks_student_lesson (student_id, lesson_id),
  CONSTRAINT fk_video_bookmarks_student_id FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_video_bookmarks_lesson_id FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  CONSTRAINT chk_video_bookmarks_position CHECK (position_seconds >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

