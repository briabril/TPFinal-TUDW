import Redis from "ioredis";

const redis = new Redis(); // se conecta a 127.0.0.1:6379 por defecto
redis.on("connect", () => console.log("Conectado a Redis"));
redis.on("error", (err) => console.error("Error Redis:", err));

export default redis;
