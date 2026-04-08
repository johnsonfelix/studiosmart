import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      studioId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: Role
    studioId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    studioId?: string
  }
}
