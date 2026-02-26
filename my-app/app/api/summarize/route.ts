import { NextRequest, NextResponse } from 'next/server';

// 配置 OpenAI API 密钥（后续可以放到环境变量里，先临时写在这里）
const OPENAI_API_KEY = "你的 OpenAI API 密钥"; // 替换成你自己的 key

export async function POST(req: NextRequest) {
  try {
    // 接收前端传过来的文本/URL
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json(
        { error: "请输入需要摘要的文本或URL" },
        { status: 400 }
      );
    }

    // 调用 OpenAI API 生成摘要
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `请总结以下内容，要求简洁明了，控制在200字以内：\n${content}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "AI 接口调用失败" },
        { status: res.status }
      );
    }

    // 返回摘要结果
    const summary = data.choices[0].message.content;
    return NextResponse.json({ summary });

  } catch (err) {
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}