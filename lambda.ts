// src/lambda.ts
import serverless from 'serverless-http';
import app from './app';

// Wrap Koa app in Lambda handler function
export const handler = serverless(app);
