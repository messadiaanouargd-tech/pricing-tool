// استيراد المكتبة
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. ضبط إعدادات CORS للسماح للمتصفح بالاتصال
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // التعامل مع طلب الفحص المسبق (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // التأكد أن الطلب هو POST
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: "Method Not Allowed" });
    }

    try {
        // 2. استلام الرسالة
        const { message } = req.body;
        if (!message) {
            throw new Error("الرسالة فارغة");
        }

        // 3. التحقق من المفتاح
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("مفتاح API غير موجود في إعدادات Vercel");
        }

        // 4. إعداد الاتصال بـ Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // استخدام موديل gemini-1.5-flash (الأسرع والأرخص والمدعوم حالياً)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 5. إرسال السؤال
        const prompt = `أنت مساعد ذكي ومحترف لأداة تسمى "COD Pricing Tool". أجب المستخدم باللهجة الجزائرية أو العربية البسيطة. العملة هي DZD. سؤال المستخدم: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 6. إرجاع الرد
        return res.status(200).json({ reply: text });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ 
            reply: `خطأ: ${error.message}` 
        });
    }
}
