export default async function handler(req, res) {
  // إعدادات CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "مفتاح API غير موجود" });
  }

  // قائمة الموديلات التي سنجربها بالترتيب
  const modelsToTry = [
    "gemini-1.5-flash", // الأسرع
    "gemini-pro",       // الأكثر شيوعاً
    "gemini-1.5-pro",   // الأقوى
    "gemini-1.0-pro"    // النسخة القديمة المستقرة
  ];

  let lastError = null;

  // حلقة تكرارية تجرب الموديلات واحداً تلو الآخر
  for (const model of modelsToTry) {
    try {
      console.log(`Trying model: ${model}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `أنت مساعد خبير في التجارة الإلكترونية (COD) في الجزائر. العملة DZD. أجب باختصار. السؤال: ${message}` 
            }]
          }]
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || response.statusText);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("لا يوجد رد من النموذج");
      }

      const replyText = data.candidates[0].content.parts[0].text;
      
      // إذا نجحنا، نرسل الرد ونوقف المحاولات
      return res.status(200).json({ reply: replyText });

    } catch (error) {
      console.error(`Failed with ${model}:`, error.message);
      lastError = error.message;
      // نستمر للموديل التالي في القائمة
      continue;
    }
  }

  // إذا فشلت كل الموديلات
  return res.status(500).json({ 
    reply: `عذراً، حدث خطأ في جميع محاولات الاتصال. (آخر خطأ: ${lastError})` 
  });
}
