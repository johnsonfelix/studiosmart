"use server";

import { CreateCollectionCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "@/lib/rekognition";

export async function createAlbumCollection(albumId: string) {
  try {
    const command = new CreateCollectionCommand({
      CollectionId: albumId, // limit 255 chars, alphanumeric with - and _
    });
    
    await rekognitionClient.send(command);
    return { success: true };
  } catch (error: any) {
    if (error.name === "ResourceAlreadyExistsException") {
      return { success: true, message: "Collection already exists" };
    }
    console.error("Failed to create Rekognition collection:", error);
    return { success: false, error: "AWS Rekognition Error" };
  }
}
