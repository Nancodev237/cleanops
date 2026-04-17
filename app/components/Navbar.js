"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const [role, setRole] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    if (user) fetchRole();
  }, [user]);

  async function fetchRole() {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    setRole(data?.role);
  }

  const isActive = (href) => pathname === href;

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 32px",
        height: "64px",
        backgroundColor: "#1a3a2a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#ffffff",
          letterSpacing: "-0.5px",
        }}
      >
         CleanOps
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {role === "admin" && (
          <>
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/jobs", label: "Jobs" },
              { href: "/sites", label: "Sites" },
              { href: "/employees", label: "Employees" },
              { href: "/calendar", label: "Calendar" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: isActive(link.href) ? "#4ade80" : "#cbd5e0",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: isActive(link.href) ? "600" : "400",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  backgroundColor: isActive(link.href)
                    ? "rgba(74,222,128,0.1)"
                    : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </>
        )}
        {role === "employee" && (
          <Link
            href="/schedule"
            style={{
              color: "#cbd5e0",
              textDecoration: "none",
              fontSize: "14px",
              padding: "6px 12px",
            }}
          >
            My Schedule
          </Link>
        )}

        <button
          onClick={toggleTheme}
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#ffffff",
            padding: "6px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            marginLeft: "8px",
          }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div style={{ marginLeft: "8px" }}>
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
