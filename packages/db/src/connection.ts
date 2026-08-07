import postgres from "postgres";

const DEFAULT_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

export interface ParsedConnection {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

/**
 * Parses a postgres:// connection string into components without relying on
 * URL parsing, so passwords with reserved characters (? + # etc.) work.
 */
export function parseConnectionString(url: string): ParsedConnection {
  const noScheme = url.replace(/^postgres(?:ql)?:\/\//, "");

  const at = noScheme.lastIndexOf("@");
  const userinfo = at >= 0 ? noScheme.slice(0, at) : "";
  const rest = at >= 0 ? noScheme.slice(at + 1) : noScheme;

  const [username = "", ...passwordParts] = userinfo.split(":");
  const password = passwordParts.join(":");

  const slash = rest.indexOf("/");
  const hostPort = slash >= 0 ? rest.slice(0, slash) : rest;
  const dbAndQuery = slash >= 0 ? rest.slice(slash + 1) : "";
  const [database = "postgres", ...queryParts] = dbAndQuery.split("?");
  const query = new URLSearchParams(queryParts.join("?"));

  let host = hostPort;
  let port = 5432;
  const colon = hostPort.lastIndexOf(":");
  if (colon >= 0) {
    host = hostPort.slice(0, colon);
    port = Number(hostPort.slice(colon + 1)) || 5432;
  }

  const sslMode = query.get("sslmode");
  const ssl = query.get("ssl") === "true" || sslMode === "require" || sslMode === "verify-full";

  return { host, port, database, username, password, ssl };
}

export function createSql(url?: string): postgres.Sql {
  const connectionString = url ?? process.env["DATABASE_URL"] ?? DEFAULT_URL;
  const { host, port, database, username, password, ssl } = parseConnectionString(connectionString);
  return postgres({ host, port, database, username, password, ...(ssl ? { ssl: "require" } : {}) });
}

export const sql = createSql();

export async function withConnection<T>(
  fn: (sql: postgres.Sql) => Promise<T>,
): Promise<T> {
  return fn(sql);
}
