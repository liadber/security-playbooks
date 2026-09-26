export interface Config {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  /** True in production; false for local development over http. */
  cookieSecure: boolean;
}
