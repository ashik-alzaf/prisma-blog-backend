import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth.middleware";

async function seedAdmin() {
  try {
    const adminData = {
      name: "admin",
      email: "admin@admin.com",
      password: "admin123",
      role: UserRole.ADMIN,
    };
    const isExiting = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });
    if (isExiting) {
      throw new Error("Admin already exists, skipping creation");
    }

    const res = await fetch("http://localhost:5000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    });

    if (res.ok) {
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
    } else {
      console.log("Failed to create admin, status:", res.status);
    }
  } catch (error) {
    throw error;
  }
}
seedAdmin();
