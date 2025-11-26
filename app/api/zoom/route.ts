// app/api/zoom/meetings/route.ts
import { NextRequest, NextResponse } from "next/server";

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID!;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID!;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET!;

async function getZoomAccessToken() {
  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;

  const authHeader = Buffer.from(
    `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
    },
    // **important**: no cache
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom token error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      topic = "My API Meeting",
      start_time, // e.g. "2025-11-02T21:00:00Z"
      duration = 30,
    } = body;

    const accessToken = await getZoomAccessToken();

    const zoomRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        type: start_time ? 2 : 1, // 2 = scheduled, 1 = instant
        start_time,
        duration,
        timezone: "America/Winnipeg",
        settings: {
          join_before_host: true,
          waiting_room: false,
        },
      }),
      cache: "no-store",
    });

    if (!zoomRes.ok) {
      const err = await zoomRes.text();
      return NextResponse.json(
        { error: "Zoom create failed", details: err },
        { status: zoomRes.status }
      );
    }

    const meeting = await zoomRes.json();

    return NextResponse.json({
      id: meeting.id,
      topic: meeting.topic,
      joinUrl: meeting.join_url, // send to participants
      startUrl: meeting.start_url, // keep private
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
