import { BlobServiceClient } from '@azure/storage-blob';

class AzureService {
    constructor() {
        this.blobServiceClient = null;
    }

    getBlobServiceClient() {
        if (!this.blobServiceClient) {
            const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
            if (!connectionString) {
                throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set');
            }
            this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        }
        return this.blobServiceClient;
    }

    async createContainer(containerName) {
        try {
            const containerClient = this.getBlobServiceClient().getContainerClient(containerName);
            await containerClient.createIfNotExists();
            return containerClient;
        } catch (error) {
            throw new Error(`Failed to create container: ${error.message}`);
        }
    }

    async uploadFile(containerName, blobName, content) {
        try {
            const containerClient = this.getBlobServiceClient().getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            
            await blockBlobClient.upload(content, Buffer.byteLength(content, 'utf8'), {
                blobHTTPHeaders: {
                    blobContentType: 'text/plain'
                }
            });
            
            return blockBlobClient.url;
        } catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    async downloadFile(containerName, blobName) {
        try {
            const containerClient = this.getBlobServiceClient().getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            
            const downloadResponse = await blockBlobClient.download();
            const content = await this.streamToString(downloadResponse.readableStreamBody);
            
            return content;
        } catch (error) {
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }

    async deleteFile(containerName, blobName) {
        try {
            const containerClient = this.getBlobServiceClient().getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            
            await blockBlobClient.deleteIfExists();
        } catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    async streamToString(readableStream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on('data', (data) => {
                chunks.push(data.toString());
            });
            readableStream.on('end', () => {
                resolve(chunks.join(''));
            });
            readableStream.on('error', reject);
        });
    }
}

export default new AzureService();