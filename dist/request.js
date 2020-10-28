"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const stream_1 = require("stream");
const accepts = require("accepts");
const typeis = require("type-is");
function byteLength(str) {
    // returns the byte length of an utf8 string
    let s = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
        const code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff)
            s++;
        else if (code > 0x7ff && code <= 0xffff)
            s += 2;
    }
    return s.toString();
}
/**
 *
 */
class Request extends stream_1.Readable {
    constructor(event) {
        super();
        this.res = null;
        if (!event.multiValueHeaders) {
            event.multiValueHeaders = {};
            for (const header in event.headers) {
                event.multiValueHeaders[header] = [event.headers[header]];
            }
        }
        this.headers = Object.keys(event.multiValueHeaders).reduce((headers, key) => {
            const value = event.multiValueHeaders[key];
            headers[key.toLowerCase()] = value[0];
            return headers;
        }, {});
        this.hostname = this.headers.host || '';
        this.method = event.httpMethod;
        if (!event.multiValueQueryStringParameters) {
            event.multiValueQueryStringParameters = {};
            for (const queryParam in event.queryStringParameters) {
                event.multiValueQueryStringParameters[queryParam] = [
                    event.queryStringParameters[queryParam]
                ];
            }
        }
        this.query = Object.keys(event.multiValueQueryStringParameters || {}).reduce((queryParams, key) => {
            const value = event.multiValueQueryStringParameters[key]; // cannot be null at this point
            queryParams[key] = value[0];
            return queryParams;
        }, {});
        this.path = event.path || '';
        this.url = event.path;
        this.params = event.pathParameters;
        if (!this.get('Content-Length') && event.body) {
            this.headers['content-length'] = byteLength(event.body);
        }
        this.protocol = this.get('X-Forwarded-Proto') === 'https' ? 'https' : 'http';
        this.secure = this.protocol === 'https';
        this.ips = (this.get('X-Forwarded-For') || '').split(', ');
        this.ip = this.ips[0];
        // Alternative way to obtain the source IP
        // this.ip = event.requestContext.identity.sourceIp
        this.host = this.get('X-Forwarded-Host') || this.hostname;
        this.xhr = (this.get('X-Requested-With') || '').toLowerCase() === 'xmlhttprequest';
        this.event = event;
        this.accept = accepts(this);
        this.push(event.body);
        this.push(null);
    }
    /**
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `undefined`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single MIME type string
     * such as "application/json", an extension name
     * such as "json", a comma-delimited list such as "json, html, text/plain",
     * an argument list such as `"json", "html", "text/plain"`,
     * or an array `["json", "html", "text/plain"]`. When a list
     * or array is given, the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     req.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('html');
     *     // => "html"
     *     req.accepts('text/html');
     *     // => "text/html"
     *     req.accepts('json, text');
     *     // => "json"
     *     req.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('image/png');
     *     req.accepts('png');
     *     // => undefined
     *
     *     // Accept: text/*;q=.5, application/json
     *     req.accepts(['html', 'json']);
     *     req.accepts('html', 'json');
     *     req.accepts('html, json');
     *     // => "json"
     *
     * @param type(s)
     * @public
     */
    accepts(...args) {
        return this.accept.types.apply(this.accept, args);
    }
    /**
     * Check if the given `encoding`s are accepted.
     *
     * @param ...encoding
     * @public
     */
    acceptsEncodings(...args) {
        return this.accept.encodings.apply(this.accept, args);
    }
    /**
     * Check if the given `charset`s are acceptable,
     * otherwise you should respond with 406 "Not Acceptable".
     *
     * @param ...charset
     * @public
     */
    acceptsCharsets(...args) {
        return this.accept.charsets.apply(this.accept, args);
    }
    /**
     * Check if the given `lang`s are acceptable,
     * otherwise you should respond with 406 "Not Acceptable".
     *
     * @param ...lang
     * @public
     */
    acceptsLanguages(...args) {
        return this.accept.languages.apply(this.accept, args);
    }
    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable.
     *
     * Examples:
     *
     *     req.get('Content-Type');
     *     // => "text/plain"
     *
     *     req.get('content-type');
     *     // => "text/plain"
     *
     *     req.get('Something');
     *     // => undefined
     *
     * Aliased as `req.header()`.
     *
     * @param name
     * @public
     */
    get(key) {
        return this.header(key);
    }
    header(name) {
        if (!name) {
            throw new TypeError('name argument is required to req.get');
        }
        if (typeof name !== 'string') {
            throw new TypeError('name must be a string to req.get');
        }
        const lc = name.toLowerCase();
        switch (lc) {
            case 'referer':
            case 'referrer':
                return this.headers.referrer || this.headers.referer;
            default:
                return this.headers[lc];
        }
    }
    is(...types) {
        return typeis(this, ...types);
    }
}
exports.Request = Request;
