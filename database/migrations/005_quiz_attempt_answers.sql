-- Stores answers selected/entered during quiz attempts (required for auto-grading)

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    attempt_answer_id   BIGSERIAL PRIMARY KEY,
    attempt_id          BIGINT NOT NULL REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
    question_id         BIGINT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    answer_id           BIGINT REFERENCES answers(answer_id) ON DELETE SET NULL,
    answer_text         TEXT,
    is_correct          BOOLEAN,
    points_awarded      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_question_id ON quiz_attempt_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_answer_id ON quiz_attempt_answers(answer_id);

