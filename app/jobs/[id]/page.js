"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [clockEvents, setClockEvents] = useState([]);

  useEffect(() => {
    fetchJob();
    fetchClockEvents();
  }, []);

  async function fetchJob() {
    const { data } = await supabase
      .from("jobs")
      .select("*, sites(name), job_assignments(user_id, users(name))")
      .eq("id", id)
      .single();
    setJob(data);
  }

  async function fetchClockEvents() {
    const { data } = await supabase
      .from("clock_events")
      .select("*, users(name)")
      .eq("job_id", id)
      .order("clock_in", { ascending: true });
    setClockEvents(data || []);
  }

  function getDuration(clockIn, clockOut) {
    if (!clockIn || !clockOut) return "In progress...";
    const diff = new Date(clockOut) - new Date(clockIn);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  const statusColors = {
    pending: {
      backgroundColor: "var(--badge-pending-bg)",
      color: "var(--badge-pending-text)",
    },
    "in-progress": {
      backgroundColor: "var(--badge-progress-bg)",
      color: "var(--badge-progress-text)",
    },
    completed: {
      backgroundColor: "var(--badge-done-bg)",
      color: "var(--badge-done-text)",
    },
  };

  if (!job)
    return <p style={{ padding: "32px", color: "var(--text)" }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <button onClick={() => router.back()} style={styles.backBtn}>
        ← Back to jobs
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>{job.title}</h1>
        <span style={{ ...styles.statusBadge, ...statusColors[job.status] }}>
          {job.status}
        </span>
      </div>

      {/* Job Info */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Job Details</h2>
        <div style={styles.detailGrid}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Site</span>
            <span style={styles.detailValue}>{job.sites?.name}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Date</span>
            <span style={styles.detailValue}>{job.date}</span>
          </div>
          {job.notes && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Notes</span>
              <span style={styles.detailValue}>{job.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Assigned Employees */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Assigned Employees</h2>
        {job.job_assignments?.length === 0 && (
          <p style={styles.empty}>No employees assigned.</p>
        )}
        <div style={styles.assigneeList}>
          {job.job_assignments?.map((a) => (
            <div key={a.user_id} style={styles.assigneeChip}>
              <div style={styles.avatar}>
                {a.users?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={styles.assigneeName}>{a.users?.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Clock History */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Clock History</h2>
        {clockEvents.length === 0 && (
          <p style={styles.empty}>No clock events yet.</p>
        )}
        {clockEvents.map((event) => (
          <div key={event.id} style={styles.clockRow}>
            <div style={styles.clockLeft}>
              <div style={styles.avatar}>
                {event.users?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={styles.clockName}>{event.users?.name}</span>
            </div>
            <div style={styles.clockTimes}>
              <div style={styles.clockTime}>
                <span style={styles.clockLabel}>In</span>
                <span style={styles.clockValue}>
                  {event.clock_in
                    ? new Date(event.clock_in).toLocaleTimeString()
                    : "—"}
                </span>
              </div>
              <div style={styles.clockTime}>
                <span style={styles.clockLabel}>Out</span>
                <span style={styles.clockValue}>
                  {event.clock_out
                    ? new Date(event.clock_out).toLocaleTimeString()
                    : "—"}
                </span>
              </div>
              <div style={styles.clockTime}>
                <span style={styles.clockLabel}>Duration</span>
                <span
                  style={{
                    ...styles.clockValue,
                    color: "var(--accent)",
                    fontWeight: "700",
                  }}
                >
                  {getDuration(event.clock_in, event.clock_out)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "800px", margin: "0 auto" },
  backBtn: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "24px",
    padding: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "var(--text)",
    margin: 0,
  },
  statusBadge: {
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "var(--shadow)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--text)",
    marginBottom: "16px",
  },
  detailGrid: { display: "flex", flexDirection: "column", gap: "12px" },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--border)",
  },
  detailLabel: { fontSize: "13px", color: "var(--text-muted)" },
  detailValue: { fontSize: "14px", fontWeight: "600", color: "var(--text)" },
  assigneeList: { display: "flex", flexWrap: "wrap", gap: "10px" },
  assigneeChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    padding: "6px 14px",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#1a3a2a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
  },
  assigneeName: { fontSize: "13px", fontWeight: "600", color: "var(--text)" },
  clockRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid var(--border)",
  },
  clockLeft: { display: "flex", alignItems: "center", gap: "10px" },
  clockName: { fontSize: "14px", fontWeight: "600", color: "var(--text)" },
  clockTimes: { display: "flex", gap: "24px" },
  clockTime: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  clockLabel: {
    fontSize: "11px",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  clockValue: { fontSize: "13px", fontWeight: "600", color: "var(--text)" },
  empty: {
    color: "var(--text-muted)",
    fontSize: "14px",
    textAlign: "center",
    padding: "16px",
  },
};
