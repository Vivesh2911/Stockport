import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

export default function CSVUploader({ onUpload }) {
  const onDrop = useCallback(files => { if (files[0]) onUpload(files[0]) }, [onUpload])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } })
  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'
    }`}>
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-3 text-blue-500" size={36} />
      <p className="font-semibold text-gray-700">
        {isDragActive ? 'Drop your CSV here' : 'Drag & drop your trade CSV here'}
      </p>
      <p className="text-sm text-gray-500 mt-1">or click to browse — supports Zerodha, Robinhood & generic formats</p>
    </div>
  )
}
