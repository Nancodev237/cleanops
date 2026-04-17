"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [siteId, setSiteId] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [jobsRes, sitesRes, employeesRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("*, sites(name), job_assignments(user_id, users(name))")
        .order("date", { ascending: true }),
      supabase.from("sites").select("*"),
      supabase.from("users").select("*").eq("role", "employee"),
    ]);
    setJobs(jobsRes.data || []);
    setSites(sitesRes.data || []);
    setEmployees(employeesRes.data || []);
  }

  function toggleEmployee(id) {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }

  async function handleAddJob() {
    if (!title || !siteId || !date)
      return alert("Title, site and date are required");
    setLoading(true);

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({ title, site_id: siteId, date, notes, status: "pending" })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (selectedEmployees.length > 0) {
      await supabase
        .from("job_assignments")
        .insert(
          selectedEmployees.map((userId) => ({
            job_id: job.id,
            user_id: userId,
          })),
        );
    }

    setTitle("");
    setDate("");
    setNotes("");
    setSiteId("");
    setSelectedEmployees([]);
    fetchAll();
    setLoading(false);
  }

  async function handleDelete(id) {
    await supabase.from("jobs").delete().eq("id", id);
    fetchAll();
  }

  async function handleStatusChange(id, status) {
    await supabase.from("jobs").update({ status }).eq("id", id);
    fetchAll();
  }

  const statusColors = {
    pending: { backgroundColor: "#fff8e1", color: "#f59e0b" },
    "in-progress": { backgroundColor: "#e3f2fd", color: "#2196f3" },
    completed: { backgroundColor: "#e8f5e9", color: "#4caf50" },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Jobs</h1>

      <div style={styles.form}>
        <h2 style={styles.subtitle}>Add a new job</h2>
        <input
          style={styles.input}
          placeholder="Job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          style={styles.input}
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
        >
          <option value="">Select a site</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>

        <input
          style={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <p style={styles.label}>Assign employees:</p>
        <div style={styles.checkboxGroup}>
          {employees.map((emp) => (
            <label key={emp.id} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedEmployees.includes(emp.id)}
                onChange={() => toggleEmployee(emp.id)}
              />
              {emp.name}
            </label>
          ))}
        </div>

        <button style={styles.button} onClick={handleAddJob} disabled={loading}>
          {loading ? "Adding..." : "Add Job"}
        </button>
      </div>

      <div style={styles.list}>
        {jobs.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📋</p>
            <p style={styles.emptyText}>
              No jobs yet. Create your first job above.
            </p>
          </div>
        )}
        {jobs.map((job) => (
          <div key={job.id} style={styles.card}>
            <div>
              <Link href={`/jobs/${job.id}`} style={styles.jobLink}>
                <p style={styles.jobTitle}>{job.title}</p>
              </Link>
              <p style={styles.jobDetail}> {job.sites?.name}</p>
              <p style={styles.jobDetail}> {job.date}</p>
              {job.notes && <p style={styles.jobDetail}> {job.notes}</p>}
              {job.job_assignments?.length > 0 && (
                <div style={styles.assigneeList}>
                  {job.job_assignments.map((a) => (
                    <span key={a.user_id} style={styles.assigneeTag}>
                      👤 {a.users?.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.cardRight}>
              <select
                style={{ ...styles.statusSelect, ...statusColors[job.status] }}
                value={job.status}
                onChange={(e) => handleStatusChange(job.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(job.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "900px", margin: "0 auto" },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "var(--text)",
  },
  subtitle: { fontSize: "18px", marginBottom: "16px", color: "#2d6a4f" },
  form: {
    backgroundColor: "#f9f9f9",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "32px",
  },
  input: {
    color: "",
    display: "block",
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#444",
  },
  checkboxGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "16px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    cursor: "pointer",
  },
  button: {
    backgroundColor: "#1a3a2a",
    color: "#fff",
    padding: "10px 24px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardRight: { display: "flex", alignItems: "center", gap: "12px" },
  jobTitle: { fontWeight: "bold", fontSize: "16px", marginBottom: "4px" },
  jobDetail: { color: "#666", fontSize: "14px", margin: "2px 0" },
  assigneeList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "10px",
  },
  assigneeTag: {
    backgroundColor: "var(--badge-done-bg)",
    color: "var(--badge-done-text)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusSelect: {
    padding: "6px 10px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#e53e3e",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  empty: { color: "#999", textAlign: "center", padding: "32px" },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    color: "var(--text-muted)",
  },
  emptyIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "14px",
  },
  jobLink: { textDecoration: "none" },
};
