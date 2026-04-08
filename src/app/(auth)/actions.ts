"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { createStudioOwner } from "@/services/auth.service";

export async function loginUser(formData: FormData) {
  try {
    const defaultData = Object.fromEntries(formData.entries());
    
    await signIn("credentials", {
      ...defaultData,
      redirect: false,
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const studioName = formData.get("studioName") as string;

    if (!name || !email || !password || (role === "STUDIO" && !studioName)) {
      return { error: "Missing required fields." };
    }

    if (role === "STUDIO") {
      await createStudioOwner({
        name,
        email,
        passwordRaw: password,
        studioName,
      });
    } else {
      // Create regular client user (handled differently based on studio invite later)
      return { error: "Client registration via generic form is currently disabled. Wait for studio invite." };
    }

    return { success: true };
  } catch (error: any) {
    if (error.message === "Email already registered") {
      return { error: error.message };
    }
    return { error: "Something went wrong during registration." };
  }
}
