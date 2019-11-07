import { Request } from './request';
import { Response } from './response';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { RequestHandler } from 'express';

export function use(...handlers: RequestHandler[]): APIGatewayProxyHandler;

export { Request } from './request';
export { Response } from './response';
