export default async function handler(req, res) {
  // إعدادات السماح (CORS) عشان الموقع يشتغل
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // الرد على طلبات الفحص (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // استقبال الرسالة من المستخدم
  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY; // المفتاح سنجلبه من إعدادات Vercel

  if (!apiKey) {
    return res.status(500).json({ reply: "خطأ: مفتاح API غير موجود في الإعدادات" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // هذا هو الموديل الجديد المضمون
        messages: [
          {
            role: "system",
            content: "أنت مساعد ذكي للتجارة الإلكترونية في الجزائر. تكلم باللهجة الجزائرية وكن مختصراً ومفيداً."
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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "خطأ في الاتصال بـ Groq");
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    return res.status(500).json({ reply: "حدث خطأ: " + error.message });
  }
}
