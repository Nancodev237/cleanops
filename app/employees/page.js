'use client'

import { useState, useEffect } from "react"
import {supabase} from '../lib/supabase'

export default function EmployeesPage(){
  const [employee, setEmployees] = useState([])
  const [name, setName] = useState('')
  const[email, setEmail] = useState('')
  const[loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])


  async function handleAddEmployee() {
    if(!name || !email) return alert('Name and email are required')
    setLoading(true)
    const{error} = await supabase.from('users').insert({id: crypto.randomUUID(), name, email, role:'employee'})
    if(error) alert(error.message)
    else{
      setName('')
      setEmail('')
      fetchEmployees()
    }
    setLoading(false)
  }

  async function handleDelete(id){
    if (!confirm("Are you sure you want to delete this employee?")) return;
    await supabase.from("job_assignments").delete().eq("user_id", id);
    await supabase.from("clock_events").delete().eq("user_id", id);
    await supabase.from("job_reports").delete().eq("user_id", id);
    await supabase.from("users").delete().eq("id", id);
    fetchEmployees()
  }

  async function fetchEmployees() {
    const { data } = await supabase.from("users").select("*").order("name");
    setEmployees(data || []);
  }

  async function handleRoleChange(id, role) {
    await supabase.from("users").update({ role }).eq("id", id);
    fetchEmployees();
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Employees</h1>

      <div style={styles.form}>
        <h2 style={styles.subtitle}>Add a new employee</h2>
        <input
          style={styles.input}
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          style={styles.button}
          onClick={handleAddEmployee}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Employee"}
        </button>
      </div>

      <div style={styles.list}>
        {employee.length === 0 && <p style={styles.empty}>No employees yet.</p>}
        {employee.map((emp) => (
          <div key={emp.id} style={styles.card}>
            <div>
              <p style={styles.empName}>{emp.name}</p>
              <p style={styles.empEmail}>{emp.email}</p>
            </div>
            <div style={styles.cardRight}>
              <select
                style={styles.roleSelect}
                value={emp.role}
                onChange={(e) => handleRoleChange(emp.id, e.target.value)}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(emp.id)}
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
  page: { padding: "32px", maxWidth: "800px", margin: "0 auto" },
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
    display: "block",
    color: "#000000",
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
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
  cardRight: { display: "flex", alignItems: "center", gap: "12px" },
  empName: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "4px",
  },
  empEmail: { color: "#666", fontSize: "14px" },
  badge: {
    backgroundColor: "#e8f5e9",
    color: "#2d6a4f",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "13px",
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
  roleSelect: {
    padding: "6px 10px",
    color: "#aaaaaa",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
  },
};
