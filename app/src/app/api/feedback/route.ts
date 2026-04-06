import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const FEEDBACK_FILE = join(process.cwd(), "feedback-submissions.json");

interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  rating: number;
  category: string;
  message: string;
  wouldRecommend: boolean;
  submittedAt: string;
}

async function readFeedback(): Promise<FeedbackEntry[]> {
  try {
    const raw = await readFile(FEEDBACK_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeFeedback(entries: FeedbackEntry[]): Promise<void> {
  await writeFile(FEEDBACK_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, rating, category, message, wouldRecommend } = body;

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Feedback message is required" }, { status: 400 });
    }

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      name: (name || "Anonymous").trim().slice(0, 100),
      email: (email || "").trim().toLowerCase().slice(0, 200),
      rating,
      category: category || "general",
      message: message.trim().slice(0, 2000),
      wouldRecommend: Boolean(wouldRecommend),
      submittedAt: new Date().toISOString(),
    };

    const existing = await readFeedback();
    existing.unshift(entry);
    await writeFeedback(existing);

    console.log(`[Feedback] ${entry.submittedAt} | ${entry.email || "anonymous"} | ★${entry.rating} | ${entry.category}`);

    return NextResponse.json({ success: true, id: entry.id });
  } catch (err) {
    console.error("Feedback submission error:", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await readFeedback();
    return NextResponse.json({ count: entries.length, entries });
  } catch {
    return NextResponse.json({ count: 0, entries: [] });
  }
}
