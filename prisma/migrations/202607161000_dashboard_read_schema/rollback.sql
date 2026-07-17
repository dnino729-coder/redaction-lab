-- Rollback de 202607161000_dashboard_read_schema
-- "El rollback deberá restaurar completamente el estado anterior" (13.14).
-- Orden inverso de dependencias (tablas dependientes primero).

DROP TABLE IF EXISTS "xp_transaction";
DROP TABLE IF EXISTS "student_level";
DROP TABLE IF EXISTS "streak";
DROP TABLE IF EXISTS "student_dashboard";
DROP TABLE IF EXISTS "learning_analytics";
DROP TABLE IF EXISTS "performance_metric";
DROP TABLE IF EXISTS "learning_metric";
DROP TABLE IF EXISTS "competency_progress";
DROP TABLE IF EXISTS "student_competency";
DROP TABLE IF EXISTS "competency";
DROP TABLE IF EXISTS "coach_context";
DROP TABLE IF EXISTS "coach_recommendation";
DROP TABLE IF EXISTS "evaluation_result";
DROP TABLE IF EXISTS "exam_attempt";
DROP TABLE IF EXISTS "writing_draft";
DROP TABLE IF EXISTS "writing_submission";
DROP TABLE IF EXISTS "learning_progress";
DROP TABLE IF EXISTS "weekly_plan";
DROP TABLE IF EXISTS "daily_plan";
DROP TABLE IF EXISTS "learning_plan";
DROP TABLE IF EXISTS "student_profile";
DROP TABLE IF EXISTS "user";

DROP TYPE IF EXISTS "Priority";
DROP TYPE IF EXISTS "XpSource";
DROP TYPE IF EXISTS "ExamAttemptStatus";
DROP TYPE IF EXISTS "WritingSubmissionStatus";
DROP TYPE IF EXISTS "LearningPlanStatus";
DROP TYPE IF EXISTS "DelfLevel";
DROP TYPE IF EXISTS "UserStatus";
