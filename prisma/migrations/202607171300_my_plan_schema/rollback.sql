-- Rollback de: 202607171300_my_plan_schema
-- Elimina, en orden inverso de dependencia, las 6 tablas y los 6 tipos ENUM
-- creados. No afecta ninguna tabla existente antes de esta migración.

DROP TABLE IF EXISTS "study_session";
DROP TABLE IF EXISTS "study_schedule";
DROP TABLE IF EXISTS "learning_task";
DROP TABLE IF EXISTS "learning_phase";
DROP TABLE IF EXISTS "learning_objective";
DROP TABLE IF EXISTS "learning_goal";

DROP TYPE IF EXISTS "LearningTaskSource";
DROP TYPE IF EXISTS "LearningTaskDifficulty";
DROP TYPE IF EXISTS "LearningTaskStatus";
DROP TYPE IF EXISTS "LearningPhaseStatus";
DROP TYPE IF EXISTS "LearningObjectiveStatus";
DROP TYPE IF EXISTS "LearningGoalStatus";
