'use client'

import { useState } from 'react'
import { SendIcon } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const newMessage: Message = {
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 调用我们的 API 路由
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('API 请求失败')
      }

      const aiMessage = await response.json()
      const aiResponse: Message = {
        role: 'assistant',
        content: aiMessage.content
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('API 调用出错:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，服务出现了一些问题，请稍后再试。'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold text-gray-800">
              AI 助手
            </Link>
          </div>
        </div>
      </nav>

      {/* 聊天容器 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
          {/* 聊天消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p>开始与 AI 助手对话吧！</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'user' ? (
                      message.content
                    ) : (
                      <div className="markdown-body prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeSanitize]}
                          components={{
                            // 自定义代码块样式
                            code({ node, inline, className, children, ...props }) {
                              return (
                                <code
                                  className={`${className} ${
                                    inline ? 'bg-gray-200 px-1 py-0.5 rounded' : 
                                    'block bg-gray-800 text-gray-100 p-2 rounded-md overflow-x-auto'
                                  }`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              )
                            },
                            // 自定义链接样式
                            a({ node, children, ...props }) {
                              return (
                                <a
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              )
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入您的问题..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-16 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-gray-900 placeholder-gray-400
                  bg-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 
                  text-gray-500 hover:text-gray-700 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 