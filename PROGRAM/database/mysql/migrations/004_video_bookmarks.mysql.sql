-- MySQL 8+ conversion of 004_video_bookmarks.sql

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

