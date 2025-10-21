import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div
        {...getRootProps()}
        className={`w-full max-w-lg p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <UploadCloud className="w-16 h-16 text-gray-400" />
          <p className="text-lg font-semibold text-foreground">
            {isDragActive ? 'Solte o arquivo aqui...' : 'Arraste e solte o arquivo CSV do Sienge aqui'}
          </p>
          <p className="text-gray-400">ou clique para selecionar o arquivo</p>
        </div>
      </div>
    </div>
  );
};