import { Request } from "./request";
import { APIGatewayProxyCallback, APIGatewayProxyResult } from 'aws-lambda';

export class Response {
    constructor(req: Request, callback: APIGatewayProxyCallback);
    req: Request;
    callback: APIGatewayProxyCallback;
    responseObj: APIGatewayProxyResult;
    end: () => void;
    get: (key: string) => string;
    format: (obj: Object) => Response;
    json: (body: Object) => void;
    send: (body: Object) => void;
    set: (key: string, value: string) => Response;
    status: (status: number) => Response;
    type: (type: string) => Response;
}
