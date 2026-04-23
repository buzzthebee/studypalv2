import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callGroq(prompt: string, maxTokens = 4096): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Kamu adalah asisten pendidikan. Kembalikan HANYA JSON valid. Jangan tambahkan teks, markdown, atau backtick apapun di luar JSON.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function safeParseJSON(raw: string): any {
  // Coba parse langsung dulu
  try {
    return JSON.parse(raw);
  } catch {}

  // Bersihkan: hapus markdown fences, leading/trailing noise
  let cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  // Ekstrak JSON object/array dari dalam teks
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch {}
  }

  throw new Error("Tidak bisa parse JSON dari response");
}

async function callGroqWithRetry(prompt: string, maxTokens = 4096, retries = 2): Promise<any> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const raw = await callGroq(prompt, maxTokens);
      return safeParseJSON(raw);
    } catch (err) {
      lastError = err as Error;
      console.error(`Attempt ${i + 1} failed:`, lastError.message);
      if (i < retries) await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const { type, topic, userRole, userName, options } = await req.json();

    if (type === "mindmap") {
      const prompt = `Buat mind map untuk topik "${topic}" untuk ${userRole || "pelajar"}.
Kembalikan JSON dengan struktur:
{
  "title": "${topic}",
  "rootNode": {
    "id": "root",
    "label": "${topic}",
    "color": "#6C63FF",
    "children": [
      {
        "id": "1",
        "label": "Subtopik 1",
        "color": "#FF6584",
        "children": [
          {"id": "1-1", "label": "Detail 1", "color": "#43CBFF", "children": []},
          {"id": "1-2", "label": "Detail 2", "color": "#43CBFF", "children": []}
        ]
      }
    ]
  }
}
Buat 4-5 subtopik utama, masing-masing 2-3 detail. Sesuaikan dengan ${userRole || "pelajar"}.`;

      try {
        const json = await callGroqWithRetry(prompt, 3000);
        return NextResponse.json({ success: true, data: json });
      } catch (err) {
        console.error("Mindmap error:", err);
        return NextResponse.json({ success: false, error: "Gagal generate mind map, coba lagi" });
      }
    }

    if (type === "flashcards") {
      const count = options?.count || 10;
      const prompt = `Buat tepat ${count} flashcard untuk topik "${topic}" untuk ${userRole || "pelajar"}.
Kembalikan JSON:
{
  "title": "${topic}",
  "cards": [
    {"id": "1", "front": "Pertanyaan atau istilah", "back": "Jawaban atau definisi lengkap", "mastered": false, "reviewCount": 0}
  ]
}
Buat variasi pertanyaan: definisi, contoh, perbandingan, aplikasi. Wajib ${count} kartu.`;

      try {
        const json = await callGroqWithRetry(prompt, 6000);
        return NextResponse.json({ success: true, data: json });
      } catch (err) {
        console.error("Flashcards error:", err);
        return NextResponse.json({ success: false, error: "Gagal generate flashcard, coba lagi" });
      }
    }

    if (type === "worksheet") {
      const questionCount = options?.questionCount || 10;
      const pgCount = Math.ceil(questionCount * 0.7);
      const essayCount = Math.floor(questionCount * 0.3);
      const prompt = `Buat worksheet tentang "${topic}" untuk ${userRole || "pelajar"}.
Kembalikan JSON:
{
  "title": "Worksheet: ${topic}",
  "subject": "${topic}",
  "userRole": "${userRole}",
  "userName": "${userName || "Pelajar"}",
  "date": "${new Date().toLocaleDateString("id-ID")}",
  "instructions": "Kerjakan soal-soal berikut dengan teliti.",
  "sections": [
    {
      "type": "pilihan_ganda",
      "title": "Pilihan Ganda",
      "questions": [
        {"no": 1, "question": "Teks soal", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A", "explanation": "Penjelasan"}
      ]
    },
    {
      "type": "essay",
      "title": "Uraian",
      "questions": [
        {"no": 1, "question": "Pertanyaan essay", "points": 10, "answer": "Kunci jawaban"}
      ]
    }
  ]
}
Buat ${pgCount} soal pilihan ganda dan ${essayCount} soal essay.`;

      try {
        const json = await callGroqWithRetry(prompt, 5000);
        return NextResponse.json({ success: true, data: json });
      } catch (err) {
        console.error("Worksheet error:", err);
        return NextResponse.json({ success: false, error: "Gagal generate worksheet, coba lagi" });
      }
    }

    if (type === "studyplan") {
      const prompt = `Buat rencana belajar ${options?.weeks || 4} minggu untuk "${topic}" bagi ${userRole || "pelajar"} bernama ${userName || "Pelajar"}.
Kembalikan JSON:
{
  "title": "Rencana Belajar: ${topic}",
  "totalWeeks": ${options?.weeks || 4},
  "tasks": [
    {"id": "1", "title": "Judul tugas", "subject": "${topic}", "dueDate": "2024-01-07", "priority": "high", "completed": false, "notes": "Catatan"}
  ]
}
Buat 3-5 tugas per minggu dari mendasar ke kompleks.`;

      try {
        const json = await callGroqWithRetry(prompt, 3000);
        return NextResponse.json({ success: true, data: json });
      } catch (err) {
        console.error("Studyplan error:", err);
        return NextResponse.json({ success: false, error: "Gagal generate study plan, coba lagi" });
      }
    }

    return NextResponse.json({ success: false, error: "Unknown type" });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
