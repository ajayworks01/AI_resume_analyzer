import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

export default function DropZone({ onFile, accept = '.pdf,.docx,.doc', multiple = false, label = 'Resume' }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((accepted) => {
    setFiles(multiple ? accepted : [accepted[0]]);
    if (multiple) {
      onFile(accepted);
    } else {
      onFile(accepted[0]);
    }
  }, [multiple, onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] },
    multiple,
  });

  const remove = (i) => {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    onFile(multiple ? next : null);
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-sky-400 bg-sky-500/10'
            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className={`mx-auto mb-3 ${isDragActive ? 'text-sky-400' : 'text-slate-500'}`} />
        <p className="text-slate-300 font-medium">
          {isDragActive ? 'Drop here!' : `Drag & drop ${label}`}
        </p>
        <p className="text-slate-500 text-sm mt-1">or click to browse • PDF, DOCX supported</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-2.5 border border-slate-700">
              <FileText size={16} className="text-sky-400 flex-shrink-0" />
              <span className="text-sm text-slate-300 flex-1 truncate">{f.name}</span>
              <CheckCircle size={14} className="text-emerald-400" />
              <button onClick={() => remove(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
