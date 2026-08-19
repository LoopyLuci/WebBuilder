export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface ApiRequest {
    method: HttpMethod;
    path: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    body: any;
    params: Record<string, string>;
    user?: any;
}
export interface ApiResponse {
    status: number;
    headers: Record<string, string>;
    body: any;
}
export interface Middleware {
    (req: ApiRequest, next: () => Promise<ApiResponse>): Promise<ApiResponse>;
}
export interface RouteDefinition {
    method: HttpMethod;
    path: string;
    handler: (req: ApiRequest) => Promise<ApiResponse>;
    middleware?: Middleware[];
    schema?: {
        body?: any;
        query?: any;
        params?: any;
    };
}
export interface CrudOptions {
    middleware?: Middleware[];
    routes?: ('list' | 'get' | 'create' | 'update' | 'delete')[];
}
export interface ApiConfig {
    prefix?: string;
    middleware?: Middleware[];
    cors?: {
        origin: string | string[];
        methods: HttpMethod[];
        headers: string[];
    };
    rateLimit?: {
        windowMs: number;
        maxRequests: number;
    };
}
export declare class ApiError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export interface IApiBuilder {
    get(path: string, handler: (req: ApiRequest) => Promise<ApiResponse>, middleware?: Middleware[]): IApiBuilder;
    post(path: string, handler: (req: ApiRequest) => Promise<ApiResponse>, middleware?: Middleware[]): IApiBuilder;
    put(path: string, handler: (req: ApiRequest) => Promise<ApiResponse>, middleware?: Middleware[]): IApiBuilder;
    patch(path: string, handler: (req: ApiRequest) => Promise<ApiResponse>, middleware?: Middleware[]): IApiBuilder;
    delete(path: string, handler: (req: ApiRequest) => Promise<ApiResponse>, middleware?: Middleware[]): IApiBuilder;
    resource(path: string, handler: any, options?: CrudOptions): IApiBuilder;
    use(middleware: Middleware): IApiBuilder;
    build(): RouteDefinition[];
}
//# sourceMappingURL=index.d.ts.map