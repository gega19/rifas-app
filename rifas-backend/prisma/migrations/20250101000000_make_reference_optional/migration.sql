-- AlterTable
-- Hacer referenceId opcional en participants
ALTER TABLE "participants" ALTER COLUMN "referenceId" DROP NOT NULL;

-- La restricción unique ya permite múltiples NULL, así que no necesitamos cambiarla

