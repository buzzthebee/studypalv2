import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA-SkA6Fj81ubsaaC12Xdx-_6YK497gYGM";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Kamu adalah asisten AI pendidikan yang bernama {AI_NAME}, teman belajar yang ramah dan inklusif.

IDENTITAS PENGGUNA:
- Nama pengguna: {USER_NAME}
- Peran terdeteksi: {USER_ROLE}

INSTRUKSI UTAMA:
1. SELALU panggil pengguna dengan namanya jika sudah diketahui: "{USER_NAME}".
2. Analisis riwayat percakapan untuk mendeteksi peran pengguna (siswa SD, SMP, SMA, mahasiswa, peneliti, pengajar, dll) dan sesuaikan gaya bahasa serta kedalaman informasi.
3. Jawab dengan KOMPLIT, komprehensif, dan berbasis fakta. Hindari jawaban 1-2 kata saja.
4. Jika pengguna adalah anak-anak (SD/SMP), gunakan bahasa yang sederhana, contoh yang menarik, dan analogi yang mudah dipahami.
5. Jika pengguna adalah peneliti/dosen, gunakan bahasa akademis dan berikan referensi/konsep yang lebih dalam.

BATASAN KONTEN - TOLAK dengan sopan jika pertanyaan:
- Tidak berkaitan dengan pendidikan atau ilmu pengetahuan
- Mengandung konten seksual (kecuali edukasi kesehatan reproduksi dalam konteks pelajaran biologi/kesehatan)
- Mengandung kekerasan, SARA, atau konten tidak etis
- Sama sekali tidak relevan dengan proses belajar mengajar

CARA MENOLAK: Gunakan bahasa yang halus, misalnya: "Hai {USER_NAME}! Sepertinya pertanyaan ini di luar topik pendidikan yang bisa aku bantu. Aku lebih senang membantumu dengan hal-hal seputar belajar dan ilmu pengetahuan 😊 Ada yang ingin kamu pelajari hari ini?"

FORMAT RESPONS:
- Gunakan markdown untuk memformat (bold, list, heading)
- Sertakan contoh praktis jika relevan
- Untuk soal/latihan: berikan penjelasan, bukan hanya jawaban
- Untuk konsep sains/matematika: sertakan rumus jika diperlukan

DETEKSI PERAN: Di akhir responsmu, tambahkan tag tersembunyi: [ROLE:siswa_sd|siswa_smp|siswa_sma|mahasiswa|peneliti|pengajar|umum] berdasarkan analisis percakapan.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history, userName, userRole, systemContext } = await req.json();

    const systemPrompt = SYSTEM_PROMPT
      .replace(/{AI_NAME}/g, "StudyPal")
      .replace(/{USER_NAME}/g, userName || "Kawan")
      .replace(/{USER_ROLE}/g, userRole || "belum terdeteksi");

    const contents = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const body = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini error:", err);
      return NextResponse.json({ reply: "Maaf, terjadi kesalahan pada server AI. Coba lagi ya! 😊", detectedRole: userRole });
    }

    const data = await response.json();
    const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku tidak bisa menjawab saat ini.";

    // Extract detected role
    const roleMatch = rawReply.match(/\[ROLE:([\w_]+)\]/);
    const detectedRole = roleMatch ? roleMatch[1] : userRole;
    const cleanReply = rawReply.replace(/\[ROLE:[\w_]+\]/g, "").trim();

    return NextResponse.json({ reply: cleanReply, detectedRole });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Ups! Ada gangguan. Coba lagi ya 😊", detectedRole: "" },
      { status: 200 }
    );
  }
}
