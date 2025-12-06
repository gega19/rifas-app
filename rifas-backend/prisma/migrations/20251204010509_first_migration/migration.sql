-- CreateTable
CREATE TABLE "references" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(6) NOT NULL,
    "ticketCount" INTEGER NOT NULL DEFAULT 5,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "tickets" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "number" VARCHAR(4) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "references_reference_key" ON "references"("reference");

-- CreateIndex
CREATE INDEX "references_reference_idx" ON "references"("reference");

-- CreateIndex
CREATE INDEX "references_used_idx" ON "references"("used");

-- CreateIndex
CREATE UNIQUE INDEX "participants_referenceId_key" ON "participants"("referenceId");

-- CreateIndex
CREATE INDEX "participants_email_idx" ON "participants"("email");

-- CreateIndex
CREATE INDEX "participants_cedula_idx" ON "participants"("cedula");

-- CreateIndex
CREATE INDEX "participants_referenceId_idx" ON "participants"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_number_key" ON "tickets"("number");

-- CreateIndex
CREATE INDEX "tickets_number_idx" ON "tickets"("number");

-- CreateIndex
CREATE INDEX "tickets_used_idx" ON "tickets"("used");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "references"("reference") ON DELETE CASCADE ON UPDATE CASCADE;
