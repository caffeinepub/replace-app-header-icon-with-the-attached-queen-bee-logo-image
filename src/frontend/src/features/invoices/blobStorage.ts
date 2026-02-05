export async function uploadImageBlob(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<string> {
  // Convert file to base64 data URL for storage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };
    
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

export function getBlobDisplayURL(blobId: string): string {
  // The blobId is already a data URL or direct URL
  return blobId;
}
