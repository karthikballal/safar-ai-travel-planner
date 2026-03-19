import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const analyticsEventSchema = z.object({
  eventName: z.string().min(1),
  payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.undefined()])).default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = analyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
    }

    console.info("[Analytics]", JSON.stringify(parsed.data));
    return NextResponse.json({ success: true }, { status: 202 });
  } catch {
    return NextResponse.json({ success: false }, { status: 202 });
  }
}
