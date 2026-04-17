"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function SyncUser() {
  const { user } = useUser();

  useEffect(() => {
    if (user) syncUser();
  }, [user]);

  async function syncUser() {
    const { data: existing } = await supabase
      .from("users")
      .select("id, name")
      .eq("id", user.id)
      .single();

    const name =
      user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress;

    if (!existing) {
      const { data: allUsers } = await supabase.from("users").select("id");
      const role = allUsers?.length === 0 ? "admin" : "employee";
      await supabase.from("users").insert({
        id: user.id,
        name,
        email: user.emailAddresses[0]?.emailAddress,
        role,
      });
    } else if (!existing.name || existing.name === "No name") {
      await supabase.from("users").update({ name }).eq("id", user.id);
    }
  }

  return null;
}
