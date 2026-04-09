-- Timestamped video bookmarks (separate from generic lesson bookmarks)

CREATE TABLE IF NOT EXISTS video_bookmarks (
    video_bookmark_id   BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    lesson_id           BIGINT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    position_seconds    INT NOT NULL CHECK (position_seconds >= 0),
    note                TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_bookmarks_student_id ON video_bookmarks(student_id);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_lesson_id ON video_bookmarks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_student_lesson ON video_bookmarks(student_id, lesson_id);

