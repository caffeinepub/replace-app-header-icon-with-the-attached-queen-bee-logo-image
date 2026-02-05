import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Photo } from '@/backend';
import { getBlobDisplayURL } from './blobStorage';

interface InvoicePhotoPreviewDialogProps {
  photo: Photo;
  onClose: () => void;
}

export default function InvoicePhotoPreviewDialog({ photo, onClose }: InvoicePhotoPreviewDialogProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{photo.filename || 'Photo Preview'}</DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <img
            src={getBlobDisplayURL(photo.blobId)}
            alt={photo.filename || 'Invoice photo'}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
