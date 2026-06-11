"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { createStudioOwner, createClientUser } from "@/services/auth.service";

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
    const role = formData.get("role") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (role === "CLIENT") {
      if (!name || !email || !password) {
        return { error: "Missing required fields." };
      }
      await createClientUser({ name, email, passwordRaw: password });
    } else {
      const phone = formData.get("phone") as string;
      const studioName = formData.get("studioName") as string;

      if (!name || !email || !phone || !password || !studioName) {
        return { error: "Missing required fields." };
      }

      await createStudioOwner({
        name,
        email,
        phone,
        passwordRaw: password,
        studioName,
      });
    }

    return { success: true };
  } catch (error: any) {
    if (error.message === "Email already registered" || error.message === "Phone number already registered") {
      return { error: error.message };
    }
    return { error: "Something went wrong during registration." };
  }
}
