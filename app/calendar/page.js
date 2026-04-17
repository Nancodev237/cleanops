"use client";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../lib/supabase";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const { data } = await supabase.from("jobs").select("*, sites(name)");
    const mapped = (data || []).map((job) => ({
      id: job.id,
      title: `${job.title} — ${job.sites?.name}`,
      date: job.date,
      backgroundColor:
        job.status === "completed"
          ? "#4caf50"
          : job.status === "in-progress"
            ? "#2196f3"
            : "#f59e0b",
      borderColor: "transparent",
    }));
    setEvents(mapped);
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Calendar</h1>
      <div style={styles.legend}>
        <span style={{ ...styles.dot, backgroundColor: "#f59e0b" }} /> Pending
        <span
          style={{
            ...styles.dot,
            backgroundColor: "#2196f3",
            marginLeft: "16px",
          }}
        />{" "}
        In Progress
        <span
          style={{
            ...styles.dot,
            backgroundColor: "#4caf50",
            marginLeft: "16px",
          }}
        />{" "}
        Completed
      </div>
      <div style={styles.calendarWrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
        />
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "1000px", margin: "0 auto" },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: "var(--text)",
  },
  legend: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    fontSize: "14px",
    color: "#555",
  },
  dot: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginRight: "6px",
  },
  calendarWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e0e0e0",
  },
};
