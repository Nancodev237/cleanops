"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalSites: 0,
    totalEmployees: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentJobs();
  }, []);

  async function fetchStats() {
    const [jobsRes, sitesRes, employeesRes] = await Promise.all([
      supabase.from("jobs").select("status"),
      supabase.from("sites").select("id"),
      supabase.from("users").select("id").eq("role", "employee"),
    ]);

    const jobs = jobsRes.data || [];
    setStats({
      totalJobs: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      inProgress: jobs.filter((j) => j.status === "in-progress").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      totalSites: sitesRes.data?.length || 0,
      totalEmployees: employeesRes.data?.length || 0,
    });
  }

  async function fetchRecentJobs() {
    const { data } = await supabase
      .from("jobs")
      .select("*, sites(name)")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentJobs(data || []);
  }

  const statusColors = {
    pending: { backgroundColor: "#fff8e1", color: "#f59e0b" },
    "in-progress": { backgroundColor: "#e3f2fd", color: "#2196f3" },
    completed: { backgroundColor: "#e8f5e9", color: "#4caf50" },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Dashboard</h1>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{stats.totalJobs}</p>
          <p style={styles.statLabel}>Total Jobs</p>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #f59e0b" }}>
          <p style={styles.statNumber}>{stats.pending}</p>
          <p style={styles.statLabel}>Pending</p>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #2196f3" }}>
          <p style={styles.statNumber}>{stats.inProgress}</p>
          <p style={styles.statLabel}>In Progress</p>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #4caf50" }}>
          <p style={styles.statNumber}>{stats.completed}</p>
          <p style={styles.statLabel}>Completed</p>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #1a3a2a" }}>
          <p style={styles.statNumber}>{stats.totalSites}</p>
          <p style={styles.statLabel}>Sites</p>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #9c27b0" }}>
          <p style={styles.statNumber}>{stats.totalEmployees}</p>
          <p style={styles.statLabel}>Employees</p>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.subtitle}>Recent Jobs</h2>
          <Link href="/jobs" style={styles.viewAll}>
            View all →
          </Link>
        </div>
        {recentJobs.length === 0 && <p style={styles.empty}>No jobs yet.</p>}
        {recentJobs.map((job) => (
          <div key={job.id} style={styles.jobRow}>
            <div>
              <p style={styles.jobTitle}>{job.title}</p>
              <p style={styles.jobDetail}>
                📍 {job.sites?.name} · 📅 {job.date}
              </p>
            </div>
            <span style={{ ...styles.badge, ...statusColors[job.status] }}>
              {job.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "1000px", margin: "0 auto" },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "var(--text)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "40px",
  },
  statCard: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderTop: "4px solid #1a3a2a",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1a3a2a",
    margin: "0 0 4px 0",
  },
  statLabel: { fontSize: "14px", color: "#666", margin: 0 },
  section: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1a3a2a",
    margin: 0,
  },
  viewAll: { color: "#2d6a4f", fontSize: "14px", textDecoration: "none" },
  jobRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  jobTitle: { fontWeight: "bold", fontSize: "15px", margin: "0 0 4px 0" },
  jobDetail: { color: "#666", fontSize: "13px", margin: 0 },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  empty: { color: "#999", textAlign: "center", padding: "32px" },
};
