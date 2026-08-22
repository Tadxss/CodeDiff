import { FileText, RefreshCw, Upload } from 'lucide-react';
import { FILE_ACCEPT } from '../lib/fileReader';

export default function TextPanel({
  label,
  value,
  onChange,
  onOpenFile,
  onClear,
  fileInputRef,
  placeholder,
}) {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-4 border-b border-inkborder flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-signal" />
          <span className="font-semibold text-bone">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-bone transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Open file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_ACCEPT}
            className="hidden"
            onChange={onOpenFile}
          />
          {value && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-bone transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>
      <div className="p-5 flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[45vh] min-h-[300px] bg-ink border border-inkborder rounded-lg p-3 font-body text-xs text-bone/80 resize-y focus:outline-none focus:border-signal/60 placeholder:text-muted/50 transition-colors"
        />
      </div>
    </div>
  );
}
