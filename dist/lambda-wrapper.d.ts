import { Request } from './request';
import { Response } from './response';
import { APIGatewayProxyResult } from 'aws-lambda';
export interface Middleware {
    (request: Request, response: Response, next: (param?: unknown) => void): void;
}
export interface OnFinishedHandler {
    (out: unknown, req: Request, res: Response): Promise<APIGatewayProxyResult>;
}
declare const _default: {
    ApiGatewayHandler: (router: Middleware, onFinished: OnFinishedHandler) => import("aws-lambda").Handler<import("aws-lambda").APIGatewayProxyEvent, APIGatewayProxyResult>;
};
export default _default;
