import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await auth.api.signUpEmail({
    body: {
      email: "adam.osterholm@worksafesverige.se",
      password: "changeme123",
      name: "Adam Osterholm",
    },
  });

  // Update the user role to super_admin
  if (result?.user?.id) {
    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "super_admin" },
    });
    console.log("Admin user created with super_admin role");
  } else {
    console.log("Admin user created (role update may be needed)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma client cleanup is handled by the auth instance
  });
