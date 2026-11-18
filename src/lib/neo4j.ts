import neo4j, { Driver } from "neo4j-driver";

// Module-level singleton — survives across serverless invocations
// in the same warm container
let _driver: Driver | null = null;

export function getDriver(): Driver {
  if (!_driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER || "neo4j";
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !password) {
      throw new Error(
        "NEO4J_URI and NEO4J_PASSWORD environment variables are required"
      );
    }

    _driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 10,
      connectionAcquisitionTimeout: 5000,
      // The function is frozen between requests, so pooled sockets can be
      // dead when it wakes. Retire connections early, ping any that sat idle
      // before reusing them, and fail a stuck TLS handshake fast so the
      // transaction retry below gets a chance.
      maxConnectionLifetime: 5 * 60 * 1000,
      connectionLivenessCheckTimeout: 30 * 1000,
      connectionTimeout: 10 * 1000,
      maxTransactionRetryTime: 10 * 1000,
    });
  }
  return _driver;
}

export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const driver = getDriver();
  const session = driver.session({ defaultAccessMode: neo4j.session.READ });
  try {
    // executeRead retries transient failures (ServiceUnavailable,
    // SessionExpired) and rediscovers the cluster; session.run() does not.
    const result = await session.executeRead((tx) => tx.run(cypher, params));
    return result.records.map((record) => {
      const obj: Record<string, unknown> = {};
      for (const key of record.keys as string[]) {
        const val = record.get(key);
        // Convert Neo4j Integer to JS number
        obj[key] = neo4j.isInt(val) ? val.toNumber() : val;
      }
      return obj as T;
    });
  } finally {
    await session.close();
  }
}
