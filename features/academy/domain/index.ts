// Barrel de la capa de Dominio de Academia. Sprint 6.0 — Domain Layer.
export * from "./shared/Entity";
export * from "./shared/AggregateRoot";

export * from "./value-objects/Identifier";
export * from "./value-objects/AcademyUnitId";
export * from "./value-objects/AttemptId";
export * from "./value-objects/DraftId";
export * from "./value-objects/VersionId";
export * from "./value-objects/FeedbackId";
export * from "./value-objects/TeacherOverrideId";
export * from "./value-objects/ModelExampleId";
export * from "./value-objects/TeacherRecommendationId";
export * from "./value-objects/StudentId";
export * from "./value-objects/VersionNumber";
export * from "./value-objects/DraftContent";
export * from "./value-objects/FeedbackObservation";
export * from "./value-objects/WordCountRange";
export * from "./value-objects/MasteryCriterion";

export * from "./enums/UnitState";
export * from "./enums/UnitStep";
export * from "./enums/TextType";
export * from "./enums/DifficultyLevel";
export * from "./enums/FeedbackCategory";
export * from "./enums/FeedbackStrength";
export * from "./enums/MasteryLevel";
export * from "./enums/OverrideAction";
export * from "./enums/ModelExampleStatus";
export * from "./enums/ModelExampleRating";

export * from "./events";
export * from "./exceptions";

export * from "./policies";
export * from "./specifications";
export * from "./services";
export * from "./ports";
export * from "./factories";
export * from "./repositories";

export * from "./entities";
export * from "./aggregates";
