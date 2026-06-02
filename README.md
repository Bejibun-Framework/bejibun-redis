<div align="center">

<img src="https://github.com/Bejibun-Framework/bejibun/blob/master/public/images/bejibun.png?raw=true" width="150" alt="Bejibun" />

![GitHub top language](https://img.shields.io/github/languages/top/Bejibun-Framework/bejibun-redis)
![GitHub all releases](https://img.shields.io/github/downloads/Bejibun-Framework/bejibun-redis/total)
![GitHub issues](https://img.shields.io/github/issues/Bejibun-Framework/bejibun-redis)
![GitHub](https://img.shields.io/github/license/Bejibun-Framework/bejibun-redis)
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/Bejibun-Framework/bejibun-redis?display_name=tag&include_prereleases)

</div>

# Redis for Bejibun
Redis package with Built-in Bun for Bejibun Framework.

## Usage

### Installation
Install the package.

```bash
# Using Bun
bun add @bejibun/redis

# Using Bejibun
bun ace install @bejibun/redis
```

### Configuration
The configuration file automatically executed if you are using `ace`.

Or

Add `redis.ts` inside config directory on your project if doesn't exist.

```bash
config/redis.ts
```

```ts
const config: Record<string, any> = {
    default: "local",

    connections: {
        local: {
            host: "127.0.0.1",
            port: 6379,
            password: "",
            database: 0,
            maxRetries: 10
        }
    }
};

export default config;
```

You can pass the value with environment variables.

### How to Use
How to use tha package.

```ts
import type {RedisPipeline} from "@bejibun/redis/types";
import BaseController from "@bejibun/core/bases/BaseController";
import Logger from "@bejibun/logger";
import Redis from "@bejibun/redis";

export default class TestController extends BaseController {
    public async redis(request: Bun.BunRequest): Promise<Response> {
        await Redis.set("redis", {hello: "world"});
        
        const keys = await Redis.keys("pattern");
        
        const redis = await Redis.get("redis");

        await Redis.connection("local").set("connection", "This is using custom connection.");
        const connection = await Redis.connection("local").get("connection");

        await Redis.setClient({
            host: "127.0.0.1",
            port: 6379,
            password: "",
            database: 0,
            maxRetries: 10
        }, "optional-connection-name").set("redis", {hello: "world"});
        // for publish and subscibe recommended using custom connection name to make sure connection matched

        const pipeline = await Redis.pipeline((pipe: RedisPipeline) => {
            pipe.set("redis-pipeline-1", "This is redis pipeline 1");
            pipe.set("redis-pipeline-2", "This is redis pipeline 2");

            pipe.get("redis-pipeline-1");
            pipe.get("redis-pipeline-2");
        });

        const subscriber = await Redis.subscribe("redis-subscribe", (message: string, channel: string) => {
            Logger.setContext(channel).debug(message);
        });
        await Redis.publish("redis-subscribe", "Hai redis subscriber!");

        await Bun.sleep(500);

        await subscriber.unsubscribe();

        await Redis.exists("visitors");

        await Redis.incr("visitors");
        await Redis.decr("visitors");

        await Redis.incrBy("visitors", 10);
        await Redis.decrBy("visitors", 5);

        return super.response.setData({redis, connection, pipeline}).send();
    }
}
```

## Contributors
- [Havea Crenata](mailto:havea.crenata@gmail.com)

## ☕ Support / Donate

If you find this project helpful and want to support it, you can donate via crypto :

| EVM                                                                                                     | Solana                                                                                                  |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| <img src="https://github.com/Bejibun-Framework/bejibun/blob/master/public/images/EVM.png?raw=true" width="150" /> | <img src="https://github.com/Bejibun-Framework/bejibun/blob/master/public/images/SOL.png?raw=true" width="150" /> |
| 0xdABe8750061410D35cE52EB2a418c8cB004788B3                                                              | GAnoyvy9p3QFyxikWDh9hA3fmSk2uiPLNWyQ579cckMn                                                            |

Or you can buy this `$BJBN (Bejibun)` tokens [here](https://pump.fun/coin/CQhbNnCGKfDaKXt8uE61i5DrBYJV7NPsCDD9vQgypump), beware of bots.