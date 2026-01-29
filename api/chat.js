// api/chat.js
export const config = {
  runtime: 'edge', // هذا ضروري جداً للـ Streaming في Vercel
};

export default async function handler(req) {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { message } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        stream: true, // <--- السر هنا: تفعيل التدفقة
        messages: [
          {
            role: "system",
            content: `
            أنت خبير استراتيجي في التجارة الإلكترونية الجزائرية. 
            تتحدث بلهجة جزائرية محترفة وواضحة.
            لا تعطي إجابات جاهزة. حلل سؤال المستخدم، فكر، ثم أعطِ حلاً مخصصاً له.
            استخدم التنسيق (Bold, Lists) لتكون إجابتك مقروءة.
            `
          },
          { role: 'user', content: message },
        ],
        temperature: 0.6,
        max_tokens: 2048,
      }),
    });

    // تحويل استجابة Groq المتدفقة إلى استجابة للمتصفح
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            // Groq يرسل البيانات بصيغة SSE (data: {...})
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const content = data.choices[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  // تجاهل الأخطاء البسيطة في التحليل
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
