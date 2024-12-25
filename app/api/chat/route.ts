import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-d2c4a5a7db57453ab6edeea342547d4d',
  baseURL: 'https://api.deepseek.com/v1'
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages } = body

    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages
    })

    return NextResponse.json(response.choices[0].message)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '服务器处理请求时出错' },
      { status: 500 }
    )
  }
} 