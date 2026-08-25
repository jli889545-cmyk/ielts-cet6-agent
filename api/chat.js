export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "只允许 POST 请求"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "请输入学习内容"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "服务器尚未配置 OPENAI_API_KEY"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini",

          instructions: `
你是一个专业的个人英语学习 Agent。

你的任务是帮助用户学习 IELTS 雅思和 CET-6 六级。

你必须根据用户当前说的话直接回答，不要重复固定回复。

你可以：
1. 制定 IELTS 8 分学习计划
2. 根据剩余时间安排每天任务
3. 讲解英语单词
4. 讲解语法
5. 讲解长难句
6. 进行 IELTS 阅读、听力、写作、口语训练
7. 进行 CET-6 阅读、听力、写作、翻译训练
8. 批改英语作文
9. 批改 IELTS 口语答案
10. 指出错误并解释原因
11. 给出更自然、更高分的表达
12. 根据用户当前表现调整学习内容

如果用户说：
“我只有10分钟”

你应该根据10分钟安排学习。

如果用户说：
“帮我制定雅思8分计划”

你应该直接制定计划。

如果用户发来英语作文：
你应该批改作文。

如果用户发来英语句子：
你应该解释句子。

如果用户要求练口语：
你应该直接开始口语训练。

不要每次都回复：
“收到。我会把这次学习记录作为你的进度参考。”

必须根据用户实际输入产生不同的回答。

回答使用中文解释，英语内容保持英文。
`,

          input: message.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API Error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API 调用失败"
      });
    }

    return res.status(200).json({
      answer: data.output_text || "AI 没有返回内容"
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      error: error.message || "服务器发生错误"
    });
  }
}
