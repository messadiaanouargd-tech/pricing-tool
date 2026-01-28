import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "طريقة الإرسال غير صحيحة (يجب أن تكون POST)." });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "الرسالة فارغة!" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // أو gpt-4 إذا كان متاحاً في حسابك
      messages: [
        { 
          role: "system", 
          content: "أنت مساعد ذكي لأداة تسعير منتجات التجارة الإلكترونية (COD) في الجزائر. أجب باختصار وباللغة العربية. عملتك هي الدينار الجزائري." 
        },
        { role: "user", content: message },
      ],
    });

    // استخراج الرد وإرساله
    const reply = completion.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("OpenAI Error:", error);
    // إرجاع رسالة الخطأ لتظهر في الشات بدلاً من "خطأ غير متوقع"
    return res.status(500).json({ 
      reply: "عذراً، حدثت مشكلة في الاتصال بـ OpenAI. تأكد من صحة المفتاح (API Key) في إعدادات Vercel." 
    });
  }
}
