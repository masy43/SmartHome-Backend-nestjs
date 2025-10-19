const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
    const saltRounds = Number(process.env.HASH_SALT || 10);

    const hashed = await bcrypt.hash(password, saltRounds);

    // Upsert admin user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: "Admin", password: hashed, role: "ADMIN" },
      create: {
        name: "Admin",
        email,
        password: hashed,
        role: "ADMIN",
      },
      select: { id: true, email: true, role: true },
    });

    // Create a sample session (expires in 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session
      .upsert({
        where: { id: user.id },
        update: {},
        create: {
          userId: user.id,
          token: `seed-token-${user.id}-${Date.now()}`,
          expiresAt,
        },
      })
      .catch(() => {});

    console.log("Seed complete:", user);
  } catch (err) {
    console.error("Seeding error", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
