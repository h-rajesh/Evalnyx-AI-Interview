import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  try {
    console.log("Connecting to database...");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    const users = await prisma.user.findMany({ take: 1 });
    console.log("Users:", users);
  } catch (err: any) {
    console.error("Error occurred:");
    console.error(err);
    if (err.code) console.error("Prisma error code:", err.code);
    if (err.meta) console.error("Prisma error meta:", err.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
