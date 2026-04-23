import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA-SkA6Fj81ubsaaC12Xdx-_6YK497gYGM";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  try {
    const { message, history, userName, userRole } = await req.json();

    // Kalau ada N8N_WEBHOOK_URL, kirim ke n8n
    if (N8N_WEBHOOK) {
      try {
        const res = await fetch(N8N_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            history,
            userName: userName || "Kawan",
            userRole: userRole || "",
            sessionId: userName || "default",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // n8n bisa return berbagai format, kita handle semuanya
          const reply =
            data.reply ||
            data.output ||
            data.text ||
            data?.json?.reply ||
            data?.[0]?.json?.reply ||
            data?.[0]?.output ||
            "Maaf, tidak ada respons dari AI.";
          const detectedRole = data.detectedRole || data?.json?.detectedRole || userRole || "";
          return NextResponse.json({ reply, detectedRole });
        }
      } catch (n8nErr) {
        console.warn("n8n gagal, fallback ke Gemini langsung:", n8nErr);
      }
    }

    // Fallback: langsung ke Gemini API
    const systemPrompt = `Kamu adalah AI Buddy pendidikan bernama StudyPal, teman belajar yang ramah dan inklusif.

Nama pengguna: ${userName || "Kawan"}
Peran terdeteksi: ${userRole || "belum diketahui"}

INSTRUKSI:
1. Panggil pengguna dengan namanya.
2. Deteksi peran dari konteks (siswa SD/SMP/SMA, mahasiswa, peneliti, pengajar) dan sesuaikan gaya bahasa.
3. Jawab komplit dan komprehensif.
4. TOLAK pertanyaan non-pendidikan dengan bahasa halus.
5. Gunakan markdown untuk format jawaban.

Di akhir respons tambahkan tag: [ROLE:siswa_sd|siswa_smp|siswa_sma|mahasiswa|peneliti|pengajar|umum]`;

    const contents = [
      ...history.slice(-20).map((h: { role: string; content: string }) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    });

    const geminiData = await geminiRes.json();
    const rawReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku tidak bisa menjawab saat ini.";
    const roleMatch = rawReply.match(/\[ROLE:([\w_]+)\]/);
    const detectedRole = roleMatch ? roleMatch[1] : userRole;
    const cleanReply = rawReply.replace(/\[ROLE:[\w_]+\]/g, "").trim();

    return NextResponse.json({ reply: cleanReply, detectedRole });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ reply: "Ups! Ada gangguan. Coba lagi ya 😊", detectedRole: "" });
  }
}
