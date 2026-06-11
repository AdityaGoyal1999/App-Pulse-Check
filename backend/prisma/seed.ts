import "../src/load-env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hashPassword("password123");

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: { passwordHash },
    create: {
      email: "test@example.com",
      passwordHash,
      checks: {
        create: {
          name: "Test check",
          intervalSeconds: 300,
          graceSeconds: 60,
        },
      },
    },
    include: { checks: true },
  });

  const check = user.checks[0];
  if (!check) {
    throw new Error("Expected seed to create at least one check");
  }

  console.log("Seed complete.");
  console.log("User:", user.email);
  console.log("Ping UUID:", check.uuid);
  console.log(`Test: curl http://localhost:3000/ping/${check.uuid}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
