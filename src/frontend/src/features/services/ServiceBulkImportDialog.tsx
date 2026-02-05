import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseImportData, type ParsedServiceRow } from './importParsing';
import { formatDollars, formatCurrencyOptional } from './types';
import { useBulkImportServices } from './queries';
import type { CreateServiceInput, BulkImportResult } from '@/backend';
import { toast } from 'sonner';

interface ServiceBulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceBulkImportDialog({ open, onOpenChange }: ServiceBulkImportDialogProps) {
  const [pastedText, setPastedText] = useState('');
  const [previewRows, setPreviewRows] = useState<ParsedServiceRow[]>([]);
  const [importResults, setImportResults] = useState<BulkImportResult[] | null>(null);
  const bulkImportMutation = useBulkImportServices();

  const handlePaste = (text: string) => {
    setPastedText(text);
    if (text.trim()) {
      const parsed = parseImportData(text);
      setPreviewRows(parsed);
      setImportResults(null);
    } else {
      setPreviewRows([]);
      setImportResults(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handlePaste(text);
    };
    reader.readAsText(file);
  };

  const handleRemoveRow = (rowIndex: number) => {
    setPreviewRows(prev => prev.filter(row => row.rowIndex !== rowIndex));
  };

  const handleImport = async () => {
    const validRows = previewRows.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    const services: CreateServiceInput[] = validRows.map(row => ({
      name: row.name,
      serviceType: row.serviceType || undefined,
      price: row.priceCents,
      service: row.service || undefined,
      notes: row.notes || undefined,
    }));

    try {
      const results = await bulkImportMutation.mutateAsync(services);
      setImportResults(results);
      
      const successCount = results.filter(r => r.isSuccess).length;
      const failCount = results.filter(r => !r.isSuccess).length;
      
      if (failCount === 0) {
        toast.success(`Successfully imported ${successCount} service${successCount !== 1 ? 's' : ''}`);
      } else {
        toast.warning(`Imported ${successCount} service${successCount !== 1 ? 's' : ''}, ${failCount} failed`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import services');
    }
  };

  const handleReset = () => {
    setPastedText('');
    setPreviewRows([]);
    setImportResults(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const validRowCount = previewRows.filter(row => row.isValid).length;
  const invalidRowCount = previewRows.filter(row => !row.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Services</DialogTitle>
          <DialogDescription>
            Import multiple services at once using CSV or TSV format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Format:</strong> Each row should contain: Name, Service Type, Price, Service, Notes
              <br />
              <strong>Example:</strong> Restring Acoustic, Maintenance, 45.00, Full restring with new strings, Use premium strings
              <br />
              Supports both CSV (comma-separated) and TSV (tab-separated) formats.
            </AlertDescription>
          </Alert>

          {/* Input Section */}
          {!importResults && (
            <>
              <div className="space-y-2">
                <Label htmlFor="paste-area">Paste Data</Label>
                <Textarea
                  id="paste-area"
                  placeholder="Paste your CSV or TSV data here..."
                  value={pastedText}
                  onChange={(e) => handlePaste(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t" />
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="flex-1 border-t" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </>
          )}

          {/* Preview Table */}
          {previewRows.length > 0 && !importResults && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Preview ({validRowCount} valid, {invalidRowCount} invalid)</Label>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Clear
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead className="text-right">Price ($)</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row) => (
                      <TableRow key={row.rowIndex} className={!row.isValid ? 'bg-destructive/10' : ''}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveRow(row.rowIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{row.name || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{row.serviceType || '—'}</TableCell>
                        <TableCell className="text-right">${formatDollars(row.priceCents)}</TableCell>
                        <TableCell className="text-muted-foreground">{row.service || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{row.notes || '—'}</TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Valid
                            </span>
                          ) : (
                            <span className="text-xs text-destructive flex items-center gap-1" title={row.errorMessage}>
                              <AlertCircle className="h-3 w-3" />
                              {row.errorMessage}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Results Table */}
          {importResults && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Import Results</Label>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Import More
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResults.map((result, index) => (
                      <TableRow key={index} className={!result.isSuccess ? 'bg-destructive/10' : ''}>
                        <TableCell className="font-medium">
                          {result.service?.name || previewRows[index]?.name || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {result.service?.serviceType || previewRows[index]?.serviceType || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyOptional(result.service?.price)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {result.service?.service || previewRows[index]?.service || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {result.service?.notes || previewRows[index]?.notes || '—'}
                        </TableCell>
                        <TableCell>
                          {result.isSuccess ? (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Success
                            </span>
                          ) : (
                            <span className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Failed
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.message || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              {importResults ? 'Close' : 'Cancel'}
            </Button>
            {!importResults && previewRows.length > 0 && (
              <Button
                onClick={handleImport}
                disabled={validRowCount === 0 || bulkImportMutation.isPending}
              >
                {bulkImportMutation.isPending ? 'Importing...' : `Import ${validRowCount} Service${validRowCount !== 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
