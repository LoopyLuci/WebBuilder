export interface StorageConfig {
    backend: 'local' | 's3' | 'r2';
    localPath?: string;
    s3?: {
        bucket: string;
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        endpoint?: string;
    };
    r2?: {
        accountId: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
    };
}
export interface FileUpload {
    name: string;
    data: Buffer;
    mimeType: string;
    size: number;
}
export interface FileMetadata {
    id: string;
    name: string;
    path: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface StorageOptions {
    path?: string;
    metadata?: Record<string, string>;
    contentType?: string;
    overwrite?: boolean;
}
export declare class StorageError extends Error {
    code: 'FILE_NOT_FOUND' | 'UPLOAD_FAILED' | 'DOWNLOAD_FAILED' | 'DELETE_FAILED' | 'BACKEND_ERROR' | 'QUOTA_EXCEEDED';
    constructor(message: string, code: 'FILE_NOT_FOUND' | 'UPLOAD_FAILED' | 'DOWNLOAD_FAILED' | 'DELETE_FAILED' | 'BACKEND_ERROR' | 'QUOTA_EXCEEDED');
}
export interface IStorageProvider {
    upload(file: FileUpload, options?: StorageOptions): Promise<FileMetadata>;
    download(path: string): Promise<{
        data: Buffer;
        metadata: FileMetadata;
    }>;
    delete(path: string): Promise<boolean>;
    list(prefix?: string): Promise<FileMetadata[]>;
    exists(path: string): Promise<boolean>;
    getUrl(path: string): string;
    getSignedUrl?(path: string, expiresIn?: number): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map