import { Plus, Trash2 } from 'lucide-react'
import type { MaterialOption, MaterialUsageInput } from '../../types'
import { addDaysToDate, formatDateVN } from '../../lib/utils'

interface Props {
  materials: MaterialUsageInput[]
  availableMaterials: MaterialOption[]
  workDate: string
  onChange: (materials: MaterialUsageInput[]) => void
}

export function MaterialUsageFields({ materials, availableMaterials, workDate, onChange }: Props) {
  const addRow = () => {
    onChange([
      ...materials,
      {
        materialId: '',
        quantityUsed: 0,
        unit: 'kg',
        applicationDate: workDate,
        note: '',
      },
    ])
  }

  const updateRow = (index: number, patch: Partial<MaterialUsageInput>) => {
    onChange(materials.map((material, rowIndex) => {
      if (rowIndex !== index) return material
      const next = { ...material, ...patch }
      if (patch.materialId) {
        const selected = availableMaterials.find((option) => option.id === patch.materialId)
        if (selected) {
          next.unit = selected.unit
          next.materialName = selected.name
        }
      }
      return next
    }))
  }

  const removeRow = (index: number) => onChange(materials.filter((_, rowIndex) => rowIndex !== index))

  return (
    <div className="field-section">
      <div className="section-label-row">
        <label>🧪 Vật tư sử dụng <span className="optional">Tùy chọn</span></label>
        <button type="button" onClick={addRow} className="small-add"><Plus size={14} /> Thêm vật tư</button>
      </div>

      {materials.length === 0 && (
        <p className="materials-empty">Không sử dụng vật tư trong ngày này.</p>
      )}

      {materials.map((material, index) => {
        const selected = availableMaterials.find((option) => option.id === material.materialId)
        const quarantineDays = selected?.quarantineDays ?? 0
        const safeDate = material.applicationDate && quarantineDays > 0
          ? addDaysToDate(material.applicationDate, quarantineDays)
          : null

        return (
          <div key={`${index}-${material.materialId}`} className="material-card">
            <div className="material-header-row">
              <div className="field material-name-field">
                <label htmlFor={`material-${index}`}>Tên vật tư <b>*</b></label>
                <select
                  id={`material-${index}`}
                  value={material.materialId}
                  onChange={(event) => updateRow(index, { materialId: event.target.value })}
                  required
                >
                  <option value="">-- Chọn vật tư --</option>
                  {availableMaterials.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}{(option.quarantineDays ?? 0) > 0 ? ` · ${option.quarantineDays} ngày cách ly` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => removeRow(index)} className="remove-button material-remove" title="Xóa dòng" aria-label="Xóa vật tư">
                <Trash2 size={15} />
              </button>
            </div>

            <div className="material-grid">
              <div className="field">
                <label htmlFor={`quantity-${index}`}>Số lượng <b>*</b></label>
                <input
                  id={`quantity-${index}`}
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={material.quantityUsed || ''}
                  onChange={(event) => updateRow(index, { quantityUsed: Number(event.target.value) })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor={`unit-${index}`}>Đơn vị</label>
                <input id={`unit-${index}`} value={material.unit} readOnly className="readonly-input" />
              </div>
              <div className="field">
                <label htmlFor={`application-${index}`}>Ngày sử dụng <b>*</b></label>
                <input
                  id={`application-${index}`}
                  type="date"
                  value={material.applicationDate}
                  onChange={(event) => updateRow(index, { applicationDate: event.target.value })}
                  required
                />
              </div>
            </div>

            {selected && quarantineDays > 0 && (
              <div className="quarantine-material-notice">
                <span>⏱</span>
                <span>Vật tư này có <strong>{quarantineDays} ngày cách ly</strong>. An toàn thu hoạch sau: <strong>{safeDate ? formatDateVN(safeDate) : '—'}</strong>.</span>
              </div>
            )}

            <div className="field material-note-field">
              <label htmlFor={`material-note-${index}`}>Ghi chú</label>
              <input
                id={`material-note-${index}`}
                type="text"
                placeholder="Nồng độ pha, diện tích phun..."
                value={material.note ?? ''}
                onChange={(event) => updateRow(index, { note: event.target.value })}
              />
            </div>
          </div>
        )
      })}
      {availableMaterials.length === 0 && <p className="field-hint">Chưa có danh mục vật tư. Bạn vẫn có thể lưu nhật ký không kèm vật tư.</p>}
    </div>
  )
}
