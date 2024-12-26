import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client with your credentials
const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


export const generatePresignedURL = async ( fileName: string, fileType: string,): Promise<string> => {
    const params = {
      Bucket: 'medtechphoto',
      Key: fileName,
      ContentType:fileType
    }
  
    try {
      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      return url;
  
    } catch (error) {
      console.error(error);
      throw new Error('Error generating presigned URL');
    }
  }