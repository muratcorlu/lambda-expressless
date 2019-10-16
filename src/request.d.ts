
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Accepts } from 'accepts';
import { Readable } from 'stream';

export class Request extends Readable {
    constructor(event: APIGatewayProxyEvent);
    headers: { [name: string]: string };
    hostname: string | null;
    method: string;
    query: { [name: string]: string } | null;
    path: string;
    params: { [name: string]: string } | null;
    protocol:  'http' | 'https';
    secure: boolean;
    ips: string[];
    ip: string;
    host: string | null;
    xhr: boolean;
    event: APIGatewayProxyEvent;
    accept: Accepts;
}