import { auth } from "@clerk/nextjs/server";
import { redis } from "@/lib/redis";

export async function GET(): Promise<Response> {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await redis.ping();

    return Response.json({
      status: "ok",
      redis: "connected",
      response,
    });
  } catch (error) {
    console.error("[redis-test] Redis connection failed:", error);

    return Response.json(
      {
        status: "error",
        redis: "disconnected",
      },
      { status: 503 },
    );
  }
}
