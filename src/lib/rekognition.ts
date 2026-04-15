import { RekognitionClient } from "@aws-sdk/client-rekognition";

export const rekognitionClient = new RekognitionClient({
  region: process.env.S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});
