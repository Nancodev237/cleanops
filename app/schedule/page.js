"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function SchedulePage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (user) fetchMyJobs();
  }, [user]);

  async function fetchMyJobs() {
    const { data } = await supabase
      .from("job_assignments")
      .select("job_id, jobs(*, sites(name))")
      .eq("user_id", user.id);

    const myJobs = (data || []).map((row) => row.jobs).filter(Boolean);
    myJobs.sort((a, b) => new Date(a.date) - new Date(b.date));
    setJobs(myJobs);
  }

  const statusColors = {
    pending: { backgroundColor: "#fff8e1", color: "#f59e0b" },
    "in-progress": { backgroundColor: "#e3f2fd", color: "#2196f3" },
    completed: { backgroundColor: "#e8f5e9", color: "#4caf50" },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Schedule</h1>
      {jobs.length === 0 && (
        <p style={styles.empty}>No jobs assigned to you yet.</p>
      )}
      {jobs.map((job) => (
        <Link key={job.id} href={`/myjobs/${job.id}`} style={styles.cardLink}>
          <div style={styles.card}>
            <div>
              <p style={styles.jobTitle}>{job.title}</p>
              <p style={styles.jobDetail}> {job.sites?.name}</p>
              <p style={styles.jobDetail}> {job.date}</p>
              {job.notes && <p style={styles.jobDetail}>{job.notes}</p>}
            </div>
            <span style={{ ...styles.badge, ...statusColors[job.status] }}>
              {job.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "800px", margin: "0 auto" },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#1a3a2a",
  },
  cardLink: { textDecoration: "none", color: "inherit" },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  jobTitle: { fontWeight: "bold", fontSize: "16px", marginBottom: "4px" },
  jobDetail: { color: "#666", fontSize: "14px", margin: "2px 0" },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  empty: { color: "#999", textAlign: "center", padding: "32px" },
};

