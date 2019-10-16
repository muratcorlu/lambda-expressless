import { Request } from './request';
import { Response } from './response';
import { APIGatewayProxyHandler } from 'aws-lambda';

export interface Middleware {
    (request: Request, response: Response, next: Function): void
}

export function use(...handlers: Middleware[]): ApiGatewayProxyHandler;

export { Request } from './request';
export { Response } from './response';
