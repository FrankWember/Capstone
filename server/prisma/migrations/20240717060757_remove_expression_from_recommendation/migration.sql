/*
  Warnings:

  - You are about to drop the column `expression` on the `Recommendation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Recommendation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Recommendation_user_id_idx";

-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "expression",
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Expression" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expression_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Expression_user_id_key" ON "Expression"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_user_id_key" ON "Recommendation"("user_id");

-- AddForeignKey
ALTER TABLE "Expression" ADD CONSTRAINT "Expression_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
