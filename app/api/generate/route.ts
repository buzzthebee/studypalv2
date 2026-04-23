import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callGroq(prompt: string, maxTokens = 1200): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      temperature: 0.6,
      messages: [
        { role: "system", content: "Asisten pendidikan. Kembalikan HANYA JSON valid, tanpa markdown/backtick." },
        { role: "user", content: prompt },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseJSON(raw: string) {
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

function sanitizeStudyPlan(data: any) {
  const priorityMap: Record<string, string> = {
    high: "high", medium: "medium", low: "low",
    tinggi: "high", sedang: "medium", rendah: "low",
    urgent: "high", normal: "medium", santai: "low",
  };
  if (Array.isArray(data.tasks)) {
    data.tasks = data.tasks.map((t: any, i: number) => ({
      id: t.id || Date.now().toString() + i,
      title: t.title || "Tugas",
      subject: t.subject || "",
      dueDate: t.dueDate || new Date().toISOString().split("T")[0],
      priority: priorityMap[(t.priority || "").toLowerCase()] || "medium",
      completed: false,
      notes: t.notes || "",
    }));
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { type, topic, userRole, userName, options } = await req.json();
    const role = userRole || "pelajar";
    const name = userName || "Pelajar";

    const SCHEMAS: Record<string, string> = {
      mindmap: `{"title":str,"rootNode":{"id":"root","label":str,"color":"#6C63FF","children":[{"id":str,"label":str,"color":str,"children":[{"id":str,"label":str,"color":str,"children":[]}]}]}}`,
      flashcards: `{"title":str,"cards":[{"id":str,"front":str,"back":str,"mastered":false,"reviewCount":0}]}`,
      worksheet: `{"title":str,"subject":str,"userRole":str,"userName":str,"date":str,"instructions":str,"sections":[{"type":"pilihan_ganda"|"essay","title":str,"questions":[{"no":int,"question":str,"options":["A...","B...","C...","D..."]|null,"answer":str,"explanation":str,"points":int|null}]}]}`,
      studyplan: `{"title":str,"totalWeeks":int,"tasks":[{"id":str,"title":str,"subject":str,"dueDate":"YYYY-MM-DD","priority":"high"|"medium"|"low","completed":false,"notes":str}]}`,
    };

    const cardCount = Math.min(options?.count || 10, 10);
    const qCount = Math.min(options?.questionCount || 8, 8);
    const weeks = Math.min(options?.weeks || 4, 4);

    const PROMPTS: Record<string, string> = {
      mindmap:   `Buat mind map topik "${topic}" untuk ${role}. 4 subtopik, masing-masing 2-3 detail.`,
      flashcards:`Buat ${cardCount} flashcard topik "${topic}" untuk ${role}. Variasikan: definisi, contoh, perbandingan, aplikasi.`,
      worksheet: `Buat worksheet "${topic}" untuk ${role} (${name}), tanggal ${new Date().toLocaleDateString("id-ID")}, ${qCount} soal. ~70% pilihan ganda, ~30% essay.`,
      studyplan: `Buat rencana belajar ${weeks} minggu untuk topik "${topic}", untuk ${role} bernama ${name}. Buat ${weeks * 3} tugas total (3 tugas per minggu), urut dari dasar ke kompleks. Field priority HARUS salah satu dari: "high", "medium", atau "low" (gunakan bahasa Inggris, jangan diterjemahkan). dueDate dalam format YYYY-MM-DD mulai dari hari ini.`,
    };

    const MAX_TOKENS: Record<string, number> = {
      mindmap: 900, flashcards: 800, worksheet: 1000, studyplan: 1200,
    };

    const ERRORS: Record<string, string> = {
      mindmap: "Gagal parse mind map",
      flashcards: "Gagal parse flashcards",
      worksheet: "Gagal generate worksheet",
      studyplan: "Gagal generate study plan",
    };

    if (!PROMPTS[type]) {
      return NextResponse.json({ success: false, error: "Unknown type" });
    }

    const prompt = `${PROMPTS[type]}\nSchema JSON: ${SCHEMAS[type]}\nBahasa Indonesia.`;
    const raw = await callGroq(prompt, MAX_TOKENS[type]);

    try {
      let data = parseJSON(raw);
      if (type === "studyplan") data = sanitizeStudyPlan(data);
      return NextResponse.json({ success: true, data });
    } catch {
      return NextResponse.json({ success: false, error: ERRORS[type] });
    }
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
