import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { awsConfig } from '../config/aws-config';
import { v4 as uuidv4 } from 'uuid';

// Validate configuration
console.log('AWS Configuration:', {
  region: awsConfig.region,
  bucketName: awsConfig.bucketName,
  hasAccessKeyId: !!awsConfig.credentials?.accessKeyId,
  hasSecretKey: !!awsConfig.credentials?.secretAccessKey
});

const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.credentials.accessKeyId,
    secretAccessKey: awsConfig.credentials.secretAccessKey
  }
});

export const uploadFile = async (file) => {
  try {
    console.log('Starting file upload:', { fileName: file.name, fileType: file.type, fileSize: file.size });
    
    const fileKey = `${uuidv4()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    console.log('File converted to buffer, uploading to S3...', {
      bucket: awsConfig.bucketName,
      fileKey,
      contentType: file.type
    });

    const command = new PutObjectCommand({
      Bucket: awsConfig.bucketName,
      Key: fileKey,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
      ACL: 'public-read',
    });

    await s3Client.send(command);
    console.log('File uploaded successfully:', fileKey);
    return fileKey;
  } catch (error) {
    console.error('Error uploading file:', {
      error: error.message,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      stack: error.stack,
      region: awsConfig.region,
      bucket: awsConfig.bucketName
    });
    throw error;
  }
};

export const deleteFile = async (fileKey) => {
  try {
    console.log('Deleting file:', fileKey);
    const command = new DeleteObjectCommand({
      Bucket: awsConfig.bucketName,
      Key: fileKey,
    });

    await s3Client.send(command);
    console.log('File deleted successfully:', fileKey);
  } catch (error) {
    console.error('Error deleting file:', {
      error: error.message,
      fileKey,
      stack: error.stack,
      region: awsConfig.region,
      bucket: awsConfig.bucketName
    });
    throw error;
  }
};

export const listFiles = async () => {
  try {
    console.log('Fetching files list from S3...');
    const command = new ListObjectsCommand({
      Bucket: awsConfig.bucketName,
    });

    const response = await s3Client.send(command);
    console.log('Files list fetched successfully:', response.Contents?.length || 0, 'files found');
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files:', {
      error: error.message,
      stack: error.stack,
      region: awsConfig.region,
      bucket: awsConfig.bucketName
    });
    throw error;
  }
};

export const getFileUrl = (fileKey) => {
  return `https://${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com/${fileKey}`;
}; 