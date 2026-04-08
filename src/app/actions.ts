"use server";

import { signOut } from "@/lib/auth";

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
