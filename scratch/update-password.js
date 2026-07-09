require("dotenv").config();
const prisma = require("../lib/prisma").default;
const bcrypt = require("bcryptjs");

async function run() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const updatedUser = await prisma.user.update({
    where: { email: "23h51a67e6@cmrcet.ac.in" },
    data: { password: hashedPassword }
  });
  console.log("Updated user password successfully:", updatedUser.email);
}

run().catch(console.error);
