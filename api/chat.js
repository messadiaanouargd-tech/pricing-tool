import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // تفعيل CORS للسماح بالاتصال من المتصفح
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // التعامل مع طلب OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "طريقة الإرسال غير صحيحة." });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "الرسالة فارغة!" });
  }

  // التأكد من وجود المفتاح
  if (!process.env.GEMINI_API_KEY) {
    console.error("خطأ: مفتاح GEMINI_API_KEY غير موجود في إعدادات Vercel.");
    return res.status(500).json({ reply: "خطأ في إعدادات السيرفر: مفتاح API غير موجود." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      أنت مساعد ذكي لأداة "COD Pricing Tool" للتجار الجزائريين.
      أجب باختصار وباللهجة الجزائرية أو العربية المبسطة.
      العملة: DZD.
      السؤال: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Gemini Error Details:", error); // هذا سيظهر في سجلات Vercel
    return res.status(500).json({ 
      reply: "حدث خطأ تقني أثناء الاتصال. حاول مرة أخرى." 
    });
  }
}
