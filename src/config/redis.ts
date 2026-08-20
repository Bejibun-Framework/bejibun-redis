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
