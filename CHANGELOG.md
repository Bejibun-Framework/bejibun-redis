# Changelog
All notable changes to this project will be documented in this file.

---

## [v0.1.48](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.47...v0.1.48) - 2026-09-01

### 🩹 Fixes
- Fixed the `config` getter re-reading the Redis config file from disk (`App.Path.configPath` + `fs.existsSync` + `require()`) on **every** `RedisBuilder` call
- Fixed `setClient(cfg)` without a name creating a client under a random connection name that was never reused, leaking an extra connection; it now targets the configured default connection

### 📖 Changes
#### Performance
- Added **persistent connection pooling**: `disconnectAfter` now defaults to `false`, so a client is created once and reused across operations instead of being closed and recreated (new connection) on every call; call `Redis.disconnect(name?)` for explicit cleanup
- `setClient()` named-connection wrappers no longer disconnect after each op, keeping the connection alive for reuse
- `setClient(cfg)` without a name now registers the configured default connection (no more random name), so subsequent `Redis.get/set` reuse the same client
- Removed the now-unused `Str` facade import
- The Redis config is now loaded once (lazy module-level cache) and reused on subsequent calls; connection-name and connection resolution read the cached object instead of hitting the filesystem
- Extracted `connectionName()` and simplified `getConfig()` fallback so each op resolves the default connection without re-reading config
- Added `tests` to tsconfig `exclude` so compiled output never lands in `tests/`

### 🧪 Tests
- Added test suite (11 tests across 1 file) covering config caching, connection-name resolution, `getConfig` fallback, persistent-client reuse / disconnect behavior, and `setClient` default-connection targeting

### ⚡ Benchmarks
- Added benchmark suite comparing baseline (`@bejibun/redis@0.1.46`) vs optimized build
- **config resolution throughput: ~110x faster** (0.6ms vs 63.3ms for 20k resolutions, ~34M ops/s)
- **Redis.set() throughput (live server): ~4.77x faster** (45.2ms vs 215.6ms for 500 calls)
- **Redis.get() throughput (live server): ~4.66x faster** (43.2ms vs 201.4ms for 500 calls)
- Cold start: ~1.0x (config is resolved lazily)

### 📦 Dependencies

- Bumped [`@bejibun/app`](https://github.com/Bejibun-Framework/bejibun-app) from `^0.1.25` to `^0.1.26`
- Bumped [`@bejibun/logger`](https://github.com/Bejibun-Framework/bejibun-logger) from `^0.1.23` to `^0.2.1`
- Bumped [`@bejibun/utils`](https://github.com/Bejibun-Framework/bejibun-utils) from `^0.1.29` to `^0.1.30`
- Bumped `@types/bun` (devDependency) from `^1.3.14` to `^1.4.0`
- Bumped `tsc-alias` (devDependency) from `^1.9.2` to `^1.9.3`
- Bumped `eslint` (devDependency) from `^10.8.1` to `^10.9.1`
- Bumped `typescript-eslint` (devDependency) from `^8.67.0` to `^8.69.0`

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.47](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.46...v0.1.47) - 2026-08-20

### 🩹 Fixes

### 📖 Changes
#### Tooling
- Added `prettier` + `.prettierrc.json` / `.prettierignore` and an `eslint.config.js` (flat config, `typescript-eslint`) for consistent formatting/linting across `src`
- Added `bun run format`, `bun run eslint`, and `bun run lint` scripts; `bun run build` now runs `lint` before compiling
- `alias` script now runs `tsc-alias` directly instead of via `bunx`

### 📦 Dependencies

- Bumped [`@bejibun/app`](https://github.com/Bejibun-Framework/bejibun-app) from `^0.1.24` to `^0.1.25`
- Bumped [`@bejibun/logger`](https://github.com/Bejibun-Framework/bejibun-logger) from `^0.1.22` to `^0.1.23`
- Bumped [`@bejibun/utils`](https://github.com/Bejibun-Framework/bejibun-utils) from `^0.1.28` to `^0.1.29`
- Bumped `tsc-alias` (devDependency) from `^1.9.1` to `^1.9.2`
- Added `@eslint/js` (devDependency) `^10.0.1`
- Added `eslint` (devDependency) `^10.8.1`
- Added `eslint-config-prettier` (devDependency) `^10.1.8`
- Added `globals` (devDependency) `^17.11.0`
- Added `prettier` (devDependency) `^3.9.6`
- Added `typescript` (devDependency) `^6.0.3`
- Added `typescript-eslint` (devDependency) `^8.67.0`

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.46](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.45...v0.1.46) - 2026-08-02

### 🩹 Fixes
- Fixed incorrect log message in `.keys()` — was logging "Failed to get value." instead of "Failed to get keys."

### 📖 Changes
- Added `.ping()` to check connectivity / send a PING to the Redis server, with optional message, connection, and `disconnectAfter` params
- Extended `.pipeline()` with new batched operations: `.decr()`, `.decrBy()`, `.exists()`, `.expire()`, `.incr()`, `.incrBy()`, `.keys()`, and `.ttl()` (previously the pipeline builder only supported `.del()`, `.get()`, and `.set()`)
- Bumped `tsc-alias` devDependency from `^1.8.17` to `^1.9.1`
- Cleaned up `tsconfig.json` (`baseUrl` removed, `@/*` path updated to `./src/*`)

#### Example:
```ts
await Redis.ping();

await Redis.pipeline((pipe) => {
    pipe.incr("visitors");
    pipe.decrBy("stock", 3);
    pipe.exists("session:123");
    pipe.expire("session:123", 3600);
    pipe.keys("cache:*");
    pipe.ttl("session:123");
});
```

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.45](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.44...v0.1.45) - 2026-06-02

### 🩹 Fixes

### 📖 Changes
- Added `.exists()` Check whether a key exists
- Added `.incr()` Increment a numeric value by 1
- Added `.decr()` Decrement a numeric value by 1
- Added `.incrBy()` Increment a numeric value by a specified amount
- Added `.decrBy()` Decrement a numeric value by a specified amount

#### Example:
```ts
await Redis.exists("visitors");

await Redis.incr("visitors");
await Redis.decr("visitors");

await Redis.incrBy("visitors", 10);
await Redis.decrBy("visitors", 5);
```

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.44](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.39...v0.1.44) - 2026-03-18

### 🩹 Fixes

### 📖 Changes
- Set auto disconnected after used as default.

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.39](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.38...v0.1.39) - 2026-03-02

### 🩹 Fixes

### 📖 Changes
- Added `.ttl(key: string)` to get ttl of key.
- Added `.expire(key: string, value: number)` to set key expires.

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.38](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.36...v0.1.38) - 2026-02-14

### 🩹 Fixes

### 📖 Changes
- Added `.keys(pattern: string)` to get list of key.

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.36](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.35...v0.1.36) - 2025-12-11

### 🩹 Fixes

### 📖 Changes
- Set random connection name for `.setClient()` and disconnect after used then clear the connection lists.

#### Upgrade [@bejibun/utils](https://github.com/Bejibun-Framework/bejibun-utils) to [v0.1.27](https://github.com/Bejibun-Framework/bejibun-utils/releases/tag/v0.1.24)

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.35](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.34...v0.1.35) - 2025-12-07

### 🩹 Fixes

### 📖 Changes
What's New :
- Adding `.setClient(cfg: RedisConfig)` to override connection.

By default, [@bejibun/redis](https://github.com/Bejibun-Framework/bejibun-redis) use connection from `config/redis.ts`.

Now, you can override it by using `setClient()`.

#### Upgrade [@bejibun/utils](https://github.com/Bejibun-Framework/bejibun-utils) to [v0.1.24](https://github.com/Bejibun-Framework/bejibun-utils/releases/tag/v0.1.24)
- Fix empty validation for class

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.34](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.33...v0.1.34) - 2025-11-23

### 🩹 Fixes
- Fix redis ttl

### 📖 Changes

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.33](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.30...v0.1.33) - 2025-11-09

### 🩹 Fixes
- Fix redis configuration

### 📖 Changes

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.30](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.29...v0.1.30) - 2025-10-22

### 🩹 Fixes
- Fix `configure.ts` configuration file

### 📖 Changes

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))
- Ghulje ([@ghulje](https://github.com/ghulje))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.29](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.27...v0.1.29) - 2025-10-22

### 🩹 Fixes

### 📖 Changes
What's New :
- Adding `configure.ts` for installation configuration

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))
- Ghulje ([@ghulje](https://github.com/ghulje))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.27](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.26...v0.1.27) - 2025-10-20

### 🩹 Fixes

### 📖 Changes
Chore :
- Refactor some codes to bun native
- Adding log when throwing redis exception

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))
- Ghulje ([@ghulje](https://github.com/ghulje))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.26](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.24...v0.1.26) - 2025-10-18

### 🩹 Fixes

### 📖 Changes
What's New :
- A minor adjustment on error logs

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))
- Ghulje ([@ghulje](https://github.com/ghulje))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.24](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.23...v0.1.24) - 2025-10-16

### 🩹 Fixes

### 📖 Changes
What's New :
- Change logger style

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))
- Ghulje ([@ghulje](https://github.com/ghulje))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.23](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.0...v0.1.23) - 2025-10-15

### 🩹 Fixes

### 📖 Changes
Update build indexing

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))
- Ghulje ([@ghulje](https://github.com/ghulje))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md

---

## [v0.1.0](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.0...v0.1.0) - 2025-10-12

### 🩹 Fixes

### 📖 Changes
What's New :
- Redis

Available Redis :
- `.connection()` Multiple redis services
- `.get()` Get value stored on redis
- `.set()` Set value to redis
- `.del()` Delete value stored on redis
- `.subscribe()` Subscribe redis event
- `subcriber.unsubscribe()` Unsubscribe redis event
- `.publish()` Publish messages to subscriber
- `.pipeline()` Redis pipeline
- `.on()` Subscribe events for `connect` | `disconnect` | `error`
- `.off()` Unsubscribe events for `connect` | `disconnect` | `error`
- `.connect()` Manually connect to redis
- `.disconnect()` Manually disconnect from redis, will close all connections if not specify connection name

### ❤️Contributors
- Havea Crenata ([@crenata](https://github.com/crenata))
- Ghulje ([@ghulje](https://github.com/ghulje))

**Full Changelog**: https://github.com/Bejibun-Framework/bejibun-redis/blob/master/CHANGELOG.md