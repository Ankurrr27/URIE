import { prisma } from "../lib/prisma";

async function run() {
  console.log("Fetching project nodes...");
  const nodes = await prisma.careerNode.findMany({
    where: {
      type: "PROJECT"
    },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true
    }
  });

  for (const n of nodes) {
    console.log("-----------------------------------------");
    console.log(`ID: ${n.id}`);
    console.log(`Title: ${n.title}`);
    console.log(`Summary:\n${n.summary}`);
    console.log(`Content:`, JSON.stringify(n.content, null, 2));
  }
}

run()
  .catch(err => console.error("Query failed:", err))
  .finally(() => prisma.$disconnect());
