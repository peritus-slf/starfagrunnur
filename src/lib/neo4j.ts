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
    const result = await session.run(cypher, params);
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
