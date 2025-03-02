import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { awsConfig } from '../config/aws-config';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client(awsConfig);

export const uploadFile = async (file) => {
  try {
    const fileKey = `${uuidv4()}-${file.name}`;
    const command = new PutObjectCommand({
      Bucket: awsConfig.bucketName,
      Key: fileKey,
      Body: file,
      ContentType: file.type,
    });

    await s3Client.send(command);
    return fileKey;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: awsConfig.bucketName,
      Key: fileKey,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const listFiles = async () => {
  try {
    const command = new ListObjectsCommand({
      Bucket: awsConfig.bucketName,
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

export const getFileUrl = (fileKey) => {
  return `https://${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com/${fileKey}`;
}; 