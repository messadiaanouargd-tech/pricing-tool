export default async function handler(req, res) {
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
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "⚠️ خطأ: مفتاح API غير موجود." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
            أنت "مستشار التجارة الذكي"، خبير متخصص في التجارة الإلكترونية (E-commerce & COD) في السوق الجزائري.
            
            شخصيتك:
            - تتحدث باللهجة الجزائرية البيضاء (مفهومة واحترافية).
            - أسلوبك: ذكي، عملي، ومباشر (بدون مقدمات طويلة مملة).
            - لا تعطي إجابات عامة مثل "يجب عليك التسويق"، بل أعطِ أرقاماً واستراتيجيات حقيقية.
            - أنت تعرف تحديات الجزائر: مشاكل التوصيل (Yalidine/Wilaya 58)، الروتور (Retour)، الدفع عند الاستلام، ومشاكل حظر حسابات الفيسبوك.

            تعليمات صارمة للإجابة:
            1. إذا سألك عن التسعير: استخدم معادلة (سعر الشراء + الإعلانات + التوصيل + هامش الربح) واذكر خطر الروتور دائماً.
            2. إذا سألك عن الإعلانات: تحدث عن Facebook Ads Library، التيك توك في الجزائر، وكيفية استهداف الولايات الكبرى.
            3. كن مختصراً ومفيداً. لا تكتب جرائد.
            4. إذا كانت الإجابة تتطلب خطوات، استخدم نقاطاً (1، 2، 3).
            5. دائماً اختم بنصيحة ذهبية قصيرة.
            `
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.6, // تقليل العشوائية ليكون أكثر دقة
        max_tokens: 1024
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "خطأ في الاتصال");
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ reply: "عذراً، حدث خطأ تقني بسيط. حاول مرة أخرى." });
  }
}
