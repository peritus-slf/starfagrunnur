/**
 * Tests for the shared Neo4j helper. The driver is mocked; these check that
 * reads go through a managed transaction (which the driver retries) and that
 * the driver is configured to drop stale connections.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const { driverFn, executeRead, run, close } = vi.hoisted(() => ({
  driverFn: vi.fn(),
  executeRead: vi.fn(),
  run: vi.fn(),
  close: vi.fn(),
}));

vi.mock("neo4j-driver", () => {
  const neo4j = {
    driver: driverFn,
    auth: { basic: vi.fn(() => ({})) },
    session: { READ: "READ" },
    isInt: (v: unknown) =>
      typeof v === "object" && v !== null && "toNumber" in v,
  };
  return { default: neo4j };
});

function record(values: Record<string, unknown>) {
  return { keys: Object.keys(values), get: (k: string) => values[k] };
}

beforeEach(() => {
  vi.resetModules();
  driverFn.mockReset();
  executeRead.mockReset();
  run.mockReset();
  close.mockReset();
  driverFn.mockReturnValue({
    session: vi.fn(() => ({ executeRead, run, close })),
  });
  process.env.NEO4J_URI = "neo4j+s://example.invalid";
  process.env.NEO4J_PASSWORD = "test";
});

describe("runQuery", () => {
  it("reads through executeRead, not an auto-commit run", async () => {
    const txRun = vi.fn(async () => ({
      records: [record({ ok: { toNumber: () => 1 }, title: "x" })],
    }));
    executeRead.mockImplementation(async (work) => work({ run: txRun }));

    const { runQuery } = await import("@/lib/neo4j");
    const rows = await runQuery("RETURN 1 AS ok", { a: 1 });

    expect(rows).toEqual([{ ok: 1, title: "x" }]);
    expect(txRun).toHaveBeenCalledWith("RETURN 1 AS ok", { a: 1 });
    expect(run).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledOnce();
  });

  it("closes the session when the read fails", async () => {
    executeRead.mockRejectedValue(new Error("ServiceUnavailable"));

    const { runQuery } = await import("@/lib/neo4j");
    await expect(runQuery("RETURN 1")).rejects.toThrow("ServiceUnavailable");
    expect(close).toHaveBeenCalledOnce();
  });
});

describe("getDriver", () => {
  it("configures connection lifetime, liveness check and retry time", async () => {
    const { getDriver } = await import("@/lib/neo4j");
    getDriver();

    const config = driverFn.mock.calls[0][2];
    expect(config.maxConnectionLifetime).toBeGreaterThan(0);
    expect(config.connectionLivenessCheckTimeout).toBeGreaterThanOrEqual(0);
    expect(config.connectionTimeout).toBeGreaterThan(0);
    expect(config.maxTransactionRetryTime).toBeGreaterThan(0);
  });
});
