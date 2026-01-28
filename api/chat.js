export default async function handler(req, res) {
  // 1. إعدادات السماح (CORS) - ضرورية جداً
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // التعامل مع طلب الفحص المسبق
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: "مفتاح API غير موجود في إعدادات Vercel" });
    }

    // 2. الرابط المباشر (بدون مكتبات) - نستخدم gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // 3. الاتصال المباشر
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `أنت مساعد ذكي لأداة COD Pricing Tool الجزائرية. أجب بإيجاز وباللهجة الجزائرية. السؤال: ${message}` 
          }]
        }]
      })
    });

    // 4. فحص الأخطاء القادمة من جوجل
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || response.statusText);
    }

    // 5. استخراج الرد
    const data = await response.json();
    const replyText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Direct API Error:", error);
    return res.status(500).json({ reply: `خطأ في الاتصال: ${error.message}` });
  }
}
