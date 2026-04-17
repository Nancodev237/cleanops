"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

export default function MyJobPage() {
  const { user } = useUser();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [clockEvent, setClockEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchJob();
      fetchClockEvent();
    }
  }, [user]);

  async function fetchJob() {
    const { data } = await supabase
      .from("jobs")
      .select("*, sites(name)")
      .eq("id", id)
      .single();
    setJob(data);
  }

  async function fetchClockEvent() {
    const { data } = await supabase
      .from("clock_events")
      .select("*")
      .eq("job_id", id)
      .eq("user_id", user.id)
      .single();
    setClockEvent(data || null);
  }

  async function handleClockIn() {
    setLoading(true);
    await supabase.from("clock_events").insert({
      job_id: id,
      user_id: user.id,
      clock_in: new Date().toISOString(),
    });
    await supabase.from("jobs").update({ status: "in-progress" }).eq("id", id);
    fetchJob();
    fetchClockEvent();
    setLoading(false);
  }

  async function handleClockOut() {
    setLoading(true);
    await supabase
      .from("clock_events")
      .update({
        clock_out: new Date().toISOString(),
      })
      .eq("id", clockEvent.id);
    await supabase.from("jobs").update({ status: "completed" }).eq("id", id);
    fetchJob();
    fetchClockEvent();
    setLoading(false);
  }

  if (!job) return <p style={{ padding: "32px" }}>Loading...</p>;

  const isClockedIn = clockEvent?.clock_in && !clockEvent?.clock_out;
  const isClockedOut = clockEvent?.clock_out;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{job.title}</h1>

      <div style={styles.card}>
        <p style={styles.detail}>
          📍 <strong>Site:</strong> {job.sites?.name}
        </p>
        <p style={styles.detail}>
          📅 <strong>Date:</strong> {job.date}
        </p>
        <p style={styles.detail}>
          📌 <strong>Status:</strong> {job.status}
        </p>
        {job.notes && (
          <p style={styles.detail}>
            📝 <strong>Notes:</strong> {job.notes}
          </p>
        )}
      </div>

      <div style={styles.clockSection}>
        {!clockEvent && (
          <button
            style={styles.clockInBtn}
            onClick={handleClockIn}
            disabled={loading}
          >
            🟢 Clock In
          </button>
        )}
        {isClockedIn && (
          <>
            <p style={styles.clockedInText}>
              ✅ Clocked in at{" "}
              {new Date(clockEvent.clock_in).toLocaleTimeString()}
            </p>
            <button
              style={styles.clockOutBtn}
              onClick={handleClockOut}
              disabled={loading}
            >
              🔴 Clock Out
            </button>
          </>
        )}
        {isClockedOut && (
          <div style={styles.summary}>
            <p>
              ✅ Clocked in:{" "}
              {new Date(clockEvent.clock_in).toLocaleTimeString()}
            </p>
            <p>
              ✅ Clocked out:{" "}
              {new Date(clockEvent.clock_out).toLocaleTimeString()}
            </p>
            <p style={styles.done}>Job completed!</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "700px", margin: "0 auto" },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "var(--text)",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "32px",
  },
  detail: { fontSize: "15px", margin: "8px 0", color: "#333" },
  clockSection: { textAlign: "center" },
  clockInBtn: {
    backgroundColor: "#2d6a4f",
    color: "#fff",
    padding: "14px 40px",
    fontSize: "18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  clockOutBtn: {
    backgroundColor: "#e53e3e",
    color: "#fff",
    padding: "14px 40px",
    fontSize: "18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "16px",
  },
  clockedInText: { fontSize: "16px", color: "#2d6a4f", marginBottom: "16px" },
  summary: {
    backgroundColor: "#e8f5e9",
    padding: "24px",
    borderRadius: "8px",
    fontSize: "16px",
    lineHeight: "2",
  },
  done: {
    fontWeight: "bold",
    color: "#2d6a4f",
    fontSize: "18px",
    marginTop: "8px",
  },
};
