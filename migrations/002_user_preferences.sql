-- User preferences table
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    preferences TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

-- Add additional columns to users table
ALTER TABLE users ADD COLUMN job_role TEXT;
ALTER TABLE users ADD COLUMN employee_id TEXT;
ALTER TABLE users ADD COLUMN work_shift TEXT;

-- Add indexes for better performance
CREATE INDEX idx_vibration_data_date ON vibration_data(date);
CREATE INDEX idx_vibration_data_user ON vibration_data(user_id);
CREATE INDEX idx_vibration_data_equipment ON vibration_data(equipment_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Admin stats view
CREATE VIEW admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = FALSE AND approved_at IS NULL) as pending_users,
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as active_users,
    (SELECT COUNT(*) FROM vibration_data WHERE date = DATE('now')) as today_data,
    (SELECT COUNT(*) FROM audit_logs WHERE timestamp >= DATE('now')) as today_activities;