import { NextRequest, NextResponse } from "next/server";

const VOICE_ID = "pNInz6obpgDQGcFmaJgB";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const sanitized = text
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu,
        ""
      )
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "")
      .trim();

    if (!sanitized) {
      return NextResponse.json(
        { error: "No speakable text after sanitization" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey === "your_elevenlabs_api_key_here") {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const targetVoiceId = voiceId || VOICE_ID;

    const res = await fetch(
      `${ELEVENLABS_BASE}/text-to-speech/${targetVoiceId}?output_format=mp3_22050_32`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: sanitized.slice(0, 2000),
          model_id: "eleven_flash_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!res.ok) {
      let errMsg = `ElevenLabs error ${res.status}`;
      try {
        const body = await res.json();
        errMsg = body?.detail?.message || body?.message || body?.error || errMsg;
      } catch {
        const raw = await res.text().catch(() => "");
        if (raw) errMsg = raw;
      }
      console.error("TTS upstream error:", res.status, errMsg);
      return NextResponse.json({ error: errMsg }, { status: res.status >= 500 ? 502 : res.status });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate speech";
    console.error("TTS route error:", error);
    return NextResponse.json({ error: message || "TTS failed" }, { status: 500 });
  }
}
