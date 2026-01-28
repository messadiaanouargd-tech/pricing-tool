import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. السماح بالاتصال (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message } = req.body;
    
    // 2. التحقق من المفتاح
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("مفتاح API غير موجود في Vercel");
    }

    // 3. الاتصال بـ Google Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `أنت مساعد ذكي لأداة "COD Pricing Tool". أجب باختصار وباللهجة الجزائرية. السؤال: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ 
      reply: `خطأ بالتفصيل: ${error.message}` 
    });
  }
}
