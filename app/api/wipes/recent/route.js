import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const recentServers = await prisma.server_parsed.findMany({
        orderBy: {
          last_wipe: 'desc'
        },
        take: 25
      });

    return Response.json({ recentServers });
  } catch(e) {
    console.log(`Error: ${e}`);
    return Response.json({ error: "Unable to fetch recent servers" }, { status: 500 });
  } finally {
    console.log("End recent_servers API Call");
  }
}