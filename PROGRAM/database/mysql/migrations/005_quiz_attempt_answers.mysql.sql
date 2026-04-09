-- MySQL 8+ conversion of 005_quiz_attempt_answers.sql

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

