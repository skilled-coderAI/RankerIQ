import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const VOICE_ID = "pNInz6obpgDQGcFmaJgB";

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const sanitized = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "")
      .trim();

    if (!sanitized) {
      return NextResponse.json(
        { error: "No speakable text after sanitization" },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY === "your_elevenlabs_api_key_here") {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const audioStream = await elevenlabs.textToSpeech.stream(
      voiceId || VOICE_ID,
      {
        text: sanitized.slice(0, 2000),
        modelId: "eleven_flash_v2_5",
        outputFormat: "mp3_22050_32",
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.8,
          style: 0.3,
          useSpeakerBoost: true,
          speed: 1.0,
        },
      }
    );

    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(new Uint8Array(value));
    }

    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.length),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate speech";
    console.error("TTS error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
