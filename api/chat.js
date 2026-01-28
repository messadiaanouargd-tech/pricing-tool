import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. التحقق من طريقة الطلب
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "طريقة الإرسال غير صحيحة (يجب أن تكون POST)." });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "الرسالة فارغة!" });
  }

  try {
    // 2. الاتصال بـ Google Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. تحديد سياق المحادثة (System Prompt)
    const prompt = `
      أنت مساعد ذكي ومحترف لأداة تسمى "COD Pricing Tool".
      دورك هو مساعدة التجار الجزائريين في حساب تسعير منتجاتهم وتوقع الأرباح.
      أجب دائماً باللغة العربية، وكن مختصراً ومباشراً.
      العملة المستخدمة هي الدينار الجزائري (DZD).
      
      سؤال المستخدم هو: ${message}
    `;

    // 4. إرسال الرسالة واستقبال الرد
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. إرسال الرد للواجهة الأمامية
    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ 
      reply: "حدث خطأ أثناء الاتصال بـ Google Gemini. يرجى المحاولة لاحقاً." 
    });
  }
}
