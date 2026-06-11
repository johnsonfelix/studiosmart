import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function createStudioOwner(data: {
  name: string;
  email: string;
  phone: string;
  passwordRaw: string;
  studioName: string;
}) {
  const existingUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: data.email },
        { phone: data.phone }
      ]
    },
  });

  if (existingUser) {
    if (existingUser.email === data.email) throw new Error("Email already registered");
    if (existingUser.phone === data.phone) throw new Error("Phone number already registered");
  }

  const hashedPassword = await bcrypt.hash(data.passwordRaw, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: Role.STUDIO,
      },
    });

    const studio = await tx.studio.create({
      data: {
        name: data.studioName,
        ownerId: user.id,
      },
    });

    return { user, studio };
  });

  return result;
}

export async function createClientUser(data: {
  name: string;
  email: string;
  passwordRaw: string;
}) {
  const existingUser = await prisma.user.findFirst({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.passwordRaw, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: Role.CLIENT,
    },
  });

  return user;
}
