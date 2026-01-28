import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("مفتاح API مفقود");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // الحل النهائي: استخدام موديل Flash المتاح عالمياً
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`
      أنت مساعد خبير في التجارة الإلكترونية الجزائرية (COD).
      أجب باللهجة الجزائرية أو العربية المبسطة.
      العملة: DZD.
      السؤال: ${message}
    `);
    
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ reply: "خطأ في الاتصال: " + error.message });
  }
}
