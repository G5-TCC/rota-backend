import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedRedisContainer } from '@testcontainers/redis';

export class TestEnvironment {
  private postgres: StartedPostgreSqlContainer;
  private redis: StartedRedisContainer;

  async setup() {
    this.postgres = await new PostgreSqlContainer().start();
    this.redis = await new RedisContainer().start();

    process.env.DATABASE_URL = this.postgres.getConnectionUri();
    process.env.REDIS_URL = `redis://${this.redis.getHost()}:${this.redis.getFirstMappedPort()}`;
  }

  async teardown() {
    await this.postgres.stop();
    await this.redis.stop();
  }
}
