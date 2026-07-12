const { PrismaClient } = require("./app/generated/prisma");
const prisma = new PrismaClient();

async function run() {
  const email = "kpoojitha285@gmail.com";
  console.log("Checking user database record for email:", email);
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    });
    console.log("USER:", JSON.stringify(user, null, 2));
  } catch (err) {
    console.error("Error querying user:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
