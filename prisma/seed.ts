import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { ROLES, ROLE_PERMISSIONS } from "@/app/lib/definitions";
import type { RoleName } from "@/app/lib/definitions";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding roles...");

  for (const [, roleName] of Object.entries(ROLES)) {
    const name = roleName as RoleName;
    await db.role.upsert({
      where: { name },
      update: { permissions: ROLE_PERMISSIONS[name] },
      create: { name, permissions: ROLE_PERMISSIONS[name] },
    });
    console.log(`  ✓ ${name}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
