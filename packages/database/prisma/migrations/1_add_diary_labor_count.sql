-- Store the crew size reported for each production diary entry.
ALTER TABLE diary_entries
  ADD COLUMN IF NOT EXISTS labor_count INTEGER;
