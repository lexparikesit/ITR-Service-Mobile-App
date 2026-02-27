import { db } from "./attendanceQueueDb";

export type QueueStatus = "PENDING" | "SYNCING" | "SYNCED" | "FAILED" | "SKIPPED";

export type AttendanceQueueRow = {
    client_event_id: string;
    employee_nik: string;
    mode: "IN" | "OUT";
    client_time: string;
    device_tz: string;
    tz_offset_minutes: number | null;
    latitude: number;
    longitude: number;
    notes: string | null;
    photo_local_uri: string;
    photo_url: string | null;
    status: QueueStatus;
    retry_count: number;
    last_error: string | null;
    created_at: string;
};

export function enqueueAttendance(input: {
    clientEventId: string;
    employeeNik: string;
    mode: "IN" | "OUT";
    clientTime: string;
    deviceTz: string;
    tzOffsetMinutes?: number | null;
    latitude: number;
    longitude: number;
    notes?: string | null;
    photoLocalUri: string;
    photoUrl?: string | null;
}) {
    db.runSync(
        `INSERT INTO attendance_queue (
            client_event_id, employee_nik, mode,
            client_time, device_tz, tz_offset_minutes,
            latitude, longitude, notes,
            photo_local_uri, photo_url,
            status, retry_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0, ?)`,
    [
        input.clientEventId,
        input.employeeNik,
        input.mode,
        input.clientTime,
        input.deviceTz,
        input.tzOffsetMinutes ?? null,
        input.latitude,
        input.longitude,
        input.notes ?? null,
        input.photoLocalUri,
        input.photoUrl ?? null,
        new Date().toISOString(),
        ]
    );
}

export function getPending(limit = 10): AttendanceQueueRow[] {
    return db.getAllSync<AttendanceQueueRow>(
        `SELECT * FROM attendance_queue
            WHERE status IN ('PENDING','FAILED')
            ORDER BY created_at ASC
            LIMIT ?`,
        [limit]
    );
}

export function findExistingDailyAttendance(input: {
    employeeNik: string;
    mode: "IN" | "OUT";
    clientTime: string;
}): Pick<AttendanceQueueRow, "client_event_id" | "client_time" | "status"> | null {
    const row = db.getFirstSync<Pick<AttendanceQueueRow, "client_event_id" | "client_time" | "status">>(
        `SELECT client_event_id, client_time, status
            FROM attendance_queue
            WHERE employee_nik=?
              AND mode=?
              AND status != 'SKIPPED'
              AND date(client_time, 'localtime') = date(?, 'localtime')
            ORDER BY created_at DESC
            LIMIT 1`,
        [input.employeeNik, input.mode, input.clientTime]
    );

    return row ?? null;
}

export function getTodayLatestSyncedClockIn(): Pick<AttendanceQueueRow, "client_time"> | null {
    const row = db.getFirstSync<Pick<AttendanceQueueRow, "client_time">>(
        `SELECT client_time
            FROM attendance_queue
            WHERE mode='IN'
              AND status='SYNCED'
              AND date(client_time, 'localtime') = date('now', 'localtime')
            ORDER BY client_time DESC
            LIMIT 1`
    );

    return row ?? null;
}

export function setStatus(id: string, status: QueueStatus, lastError?: string | null) {
    if (status === "FAILED") {
        db.runSync(
            `UPDATE attendance_queue
            SET status=?, retry_count=retry_count+1, last_error=?
            WHERE client_event_id=?`,
            [status, lastError ?? null, id]
        );
        return;
    }

    db.runSync(
            `UPDATE attendance_queue
            SET status=?, last_error=?
            WHERE client_event_id=?`,
        [status, lastError ?? null, id]
    );
}

export function deleteQueueRow(id: string) {
    db.runSync(
        `DELETE FROM attendance_queue
        WHERE client_event_id=?`,
        [id]
    );
}

export function getOldTerminalRowsForCleanup(input?: { days?: number; limit?: number }): Pick<
    AttendanceQueueRow,
    "client_event_id" | "photo_local_uri"
>[] {
    const days = Math.max(1, input?.days ?? 7);
    const limit = Math.max(1, input?.limit ?? 50);

    return db.getAllSync<Pick<AttendanceQueueRow, "client_event_id" | "photo_local_uri">>(
        `SELECT client_event_id, photo_local_uri
            FROM attendance_queue
            WHERE status IN ('SYNCED', 'SKIPPED')
              AND date(client_time, 'localtime') < date('now', 'localtime', ?)
            ORDER BY created_at ASC
            LIMIT ?`,
        [`-${days} day`, limit]
    );
}

export function markSynced(id: string) {
    db.runSync(
            `UPDATE attendance_queue
            SET status='SYNCED', last_error=NULL
            WHERE client_event_id=?`,
        [id]
    );
}

export function attachPhotoUrl(id: string, photoUrl: string) {
    db.runSync(
            `UPDATE attendance_queue
            SET photo_url=?
            WHERE client_event_id=?`,
        [photoUrl, id]
    );
}
