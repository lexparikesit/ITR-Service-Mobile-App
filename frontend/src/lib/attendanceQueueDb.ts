import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("dtc_attendance.db");

export function initAttendanceQueueDb() {
    db.execSync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS attendance_queue (
            client_event_id TEXT PRIMARY KEY,
            employee_nik TEXT NOT NULL,
            mode TEXT NOT NULL,

            client_time TEXT NOT NULL,
            device_tz TEXT NOT NULL,
            tz_offset_minutes INTEGER,

            latitude REAL NOT NULL,
            longitude REAL NOT NULL,

            notes TEXT,
            photo_local_uri TEXT NOT NULL,
            photo_url TEXT,

            status TEXT NOT NULL,
            retry_count INTEGER NOT NULL DEFAULT 0,
            last_error TEXT,

            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_attq_status_created
        ON attendance_queue(status, created_at);
    `);
}