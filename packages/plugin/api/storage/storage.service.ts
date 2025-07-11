import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";

import {
    Service, Config, Logger
} from "@cmmv/core";

export interface IFile {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
}

@Service('blog_storage')
export class BlogStorageService {
    private readonly logger = new Logger("BlogStorageService");

    /**
     * Upload a file to the storage
     * @param file - The file to upload
     * @returns The file url
     */
    async uploadFile(file: IFile) {
        const storageType = Config.get("blog.storageType");

        switch (storageType) {
            case "spaces":
                return await this.uploadFileToCloudflare(file);
            case "s3":
                return await this.uploadFileToS3(file);
            default:
                return null;
        }
    }

    /**
     * Upload a file to Cloudflare Spaces
     * @param file - The file to upload
     * @returns The file url
     */
    private async uploadFileToCloudflare(file: IFile) {
        const spacesAccessKey = Config.get("blog.spacesAccessKey");
        const spacesSecretKey = Config.get("blog.spacesSecretKey");
        const spacesRegion = Config.get("blog.spacesRegion");
        const spacesName = Config.get("blog.spacesName");
        const spacesEndpoint = Config.get("blog.spacesEndpoint");
        const spacesUrl = Config.get("blog.spacesUrl");

        const client = new S3Client({
            endpoint: spacesEndpoint,
            region: spacesRegion,
            credentials: {
                accessKeyId: spacesAccessKey,
                secretAccessKey: spacesSecretKey,
            },
            forcePathStyle: false,
        });

        const command = new PutObjectCommand({
            Bucket: spacesName,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read"
        });

        try {
            await client.send(command);
            const host = new URL(spacesEndpoint).host;
            const publicUrl = (spacesUrl) ? `${spacesUrl}/${file.originalname}` : `https://${spacesName}.${host}/${file.originalname}`;
            return { success: true, url: publicUrl };
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * Upload a file to S3
     * @param file - The file to upload
     * @returns The file url
     */
    private async uploadFileToS3(file: IFile) {
        const s3AccessKey = Config.get("blog.s3AccessKey");
        const s3SecretKey = Config.get("blog.s3SecretKey");
        const s3Bucket = Config.get("blog.s3Bucket");
        const s3Region = Config.get("blog.s3Region");
        const s3Endpoint = Config.get("blog.s3Endpoint");
        const s3UsePathStyle = Config.get("blog.s3UsePathStyle");
        const s3BucketUrl = Config.get("blog.s3BucketUrl");

        const client = new S3Client({
            region: s3Region,
            endpoint: s3Endpoint,
            credentials: {
                accessKeyId: s3AccessKey,
                secretAccessKey: s3SecretKey
            },
            forcePathStyle: s3UsePathStyle === true || s3UsePathStyle === "true"
        });

        const command = new PutObjectCommand({
            Bucket: s3Bucket,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read"
        });

        try {
            await client.send(command);
            const publicUrl = (s3BucketUrl) ? `${s3BucketUrl}/${file.originalname}` : `${s3Endpoint}/${s3Bucket}/${file.originalname}`;
            return { success: true, url: publicUrl };
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * Delete a file from the storage
     * @param fileUrl - The URL of the file to delete
     * @returns Success status
     */
    async deleteFile(fileUrl: string) {
        if (!fileUrl) return { success: false, message: "No file URL provided" };

        const storageType = Config.get("blog.storageType");

        switch (storageType) {
            case "spaces":
                return await this.deleteFileFromCloudflare(fileUrl);
            case "s3":
                return await this.deleteFileFromS3(fileUrl);
            default:
                // For local storage, we don't need to do anything here
                // as files are deleted directly from filesystem
                return { success: true, message: "Local storage - file handled separately" };
        }
    }

    /**
     * Delete a file from Cloudflare Spaces
     * @param fileUrl - The URL of the file to delete
     * @returns Success status
     */
    private async deleteFileFromCloudflare(fileUrl: string) {
        try {
            const spacesAccessKey = Config.get("blog.spacesAccessKey");
            const spacesSecretKey = Config.get("blog.spacesSecretKey");
            const spacesRegion = Config.get("blog.spacesRegion");
            const spacesName = Config.get("blog.spacesName");
            const spacesEndpoint = Config.get("blog.spacesEndpoint");

            // Extract the key from the URL
            const fileName = fileUrl.split('/').pop();
            if (!fileName) {
                return { success: false, message: "Invalid file URL" };
            }

            const client = new S3Client({
                endpoint: spacesEndpoint,
                region: spacesRegion,
                credentials: {
                    accessKeyId: spacesAccessKey,
                    secretAccessKey: spacesSecretKey,
                },
                forcePathStyle: false,
            });

            const command = new DeleteObjectCommand({
                Bucket: spacesName,
                Key: fileName,
            });

            await client.send(command);
            return { success: true, message: "File deleted successfully from Cloudflare Spaces" };
        } catch (err: any) {
            console.error('Error deleting file from Cloudflare Spaces:', err);
            return { success: false, message: err.message || "Failed to delete file from Cloudflare Spaces" };
        }
    }

    /**
     * Delete a file from S3
     * @param fileUrl - The URL of the file to delete
     * @returns Success status
     */
    private async deleteFileFromS3(fileUrl: string) {
        try {
            const s3AccessKey = Config.get("blog.s3AccessKey");
            const s3SecretKey = Config.get("blog.s3SecretKey");
            const s3Bucket = Config.get("blog.s3Bucket");
            const s3Region = Config.get("blog.s3Region");
            const s3Endpoint = Config.get("blog.s3Endpoint");
            const s3UsePathStyle = Config.get("blog.s3UsePathStyle");

            // Extract the key from the URL
            const fileName = fileUrl.split('/').pop();
            if (!fileName) {
                return { success: false, message: "Invalid file URL" };
            }

            const client = new S3Client({
                region: s3Region,
                endpoint: s3Endpoint,
                credentials: {
                    accessKeyId: s3AccessKey,
                    secretAccessKey: s3SecretKey
                },
                forcePathStyle: s3UsePathStyle === true || s3UsePathStyle === "true"
            });

            const command = new DeleteObjectCommand({
                Bucket: s3Bucket,
                Key: fileName,
            });

            await client.send(command);
            return { success: true, message: "File deleted successfully from S3" };
        } catch (err: any) {
            console.error('Error deleting file from S3:', err);
            return { success: false, message: err.message || "Failed to delete file from S3" };
        }
    }
}
