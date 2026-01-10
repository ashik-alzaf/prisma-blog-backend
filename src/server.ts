import app from "./app";
import { prisma } from "./lib/prisma";
const PORT = process.env.PORT;
async function main() {
  try {
    await prisma.$connect();
    console.log(`database connection`);
    app.listen(PORT, () => {
      console.log(`server is running ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
