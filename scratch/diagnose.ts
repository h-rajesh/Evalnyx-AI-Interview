import "dotenv/config";
import prisma from "../lib/prisma";

async function run() {
  console.log("Listing all users and accounts in database:");
  try {
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    });
    console.log("USERS:", JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error querying database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
