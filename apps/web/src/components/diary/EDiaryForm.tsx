import { useState } from 'react'
import { AlertTriangle, Check, CloudOff, LoaderCircle, Save, Send } from 'lucide-react'
import type { AttachmentInput, DiaryEntryInput, Id, MaterialOption, MaterialUsageInput, WorkType } from '../../types'
import type { SyncState } from '../../hooks/useOfflineSync'
import { diaryApi } from '../../lib/api'
import { formatDateVN, generateClientTempId, WORK_TYPE_LABELS } from '../../lib/utils'
import { saveOfflineEntry } from '../../store/diaryOfflineStore'
import { AttachmentUploader } from './AttachmentUploader'
import { MaterialUsageFields } from './MaterialUsageFields'

interface Props {
  seasonLotId: Id
  lotCode: string
  availableMaterials: MaterialOption[]
  isOnline: boolean
  syncState: SyncState
  refreshPendingCount: () => void
  onSuccess?: (entryId?: Id) => void
  onCancel?: () => void
}

type FormStep = 'info' | 'materials' | 'review'
type FormData = Omit<DiaryEntryInput, 'seasonLotId'>
type SubmitResult = { type: 'online' | 'offline'; message: string }
type FormErrors = Partial<Record<keyof FormData, string>>

const localDateInput = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createInitialForm = (): FormData => ({
  workDate: localDateInput(),
  workType: 'OTHER',
  description: '',
  weatherNote: '',
  laborCount: 1,
  materials: [],
  attachments: [],
})

export function EDiaryForm({
  seasonLotId,
  lotCode,
  availableMaterials,
  isOnline,
  syncState,
  refreshPendingCount,
  onSuccess,
  onCancel,
}: Props) {
  const [step, setStep] = useState<FormStep>('info')
  const [form, setForm] = useState<FormData>(createInitialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)

  const validate = (checkMaterials = true) => {
    const nextErrors: FormErrors = {}
    if (!form.workDate) nextErrors.workDate = 'Vui lòng chọn ngày làm việc.'
    if (!form.workType) nextErrors.workType = 'Vui lòng chọn loại công việc.'
    if (!form.description.trim()) nextErrors.description = 'Vui lòng mô tả công việc.'
    else if (form.description.trim().length < 10) nextErrors.description = 'Mô tả cần ít nhất 10 ký tự.'

    const pesticideRows = form.materials.filter((material) => {
      const option = availableMaterials.find((item) => item.id === material.materialId)
      return option?.category.toUpperCase() === 'PESTICIDE'
    })
    if (checkMaterials && form.workType === 'PESTICIDE' && pesticideRows.length === 0) {
      nextErrors.materials = 'Công việc phun thuốc cần ghi ít nhất một loại thuốc BVTV.'
    } else if (checkMaterials && form.materials.some((material) => !material.materialId || material.quantityUsed <= 0 || !material.applicationDate)) {
      nextErrors.materials = 'Hãy chọn vật tư, nhập số lượng và ngày sử dụng cho từng dòng.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    const clientTempId = generateClientTempId()
    const payload: DiaryEntryInput = { seasonLotId, ...form }

    try {
      if (!isOnline) {
        const saved = saveOfflineEntry(payload, clientTempId)
        refreshPendingCount()
        setSubmitResult({
          type: 'offline',
          message: `Đã lưu trên thiết bị (${saved.clientTempId.slice(0, 8)}…). Sẽ tự đồng bộ khi có mạng.`,
        })
        return
      }

      try {
        const response = await diaryApi.create(seasonLotId, { ...payload, clientTempId }) as { id?: Id }
        setSubmitResult({ type: 'online', message: `Nhật ký${response.id ? ` #${response.id}` : ''} đã được gửi thành công.` })
        onSuccess?.(response.id)
      } catch {
        // Giữ nguyên idempotency key phòng trường hợp server đã nhận nhưng response bị mất.
        const saved = saveOfflineEntry(payload, clientTempId)
        refreshPendingCount()
        setSubmitResult({
          type: 'offline',
          message: `Gửi máy chủ chưa thành công. Đã lưu tạm (${saved.clientTempId.slice(0, 8)}…) để thử lại.`,
        })
      }
    } catch (error) {
      setErrors((current) => ({ ...current, description: error instanceof Error ? error.message : 'Không lưu được nhật ký.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm(createInitialForm())
    setErrors({})
    setSubmitResult(null)
    setStep('info')
  }

  if (submitResult) {
    return (
      <div className="page-content form-page">
        <section className="panel submit-success-panel">
          <div className="success-illustration">{submitResult.type === 'online' ? '🎉' : '📦'}</div>
          <h1>{submitResult.type === 'online' ? 'Ghi nhật ký thành công!' : 'Đã lưu ngoại tuyến!'}</h1>
          <p>{submitResult.message}</p>
          {submitResult.type === 'offline' && syncState.pendingCount > 0 && (
            <div className="offline-result-notice"><CloudOff size={17} /><span>Có <strong>{syncState.pendingCount}</strong> bản ghi đang chờ đồng bộ. Dữ liệu vẫn được lưu trên thiết bị.</span></div>
          )}
          <div className="success-actions">
            <button type="button" onClick={resetForm} className="primary-button">+ Thêm nhật ký mới</button>
            <button type="button" onClick={onCancel} className="outline-button">Quay về</button>
          </div>
        </section>
      </div>
    )
  }

  const steps: { key: FormStep; label: string }[] = [
    { key: 'info', label: '1. Thông tin' },
    { key: 'materials', label: '2. Vật tư' },
    { key: 'review', label: '3. Xác nhận' },
  ]
  const currentStepIndex = steps.findIndex((item) => item.key === step)

  return (
    <div className="page-content form-page">
      <div className="page-title-row form-title-row">
        <div>
          <button className="back-link" type="button" onClick={onCancel}>← Quay lại tổng quan</button>
          <div className="eyebrow">NHẬT KÝ SẢN XUẤT</div>
          <h1>📓 Nhật ký sản xuất</h1>
          <p className="page-subtitle">Lô: <strong>{lotCode}</strong> · Ghi lại hoạt động canh tác để HTX xác nhận.</p>
        </div>
        <div className={`network-card ${isOnline ? 'network-online' : 'network-offline'}`}>
          {isOnline ? <span className="online-dot" /> : <CloudOff size={17} />}
          <span><strong>{isOnline ? 'Trực tuyến' : 'Ngoại tuyến — sẽ lưu tạm'}</strong><small>{isOnline ? 'Có thể gửi nhật ký lên máy chủ' : 'Sẽ tự đồng bộ khi có mạng'}</small></span>
        </div>
      </div>

      <section className="panel diary-wizard">
        <div className="wizard-header">
          <div className="wizard-steps">
            {steps.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => { if (index < currentStepIndex) setStep(item.key) }}
                disabled={index > currentStepIndex}
                className={`wizard-step ${step === item.key ? 'wizard-step-active' : index < currentStepIndex ? 'wizard-step-complete' : ''}`}
              >
                {index < currentStepIndex ? <Check size={14} /> : <span>{index + 1}</span>}{item.label.replace(`${index + 1}. `, '')}
              </button>
            ))}
          </div>
        </div>

        <div className="wizard-content">
          {step === 'info' && (
            <div className="wizard-fields">
              <div className="field">
                <label htmlFor="diary-work-date">📅 Ngày làm việc <b>*</b></label>
                <input id="diary-work-date" type="date" max={localDateInput()} value={form.workDate} onChange={(event) => updateForm('workDate', event.target.value)} />
                {errors.workDate && <span className="field-error">{errors.workDate}</span>}
              </div>

              <div className="field">
                <label>🔧 Loại công việc <b>*</b></label>
                <div className="work-type-grid">
                  {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((workType) => (
                    <button
                      key={workType}
                      type="button"
                      onClick={() => updateForm('workType', workType)}
                      className={`work-type-option ${form.workType === workType ? 'work-type-selected' : ''} ${form.workType === 'PESTICIDE' && workType === 'PESTICIDE' ? 'work-type-pesticide' : ''}`}
                    >
                      {WORK_TYPE_LABELS[workType]}
                    </button>
                  ))}
                </div>
                {form.workType === 'PESTICIDE' && <div className="pesticide-form-notice"><AlertTriangle size={17} /><span>Hãy ghi đầy đủ tên thuốc, liều lượng và ngày sử dụng để hệ thống tính thời gian cách ly.</span></div>}
                {errors.workType && <span className="field-error">{errors.workType}</span>}
              </div>

              <div className="field">
                <label htmlFor="diary-description">📝 Mô tả công việc <b>*</b></label>
                <textarea id="diary-description" rows={4} maxLength={2000} value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Mô tả chi tiết công việc đã thực hiện trong ngày..." />
                <div className="description-meta"><span className="field-error">{errors.description}</span><span>{form.description.length} ký tự</span></div>
              </div>

              <div className="wizard-fields-two">
                <div className="field">
                  <label htmlFor="diary-weather">🌤️ Thời tiết</label>
                  <select id="diary-weather" value={form.weatherNote ?? ''} onChange={(event) => updateForm('weatherNote', event.target.value)}>
                    <option value="">-- Chọn thời tiết --</option>
                    <option value="Nắng, không gió">☀️ Nắng, không gió</option>
                    <option value="Nắng, gió nhẹ">🌤️ Nắng, gió nhẹ</option>
                    <option value="Nhiều mây, không mưa">⛅ Nhiều mây, không mưa</option>
                    <option value="Mưa nhỏ">🌦️ Mưa nhỏ</option>
                    <option value="Mưa to">🌧️ Mưa to</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="diary-labor">👥 Số công lao động</label>
                  <input id="diary-labor" type="number" min="1" max="100" value={form.laborCount ?? 1} onChange={(event) => updateForm('laborCount', Number(event.target.value))} />
                </div>
              </div>

              <button type="button" className="primary-button wizard-next" onClick={() => { if (validate(false)) setStep('materials') }}>Tiếp theo → Ghi vật tư</button>
            </div>
          )}

          {step === 'materials' && (
            <div className="wizard-fields">
              <MaterialUsageFields
                materials={form.materials}
                availableMaterials={availableMaterials}
                workDate={form.workDate}
                onChange={(materials: MaterialUsageInput[]) => updateForm('materials', materials)}
              />
              {errors.materials && <p className="form-inline-error"><AlertTriangle size={15} />{errors.materials}</p>}
              <div className="form-divider" />
              <AttachmentUploader attachments={form.attachments} onChange={(attachments: AttachmentInput[]) => updateForm('attachments', attachments)} />
              <div className="wizard-actions">
                <button type="button" className="outline-button" onClick={() => setStep('info')}>← Quay lại</button>
                <button type="button" className="primary-button" onClick={() => { if (validate()) setStep('review') }}>Xem lại & Lưu →</button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="wizard-fields">
              <div className="review-card">
                <ReviewRow label="Ngày" value={formatDateVN(form.workDate)} />
                <ReviewRow label="Công việc" value={WORK_TYPE_LABELS[form.workType]} />
                <div className="review-block"><span>Mô tả</span><p>{form.description}</p></div>
                {form.weatherNote && <ReviewRow label="Thời tiết" value={form.weatherNote} />}
                <ReviewRow label="Nhân công" value={`${form.laborCount ?? 1} người`} />
                <div className="review-block">
                  <span>Vật tư sử dụng</span>
                  {form.materials.length === 0 ? <p className="review-muted">Không sử dụng vật tư</p> : form.materials.map((material, index) => {
                    const selected = availableMaterials.find((option) => option.id === material.materialId)
                    return <div className="review-material" key={`${material.materialId}-${index}`}><span>{selected?.name ?? `Vật tư ${material.materialId}`}</span><strong>{material.quantityUsed} {material.unit}</strong></div>
                  })}
                </div>
                {form.attachments.length > 0 && <ReviewRow label="Ảnh minh chứng" value={`${form.attachments.length} ảnh`} />}
              </div>

              {!isOnline && <div className="pesticide-form-notice offline-review-notice"><CloudOff size={17} /><span>Thiết bị đang ngoại tuyến. Nhật ký sẽ lưu trên thiết bị và tự gửi khi có kết nối.</span></div>}
              {errors.description && <p className="form-inline-error"><AlertTriangle size={15} />{errors.description}</p>}
              <div className="wizard-actions">
                <button type="button" className="outline-button" onClick={() => setStep('materials')}>← Sửa lại</button>
                <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting} className="primary-button wizard-submit">
                  {isSubmitting ? <><LoaderCircle className="spin" size={16} /> Đang lưu...</> : isOnline ? <><Send size={16} /> Lưu nhật ký</> : <><Save size={16} /> Lưu ngoại tuyến</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="review-row"><span>{label}</span><strong>{value}</strong></div>
}
