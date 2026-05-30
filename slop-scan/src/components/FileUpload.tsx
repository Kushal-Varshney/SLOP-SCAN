'use client';
import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  onError?: (msg: string) => void;
}

const ACCEPTED_EXTENSIONS = ['.txt', '.md'];
const TEXT_EXTENSIONS = ['.txt', '.md'];

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(ext: string): string {
  switch (ext) {
    case '.md': return '📝';
    case '.txt': return '📄';
    case '.pdf': return '📕';
    case '.docx': return '📘';
    default: return '📎';
  }
}

export default function FileUpload({ onTextExtracted, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; ext: string } | null>(null);
  const [reading, setReading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const processFile = useCallback((file: File) => {
    const ext = getExtension(file.name);

    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      onError?.(`Unsupported file type "${ext}". Try .txt or .md.`);
      return;
    }

    setUploadedFile({ name: file.name, size: file.size, ext });

    setReading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onTextExtracted(text);
      } else {
        onError?.('Failed to read file contents.');
      }
      setReading(false);
    };
    reader.onerror = () => {
      onError?.('Something went wrong reading that file. Try again?');
      setReading(false);
    };
    reader.readAsText(file);
  }, [onTextExtracted, onError]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleBrowse = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  }, [processFile]);

  const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius)',
    padding: uploadedFile ? '1.25rem 1.5rem' : '2.5rem 1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    background: isDragging
      ? 'rgba(88, 166, 255, 0.04)'
      : 'var(--bg-secondary)',
    boxShadow: isDragging
      ? '0 0 25px rgba(88, 166, 255, 0.15), inset 0 0 25px rgba(88, 166, 255, 0.03)'
      : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
    transition: 'transform 0.3s ease',
    transform: isDragging ? 'scale(1.15) translateY(-4px)' : 'scale(1)',
    filter: isDragging ? 'drop-shadow(0 0 8px rgba(88, 166, 255, 0.5))' : 'none',
  };

  const primaryTextStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    color: isDragging ? 'var(--accent)' : 'var(--text-primary)',
    marginBottom: '0.375rem',
    transition: 'color 0.3s ease',
  };

  const secondaryTextStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
  };

  const browseButtonStyle: React.CSSProperties = {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    border: '1px solid var(--border-active)',
    background: 'transparent',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const uploadedContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textAlign: 'left',
  };

  const fileInfoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const fileNameStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    color: 'var(--accent)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const fileSizeStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    marginTop: '0.125rem',
  };

  const clearBtnStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid rgba(255, 61, 90, 0.3)',
    borderRadius: '6px',
    color: 'var(--color-danger)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    padding: '0.375rem 0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleBrowse}
        style={{ display: 'none' }}
      />

      <div
        style={dropZoneStyle}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploadedFile && inputRef.current?.click()}
      >
        {reading ? (
          <div>
            <div style={{ ...iconStyle, animation: 'pulse-glow 1.5s infinite' }}>⏳</div>
            <div style={primaryTextStyle}>Reading file...</div>
          </div>
        ) : uploadedFile ? (
          <div style={uploadedContainerStyle}>
            <span style={{ fontSize: '2rem', flexShrink: 0 }}>
              {getFileIcon(uploadedFile.ext)}
            </span>
            <div style={fileInfoStyle}>
              <div style={fileNameStyle}>
                Got it! {uploadedFile.name}
              </div>
              <div style={fileSizeStyle}>
                {formatSize(uploadedFile.size)}
              </div>
            </div>
            <button
              style={clearBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFile(null);
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(255, 61, 90, 0.1)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'none';
              }}
            >
              Clear
            </button>
          </div>
        ) : (
          <div>
            <div style={iconStyle}>
              {isDragging ? '🎯' : '📁'}
            </div>
            <div style={primaryTextStyle}>
              {isDragging
                ? "Drop your file here (we won't judge... yet)"
                : 'Drag a .txt or .md file — or click to browse'}
            </div>
            <div style={secondaryTextStyle}>
              .txt · .md
            </div>
            <button
              style={browseButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(88, 166, 255, 0.08)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(88, 166, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'transparent';
                (e.target as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              Browse files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
