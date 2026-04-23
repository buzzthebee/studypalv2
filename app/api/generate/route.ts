import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA-SkA6Fj81ubsaaC12Xdx-_6YK497gYGM";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
  };
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(req: NextRequest) {
  try {
    const { type, topic, userRole, userName, options } = await req.json();

    if (type === "mindmap") {
      const prompt = `Buat mind map untuk topik "${topic}" yang cocok untuk ${userRole || "pelajar"}.
      
      Kembalikan HANYA JSON valid dengan struktur berikut (tanpa markdown/backtick):
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
            },
            {
              "id": "2", 
              "label": "Subtopik 2",
              "color": "#6FCF97",
              "children": [
                {"id": "2-1", "label": "Detail A", "color": "#F7B731", "children": []}
              ]
            }
          ]
        }
      }
      
      Buat 4-6 subtopik utama, masing-masing dengan 2-4 detail. Sesuaikan dengan tingkat ${userRole || "pelajar"}.`;

      const raw = await callGemini(prompt);
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const json = JSON.parse(clean);
        return NextResponse.json({ success: true, data: json });
      } catch {
        return NextResponse.json({ success: false, error: "Gagal parse mind map" });
      }
    }

    if (type === "flashcards") {
      const count = options?.count || 10;
      const prompt = `Buat ${count} flashcard untuk topik "${topic}" yang cocok untuk ${userRole || "pelajar"}.
      
      Kembalikan HANYA JSON valid (tanpa markdown/backtick):
      {
        "title": "${topic}",
        "cards": [
          {"id": "1", "front": "Pertanyaan/Istilah", "back": "Jawaban/Definisi lengkap", "mastered": false, "reviewCount": 0}
        ]
      }
      
      Pastikan pertanyaan beragam: definisi, contoh, perbandingan, aplikasi. Sesuaikan dengan ${userRole}.`;

      const raw = await callGemini(prompt);
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const json = JSON.parse(clean);
        return NextResponse.json({ success: true, data: json });
      } catch {
        return NextResponse.json({ success: false, error: "Gagal parse flashcards" });
      }
    }

    if (type === "worksheet") {
      const questionCount = options?.questionCount || 10;
      const prompt = `Buat worksheet/lembar kerja latihan soal tentang "${topic}" untuk ${userRole || "pelajar"}.
      
      Kembalikan HANYA JSON valid (tanpa markdown/backtick):
      {
        "title": "Worksheet: ${topic}",
        "subject": "${topic}",
        "userRole": "${userRole}",
        "userName": "${userName || 'Pelajar'}",
        "date": "${new Date().toLocaleDateString("id-ID")}",
        "instructions": "Kerjakan soal-soal berikut dengan teliti.",
        "sections": [
          {
            "type": "pilihan_ganda",
            "title": "Pilihan Ganda",
            "questions": [
              {
                "no": 1,
                "question": "Teks soal",
                "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
                "answer": "A",
                "explanation": "Penjelasan jawaban"
              }
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
      
      Buat ${Math.ceil(questionCount * 0.7)} soal pilihan ganda dan ${Math.floor(questionCount * 0.3)} soal essay.`;

      const raw = await callGemini(prompt);
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const json = JSON.parse(clean);
        return NextResponse.json({ success: true, data: json });
      } catch {
        return NextResponse.json({ success: false, error: "Gagal generate worksheet" });
      }
    }

    if (type === "studyplan") {
      const prompt = `Buat rencana belajar selama ${options?.weeks || 4} minggu untuk topik "${topic}" bagi ${userRole || "pelajar"} bernama ${userName || "Pelajar"}.
      
      Kembalikan HANYA JSON valid (tanpa markdown/backtick):
      {
        "title": "Rencana Belajar: ${topic}",
        "totalWeeks": ${options?.weeks || 4},
        "tasks": [
          {
            "id": "1",
            "title": "Judul tugas",
            "subject": "${topic}",
            "dueDate": "2024-01-07",
            "priority": "high",
            "completed": false,
            "notes": "Catatan tambahan"
          }
        ]
      }
      
      Buat 3-5 tugas per minggu, mulai dari yang mendasar ke yang kompleks.`;

      const raw = await callGemini(prompt);
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const json = JSON.parse(clean);
        return NextResponse.json({ success: true, data: json });
      } catch {
        return NextResponse.json({ success: false, error: "Gagal generate study plan" });
      }
    }

    return NextResponse.json({ success: false, error: "Unknown type" });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
