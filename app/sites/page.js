"use client";

import { fetchInlinedSegmentsOnCacheMiss } from "next/dist/client/components/segment-cache/cache";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [name, setName] = useState("");
  const [adress, setAdress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    const { data } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });
    setSites(data || []);
  }

  async function handleAddSite() {
    if (!name) return alert("Site name is required");
    setLoading(true);
    const { error } = await supabase
      .from("sites")
      .insert({ name, adress, notes });
    if (error) alert(error.message);
    else {
      setName("");
      setAdress("");
      setNotes("");
      fetchSites();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this site?")) return
    await supabase.from("sites").delete().eq("id", id);
    fetchSites();
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Sites</h1>

      <div style={styles.form}>
        <h2 style={styles.subtitle}>Add a new site</h2>
        <input
          style={styles.input}
          placeholder="Site name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Address"
          value={adress}
          onChange={(e) => setAdress(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          style={styles.button}
          onClick={handleAddSite}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Site"}
        </button>
      </div>

      <div style={styles.list}>
        {sites.length === 0 && <p style={styles.empty}>No sites yet</p>}
        {sites.map((site) => (
          <div style={styles.sites}>
            <div>
              <p style={styles.siteName}>{site.name}</p>
              <p style={styles.siteDetail}>{site.adress}</p>
              <p style={styles.siteDetail}>{site.notes}</p>
            </div>
            <button
              style={styles.deleteBtn}
              onClick={() => handleDelete(site.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
const styles = {
  page: { padding: "32px", maxWidth: "800px", margin: "0 auto" },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "var(--text)",
  },
  sites: {
    display: "flex",
    justifyContent: "space-between",
  },
  subtitle: { fontSize: "18px", marginBottom: "16px", color: "#2d6a4f" },
  form: {
    backgroundColor: "#f9f9f9",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "32px",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    color: "#000000",
    fontSize: "15px",
    boxSizing: "border-box",
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
  siteName: { fontWeight: "bold", fontSize: "16px", marginBottom: "4px" },
  siteDetail: { color: "#666", fontSize: "14px", margin: "2px 0" },
  deleteBtn: {
    backgroundColor: "#e53e3e",
    color: "#fff",
    border: "none",
    height: "4vh",
    padding: "0px 8px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  empty: { color: "#999", textAlign: "center", padding: "32px" },
};
