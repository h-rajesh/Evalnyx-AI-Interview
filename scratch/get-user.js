require("dotenv").config();
const prisma = require("../lib/prisma").default;

async function run() {
  const users = await prisma.user.findMany({
    take: 5
  });
  console.log("Users:", users.map(u => ({ id: u.id, email: u.email })));

  const interviews = await prisma.interview.findMany({
    take: 5
  });
  console.log("Interviews:", interviews.map(i => ({ id: i.id, title: i.title })));
}

run().catch(console.error);
