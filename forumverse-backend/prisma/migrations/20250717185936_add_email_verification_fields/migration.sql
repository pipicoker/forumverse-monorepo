-- AlterTable
ALTER TABLE "users" ADD COLUMN     "token" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);
