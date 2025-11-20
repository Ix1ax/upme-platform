ALTER TABLE enrollments
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS ux_enrollments_user_course
    ON enrollments (user_id, course_id);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_lesson_progress_unique
    ON lesson_progress (enrollment_id, lesson_id);

CREATE TABLE IF NOT EXISTS course_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    questions_json TEXT NOT NULL,
    passing_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES course_tests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    answers_json TEXT NOT NULL,
    correct_answers INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_test
    ON test_attempts (test_id, user_id, created_at DESC);
