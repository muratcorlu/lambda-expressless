import { Request } from './request';
import { Response } from './response';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { NextFunction, NextHandleFunction } from "connect";


export interface Middleware extends NextHandleFunction {
    (request: Request, response: Response, next: NextFunction): void
}

export function use(...handlers: Middleware[]): APIGatewayProxyHandler;

export { Request } from './request';
export { Response } from './response';
