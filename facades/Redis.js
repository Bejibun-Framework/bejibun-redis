import RedisBuilder from "../builders/RedisBuilder";
export default class Redis {
    static setClient(cfg, name) {
        return RedisBuilder.setClient(cfg, name);
    }
    static connection(name) {
        return RedisBuilder.connection(name);
    }
    static async connect(name) {
        return RedisBuilder.connect(name);
    }
    static async disconnect(name) {
        return RedisBuilder.disconnect(name);
    }
    static async get(key, connection) {
        return RedisBuilder.get(key, connection);
    }
    static async set(key, value, ttl, connection) {
        return RedisBuilder.set(key, value, ttl, connection);
    }
    static async del(key, connection) {
        return RedisBuilder.del(key, connection);
    }
    static async publish(channel, message, connection) {
        return RedisBuilder.publish(channel, message, connection);
    }
    static async subscribe(channel, listener, connection) {
        return RedisBuilder.subscribe(channel, listener, connection);
    }
    static async pipeline(fn, connection) {
        return RedisBuilder.pipeline(fn, connection);
    }
    static on(event, listener) {
        return RedisBuilder.on(event, listener);
    }
    static off(event, listener) {
        return RedisBuilder.off(event, listener);
    }
}
