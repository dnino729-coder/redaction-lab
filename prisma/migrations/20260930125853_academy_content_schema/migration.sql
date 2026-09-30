-- CreateEnum
CREATE TYPE "AcademyContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UnitContentBlockType" AS ENUM ('RICH_TEXT', 'INSTRUCTION', 'TIP', 'EXAMPLE', 'QUESTION', 'CHECKLIST', 'MODEL_EXAMPLE_REF');

-- CreateTable
CREATE TABLE "academy_unit_content" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "text_type" "AcademyTextType" NOT NULL,
    "position" INTEGER NOT NULL,
    "step" "AcademyUnitStep" NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "status" "AcademyContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pk_academy_unit_content" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_content_block" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "UnitContentBlockType" NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "pk_unit_content_block" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_academy_unit_content_lookup" ON "academy_unit_content"("text_type", "position", "step", "locale", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_academy_unit_content_slot_version" ON "academy_unit_content"("text_type", "position", "step", "locale", "version");

-- CreateIndex
CREATE UNIQUE INDEX "uq_unit_content_block_content_id_order" ON "unit_content_block"("content_id", "order");

-- AddForeignKey
ALTER TABLE "academy_unit_content" ADD CONSTRAINT "fk_academy_unit_content_created_by" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_content_block" ADD CONSTRAINT "fk_unit_content_block_content_id" FOREIGN KEY ("content_id") REFERENCES "academy_unit_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
