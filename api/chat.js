export default async function handler(req, res) {
  // نسمحو غير بطلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'No message provided' });
  }

  try {
    // هنا نعيطو لـ OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // الموديل الاقتصادي والسريع
        messages: [
            { role: "system", content: "أنت مساعد ذكي لأداة تسعير في الجزائر. أجب باختصار وبالدارجة الجزائرية." },
            { role: "user", content: message }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // نرجعو الجواب للمستخدم
    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
