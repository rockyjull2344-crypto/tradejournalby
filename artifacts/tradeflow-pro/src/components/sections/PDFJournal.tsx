import { useState, useRef } from 'react';
import { useStore, PDF } from '@/store';
import { Upload, FileText, Trash2, Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PDFJournal() {
  const { state, addPDF, deletePDF } = useStore();
  const [selectedPDF, setSelectedPDF] = useState<PDF | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    
    // Max 5MB to avoid localStorage limits
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        addPDF({
          name: file.name,
          size: file.size,
          data: e.target.result as string
        });
        toast.success(`PDF uploaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Left: List & Upload */}
      <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold">PDF Journal</h3>
          <p className="text-xs text-muted-foreground mt-1">Upload daily reports, statements, or marked-up charts.</p>
        </div>
        
        {/* Upload Area */}
        <div 
          className={`p-6 border-b border-border flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isDragging ? 'bg-primary/10 border-primary border-dashed' : 'bg-background hover:bg-white/5'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={`w-8 h-8 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm font-medium mb-1">Click or drag PDF to upload</p>
          <p className="text-xs text-muted-foreground">Max 5MB</p>
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {state.pdfs.map(pdf => (
            <div 
              key={pdf.id}
              className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors cursor-pointer ${
                selectedPDF?.id === pdf.id ? 'bg-primary/10 border-primary' : 'bg-background border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedPDF(pdf)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 shrink-0 text-primary" />
                  <span className="text-sm font-medium truncate">{pdf.name}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this PDF?')) {
                      deletePDF(pdf.id);
                      if (selectedPDF?.id === pdf.id) setSelectedPDF(null);
                    }
                  }}
                  className="shrink-0 p-1 hover:bg-destructive/10 text-destructive rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>{format(new Date(pdf.date), 'MMM d, yyyy HH:mm')}</span>
                <span>{(pdf.size / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          ))}
          
          {state.pdfs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No PDFs uploaded yet.
            </div>
          )}
        </div>
      </div>

      {/* Right: Viewer */}
      <div className="col-span-2 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        {selectedPDF ? (
          <>
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-bold truncate pr-4">{selectedPDF.name}</h3>
              <button 
                onClick={() => setSelectedPDF(null)}
                className="p-1 hover:bg-white/10 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-black/50">
              <iframe 
                src={selectedPDF.data} 
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Eye className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a PDF to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
