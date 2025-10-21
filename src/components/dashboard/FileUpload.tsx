import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  title: string;
  fileName?: string;
}

export const FileUpload = ({ onFileUpload, title, fileName }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    disabled: !!fileName,
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div
        {...getRootProps()}
        className={`w-full max-w-lg p-10 border-2 border-dashed rounded-lg text-center transition-colors
        ${fileName ? 'border-green-500 bg-green-500/10' : 
        isDragActive ? 'border-primary bg-primary/10 cursor-pointer' : 'border-gray-600 hover:border-primary cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        {fileName ? (
          <div className="flex flex-col items-center justify-center gap-4 text-green-400">
            <CheckCircle className="w-16 h-16" />
            <p className="text-lg font-semibold">Arquivo Carregado!</p>
            <p className="text-sm text-gray-400 break-all">{fileName}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <UploadCloud className="w-16 h-16 text-gray-400" />
            <p className="text-lg font-semibold text-foreground">
              {isDragActive ? 'Solte o arquivo aqui...' : 'Arraste e solte o arquivo CSV'}
            </p>
            <p className="text-gray-400">ou clique para selecionar</p>
          </div>
        )}
      </div>
    </div>
  );
};