import type { Environment } from '@app/enums';

export interface EnvironmentVariables {
  NODE_ENV: Environment;
  HOST: string;
  PORT: number;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USERNAME: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
}
