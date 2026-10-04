import { readFileSync } from "node:fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

function createAdapter() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be configured before accessing Prisma.");
  }

  const url = new URL(connectionString);
  if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
    throw new Error("DATABASE_URL must use the mysql or mariadb protocol.");
  }

  const database = decodeURIComponent(url.pathname.slice(1));
  if (!database) {
    throw new Error("DATABASE_URL must include a database name.");
  }

  const options = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
  };

  const connectionLimit = Number(url.searchParams.get("connection_limit"));
  if (Number.isInteger(connectionLimit) && connectionLimit > 0) {
    options.connectionLimit = connectionLimit;
  }

  const connectTimeout = Number(url.searchParams.get("connect_timeout"));
  if (Number.isFinite(connectTimeout) && connectTimeout > 0) {
    options.connectTimeout = connectTimeout * 1000;
  }

  const sslCertificate = url.searchParams.get("sslcert");
  const sslAccept = url.searchParams.get("sslaccept");
  if (sslCertificate || sslAccept) {
    const ca = sslCertificate
      ? sslCertificate.includes("-----BEGIN CERTIFICATE-----")
        ? sslCertificate
        : readFileSync(sslCertificate)
      : undefined;

    options.ssl = {
      ...(ca ? { ca } : {}),
      ...(sslAccept === "accept_invalid_certs"
        ? { rejectUnauthorized: false }
        : {}),
    };
  }

  return new PrismaMariaDb(options);
}

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
