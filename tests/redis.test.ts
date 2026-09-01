import {describe, expect, test} from "bun:test";
import RedisBuilder from "../src/builders/RedisBuilder";
import RedisConfig from "../src/config/redis";

describe("RedisBuilder config", () => {
    test("config falls back to the bundled default when no user config exists", () => {
        const config = (RedisBuilder as any).config;

        expect(config.default).toBe(RedisConfig.default);
        expect(config.connections.local).toEqual(RedisConfig.connections.local);
    });

    test("config returns the same cached object across accesses", () => {
        const a = (RedisBuilder as any).config;
        const b = (RedisBuilder as any).config;

        expect(a).toBe(b);
    });

    test("connectionName resolves the configured default when none given", () => {
        const name = (RedisBuilder as any).connectionName();

        expect(name).toBe(RedisConfig.default);
    });

    test("connectionName preserves an explicit name", () => {
        const name = (RedisBuilder as any).connectionName("custom");

        expect(name).toBe("custom");
    });
});

describe("RedisBuilder getConfig", () => {
    test("getConfig resolves an existing connection", () => {
        const cfg = (RedisBuilder as any).getConfig("local");

        expect(cfg.host).toBe("127.0.0.1");
        expect(cfg.port).toBe(6379);
    });

    test("getConfig falls back to the env/default connection for unknown names", () => {
        const cfg = (RedisBuilder as any).getConfig("missing");

        expect(cfg.host).toBe("127.0.0.1");
        expect(cfg.port).toBe(6379);
    });
});

describe("RedisBuilder setClient", () => {
    test("setClient returns bound command wrappers", () => {
        const client = RedisBuilder.setClient({host: "127.0.0.1", port: 6379}, "test");

        expect(typeof client.get).toBe("function");
        expect(typeof client.set).toBe("function");
        expect(typeof client.pipeline).toBe("function");
    });

    test("setClient uses the given connection name", () => {
        const name = "custom-conn";
        const client = RedisBuilder.setClient({host: "127.0.0.1", port: 6379}, name);

        expect(typeof client.get).toBe("function");
        expect(typeof (RedisBuilder as any).clients[name].ping).toBe("function");
    });

    test("setClient without a name targets the default connection, not a random one", () => {
        const defaultName = (RedisBuilder as any).connectionName();
        const before = Object.keys((RedisBuilder as any).clients).length;

        RedisBuilder.setClient({host: "127.0.0.1", port: 6379});

        const after = Object.keys((RedisBuilder as any).clients);

        expect(after).toContain(defaultName);
        expect(after.length).toBe(before + 1);

        delete (RedisBuilder as any).clients[defaultName];
    });
});

describe("RedisBuilder persistent client", () => {
    test("getClient reuses the same client for a connection (persistent pooling)", () => {
        const name = "persist-conn";

        RedisBuilder.setClient({host: "127.0.0.1", port: 6379}, name);

        const a = (RedisBuilder as any).getClient(name);
        const b = (RedisBuilder as any).getClient(name);

        expect(a).toBe(b);

        delete (RedisBuilder as any).clients[name];
    });

    test("disconnect removes the client so the next call creates a fresh one", async () => {
        const name = "disc-conn";

        RedisBuilder.setClient({host: "127.0.0.1", port: 6379}, name);
        const a = (RedisBuilder as any).getClient(name);

        await RedisBuilder.disconnect(name);

        const b = (RedisBuilder as any).getClient(name);

        expect(b).not.toBe(a);

        delete (RedisBuilder as any).clients[name];
    });
});