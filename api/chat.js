export default async function handler(req, res) {
  // 1. السماح للموقع بالاتصال (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. معالجة طلبات التحقق
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. التحقق من الرسالة والمفتاح
  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "⚠️ خطأ: مفتاح API غير مربوط في Vercel" });
  }

  try {
    // 4. الاتصال بـ Groq (الموديل الجديد)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // الموديل القوي والجديد
        messages: [
          {
            role: "system",
            content: "أنت مساعد ذكي وخبير في التجارة الإلكترونية (COD) في الجزائر. اسمك 'مستشار التسعير'. أجب باللهجة الجزائرية المفهومة. كن مختصراً، ذكياً، ومحفزاً. العملة هي DZD."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    // 5. التحقق من استجابة Groq
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "خطأ غير معروف من Groq");
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ reply: "عذراً، حدث خطأ في الاتصال بالمخدم." });
  }
}
