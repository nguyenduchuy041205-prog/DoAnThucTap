import { ImagePlus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { AttachmentInput } from '../../types'

interface Props {
  attachments: AttachmentInput[]
  onChange: (attachments: AttachmentInput[]) => void
}

const MAX_FILE_BYTES = 450 * 1024

export function AttachmentUploader({ attachments, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const onFiles = async (files: FileList | null) => {
    setError('')
    if (!files) return
    const images = Array.from(files)
    if (images.some((file) => !file.type.startsWith('image/'))) {
      setError('Chỉ hỗ trợ tệp hình ảnh.')
      return
    }
    if (images.some((file) => file.size > MAX_FILE_BYTES)) {
      setError('Mỗi ảnh cần nhỏ hơn 450 KB để lưu offline ổn định.')
      return
    }
    try {
      const encoded = await Promise.all(images.map((file) => new Promise<AttachmentInput>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve({ fileUrl: String(reader.result), fileType: file.type, caption: file.name })
        reader.onerror = () => reject(new Error('Không đọc được ảnh.'))
        reader.readAsDataURL(file)
      })))
      onChange([...attachments, ...encoded])
    } catch {
      setError('Không thể đọc ảnh. Vui lòng thử lại.')
    }
  }

  return (
    <div className="field-section">
      <div className="section-label-row"><label>Ảnh minh chứng <span className="optional">Tùy chọn</span></label>
        <button type="button" className="small-add" onClick={() => inputRef.current?.click()}><ImagePlus size={15} /> Thêm ảnh</button>
        <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" multiple onChange={(e) => { void onFiles(e.target.files); e.currentTarget.value = '' }} />
      </div>
      {attachments.length === 0 ? <button className="upload-dropzone" type="button" onClick={() => inputRef.current?.click()}>
        <span className="upload-icon"><ImagePlus size={19} /></span><span><strong>Chọn ảnh minh chứng</strong><small>JPG, PNG · tối đa 450 KB mỗi ảnh</small></span>
      </button> : <div className="attachment-list">{attachments.map((item, index) => (
        <div className="attachment-chip" key={`${item.caption}-${index}`}>
          {item.fileUrl.startsWith('data:image') ? <img src={item.fileUrl} alt={item.caption ?? 'Ảnh minh chứng'} /> : <ImagePlus size={16} />}
          <span>{item.caption ?? `Ảnh ${index + 1}`}</span>
          <button type="button" onClick={() => onChange(attachments.filter((_, i) => i !== index))} aria-label="Xóa ảnh"><X size={14} /></button>
        </div>
      ))}</div>}
      {error && <p className="field-error">{error}</p>}
      <p className="field-hint">Ảnh được giữ trong hàng đợi offline; cần dịch vụ upload phía API để lưu trữ lâu dài.</p>
    </div>
  )
}
