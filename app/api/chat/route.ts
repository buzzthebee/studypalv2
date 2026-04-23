import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

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
        console.warn("n8n gagal, fallback ke Groq langsung:", n8nErr);
      }
    }

    // Fallback: langsung ke Groq API
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

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20).map((h: { role: string; content: string }) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const groqData = await groqRes.json();
    const rawReply = groqData.choices?.[0]?.message?.content || "Maaf, aku tidak bisa menjawab saat ini.";
    const roleMatch = rawReply.match(/\[ROLE:([\w_]+)\]/);
    const detectedRole = roleMatch ? roleMatch[1] : userRole;
    const cleanReply = rawReply.replace(/\[ROLE:[\w_]+\]/g, "").trim();

    return NextResponse.json({ reply: cleanReply, detectedRole });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ reply: "Ups! Ada gangguan. Coba lagi ya 😊", detectedRole: "" });
  }
}
