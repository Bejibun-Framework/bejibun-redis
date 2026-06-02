# Changelog
All notable changes to this project will be documented in this file.

---

## [v0.1.45](https://github.com/Bejibun-Framework/bejibun-redis/compare/v0.1.44...v0.1.45) - 2026-06-02

### 🩹 Fixes

### 📖 Changes
- Added `.exists()` Check whether a key exists
- Added `.incr()` Increment a numeric value by 1
- Added `.decr()` Decrement a numeric value by 1
- Added `.incrBy()` Increment a numeric value by a specified amount
- Added `.decrBy()` Decrement a numeric value by a specified amount

#### Example :
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