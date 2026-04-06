import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_VOICE_ID = "pNInz6obpgDQGcFmaJgB";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

const GOOGLE_TTS_VOICES: Record<string, { languageCode: string; name: string; ssmlGender: string }> = {
  "hi-IN": { languageCode: "hi-IN", name: "hi-IN-Neural2-A",  ssmlGender: "FEMALE" },
  "en-IN": { languageCode: "en-IN", name: "en-IN-Neural2-A",  ssmlGender: "FEMALE" },
  "en-US": { languageCode: "en-US", name: "en-US-Neural2-F",  ssmlGender: "FEMALE" },
  "ta-IN": { languageCode: "ta-IN", name: "ta-IN-Neural2-A",  ssmlGender: "FEMALE" },
  "te-IN": { languageCode: "te-IN", name: "te-IN-Standard-A", ssmlGender: "FEMALE" },
  "kn-IN": { languageCode: "kn-IN", name: "kn-IN-Wavenet-A",  ssmlGender: "FEMALE" },
  "mr-IN": { languageCode: "mr-IN", name: "mr-IN-Wavenet-A",  ssmlGender: "FEMALE" },
  "bn-IN": { languageCode: "bn-IN", name: "bn-IN-Wavenet-A",  ssmlGender: "FEMALE" },
  "gu-IN": { languageCode: "gu-IN", name: "gu-IN-Wavenet-A",  ssmlGender: "FEMALE" },
};

function sanitizeText(text: string): string {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu,
      ""
    )
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "")
    .trim();
}

async function googleTTS(text: string, language: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const voice = GOOGLE_TTS_VOICES[language] || GOOGLE_TTS_VOICES["hi-IN"];

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: text.slice(0, 5000) },
          voice,
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1.0,
            pitch: 0,
            effectsProfileId: ["headphone-class-device"],
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Google TTS error:", res.status, JSON.stringify(err));
      return null;
    }

    const data = await res.json() as { audioContent: string };
    if (!data.audioContent) return null;

    const binary = Buffer.from(data.audioContent, "base64");
    return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
  } catch (err) {
    console.error("Google TTS request failed:", err);
    return null;
  }
}

async function elevenLabsTTS(text: string, voiceId?: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === "your_elevenlabs_api_key_here") return null;

  try {
    const targetVoiceId = voiceId || ELEVENLABS_VOICE_ID;
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
          text: text.slice(0, 2000),
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
      console.error("ElevenLabs TTS error:", errMsg);
      return null;
    }

    return await res.arrayBuffer();
  } catch (err) {
    console.error("ElevenLabs TTS request failed:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, language } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const sanitized = sanitizeText(text);

    if (!sanitized) {
      return NextResponse.json(
        { error: "No speakable text after sanitization" },
        { status: 400 }
      );
    }

    const bcp47 = (language as string) || "hi-IN";

    let audioBuffer = await googleTTS(sanitized, bcp47);
    let provider = "google";

    if (!audioBuffer) {
      audioBuffer = await elevenLabsTTS(sanitized, voiceId);
      provider = "elevenlabs";
    }

    if (!audioBuffer) {
      return NextResponse.json(
        { error: "No TTS provider available. Configure GOOGLE_API_KEY or ELEVENLABS_API_KEY." },
        { status: 503 }
      );
    }

    console.log(`[TTS] provider=${provider} lang=${bcp47} chars=${sanitized.length}`);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "public, max-age=3600",
        "X-TTS-Provider": provider,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate speech";
    console.error("TTS route error:", error);
    return NextResponse.json({ error: message || "TTS failed" }, { status: 500 });
  }
}
