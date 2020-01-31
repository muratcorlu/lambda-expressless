import { Request } from './request';
import { Response } from './response';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { NextFunction, NextHandleFunction } from "connect";

export interface APIGatewayProxyHandler {
  (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>
}

export interface Middleware extends NextHandleFunction {
    (request: Request, response: Response, next: NextFunction): void
}

export function use(...handlers: Middleware[]): APIGatewayProxyHandler;

export { Request } from './request';
export { Response } from './response';
