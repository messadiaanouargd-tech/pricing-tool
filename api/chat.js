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
    return res.status(500).json({ reply: "مفتاح Groq API مفقود" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // التعديل هنا: استخدام الموديل الأحدث والأقوى والمتاح حالياً
        model: "llama-3.3-70b-versatile", 
        messages: [
          {
            role: "system",
            content: "أنت مساعد خبير في التجارة الإلكترونية (COD) في الجزائر. أجب باللهجة الجزائرية أو العربية المبسطة. العملة DZD."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || response.statusText);
    }

    const data = await response.json();
    const replyText = data.choices[0].message.content;

    return res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ reply: `خطأ: ${error.message}` });
  }
}
