import * as AWS from 'aws-sdk'
import { Types } from 'aws-sdk/clients/s3';
// import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('TodosAccess')
// const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {

    static async generateUploadUrl(todoId: string): Promise<string> {

        const s3Client: Types = new AWS.S3({ signatureVersion: 'v4' })
    
        const url = s3Client.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: todoId,
            Expires: 1000,
        });

        logger.log('info', `Generating S3 bucket URL: ${url}`);
    
        return url as string;
    }
}