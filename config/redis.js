/** Redis connection configuration with the default connection name and per-connection settings. */
const config = {
    /** Name of the connection used when none is specified. */
    default: "local",
    /** Map of named Redis connections to their connection options. */
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
