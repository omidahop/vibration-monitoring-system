-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'operator' CHECK (role IN ('admin', 'supervisor', 'operator')),
    full_name TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    approved_by INTEGER,
    approved_at DATETIME,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Equipment table
CREATE TABLE equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    unit_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Parameters table
CREATE TABLE parameters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    unit TEXT,
    min_value REAL DEFAULT 0,
    max_value REAL DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vibration data table
CREATE TABLE vibration_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id TEXT NOT NULL,
    equipment_id TEXT NOT NULL,
    parameter_id TEXT NOT NULL,
    value REAL NOT NULL,
    date DATE NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    notes TEXT,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_by INTEGER,
    validated_at DATETIME,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (parameter_id) REFERENCES parameters(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (validated_by) REFERENCES users(id),
    UNIQUE(unit_id, equipment_id, parameter_id, date)
);

-- User sessions table
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit log table
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, role, full_name, is_active, approved_at)
VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewD8.4Rqr7Nz0Zxa', 'admin', 'مدیر سیستم', TRUE, CURRENT_TIMESTAMP);