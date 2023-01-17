import * as process from 'process';

export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'env',
  mongodb: process.env.MONGODB,
  port: +process.env.PORT || 3000,
  default_limit: +process.env.DEFAULT_LIMIT || 10,
});
