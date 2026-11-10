-- =============================================================================
-- CROP COOP — Strategic Indexes (apply after prisma migrate)
-- =============================================================================

-- [Group 7] Public Portal tra cứu QR token (rất thường xuyên, phải cực nhanh)
CREATE UNIQUE INDEX IF NOT EXISTS idx_qrcodes_token
  ON qr_codes(token);

-- [Group 5] Quarantine Engine: lấy ngày phun thuốc cuối theo lô-mùa vụ
CREATE INDEX IF NOT EXISTS idx_material_usages_seasonlot_date
  ON material_usages(season_lot_id, application_date DESC);

-- [Group 4] Row-Level Security: nhật ký của từng nông dân theo lô-mùa vụ
CREATE INDEX IF NOT EXISTS idx_diary_entries_author_seasonlot
  ON diary_entries(author_id, season_lot_id);

-- [Group 9] Audit log tra cứu theo entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id, created_at DESC);

-- [Group 3] SeasonLot: query quarantine engine theo trạng thái
CREATE INDEX IF NOT EXISTS idx_season_lots_quarantine
  ON season_lots(quarantine_status, safe_date_to_harvest);

-- [Group 4] DiaryEntry: lọc nhanh theo status trong workflow
CREATE INDEX IF NOT EXISTS idx_diary_entries_status_date
  ON diary_entries(status, work_date DESC);

-- [Group 7] QR Code: lọc theo trạng thái duyệt
CREATE INDEX IF NOT EXISTS idx_qrcodes_status
  ON qr_codes(status, created_at DESC);

-- [Group 2] FarmerLot: tìm lô hiện tại của nông dân (end_date IS NULL)
CREATE INDEX IF NOT EXISTS idx_farmer_lots_active
  ON farmer_lots(farmer_id, lot_id)
  WHERE end_date IS NULL;

-- [Group 5] InventoryTransaction: sổ cái theo vật tư + thời gian
CREATE INDEX IF NOT EXISTS idx_inv_transactions_material_date
  ON inventory_transactions(material_id, transacted_at DESC);

