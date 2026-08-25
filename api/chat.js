export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "只允许 POST 请求"
    });
  }

  try {
    // 获取用户发送的内容
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "请输入学习内容"
      });
    }

    // 从 Vercel 环境变量读取 API Key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "服务器尚未配置 OPENAI_API_KEY"
      });
    }

    // 调用 OpenAI Responses API
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions: `
你是一个专业的个人英语学习 Agent。

你的主要任务是帮助用户学习：
1. IELTS 雅思
2. CET-6 大学英语六级

你需要：
- 根据用户水平制定学习计划
- 解释英语单词、语法和长难句
- 进行 IELTS 阅读、听力、写作、口语训练
- 进行 CET-6 阅读、听力、写作、翻译训练
- 批改用户作文
- 指出错误并解释原因
- 给出更自然、更高分的表达
- 根据用户的学习记录调整后续学习内容

回答要清晰、具体、适合中国英语学习者。

如果用户没有明确说明考试类型：
根据上下文判断是 IELTS 还是 CET-6；
如果无法判断，再询问用户。

不要只给答案，要帮助用户真正学会。
`,
          input: message.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API 调用失败"
      });
    }

    return res.status(200).json({
      answer: data.output_text || "AI 没有返回内容"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "服务器发生错误，请稍后再试"
    });
  }
}
