-- CreateTable
CREATE TABLE "MetricsSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startup_id" TEXT NOT NULL,
    "fetched_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" TEXT,
    "source_status" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "fetched_via" TEXT NOT NULL DEFAULT 'api'
);

-- CreateIndex
CREATE INDEX "MetricsSnapshot_startup_id_fetched_at_idx" ON "MetricsSnapshot"("startup_id", "fetched_at");

-- CreateIndex
CREATE INDEX "MetricsSnapshot_success_fetched_at_idx" ON "MetricsSnapshot"("success", "fetched_at");
