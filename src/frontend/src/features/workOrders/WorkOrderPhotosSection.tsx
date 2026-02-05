import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Upload, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Photo } from '@/backend';
import { validateImageFile } from '../invoices/photoTypes';
import { uploadImageBlob, getBlobDisplayURL } from '../invoices/blobStorage';
import InvoicePhotoPreviewDialog from '../invoices/InvoicePhotoPreviewDialog';

interface WorkOrderPhotosSectionProps {
  photos: Photo[];
  onUpload: (blobId: string, filename: string, contentType: string) => Promise<void>;
  onRemove: (photoId: string) => Promise<void>;
  isUploading: boolean;
}

export default function WorkOrderPhotosSection({
  photos,
  onUpload,
  onRemove,
  isUploading,
}: WorkOrderPhotosSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoToRemove, setPhotoToRemove] = useState<Photo | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setUploadProgress(0);
      const blobId = await uploadImageBlob(file, (percentage) => {
        setUploadProgress(percentage);
      });
      
      await onUpload(blobId, file.name, file.type);
      toast.success('Photo uploaded successfully');
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
      setUploadProgress(0);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!photoToRemove) return;

    try {
      await onRemove(photoToRemove.id);
      toast.success('Photo removed successfully');
      setPhotoToRemove(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove photo');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>Upload photos of the instrument and repair work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => setPreviewPhoto(photo)}
                    className="w-full aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
                  >
                    <img
                      src={getBlobDisplayURL(photo.blobId)}
                      alt={photo.filename || 'Work order photo'}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setPhotoToRemove(photo)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No photos uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!photoToRemove} onOpenChange={(open) => !open && setPhotoToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewPhoto && (
        <InvoicePhotoPreviewDialog
          photo={previewPhoto}
          onClose={() => setPreviewPhoto(null)}
        />
      )}
    </>
  );
}
