'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleLogin = async () => {
    if (!password) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('🎉 欢迎回来！')
        router.push('/weight')
      } else {
        setShake(true)
        setTimeout(() => setShake(false), 500)
        toast.error('😅 密码错啦，再想想～')
      }
    } catch {
      toast.error('网络出错啦')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #f0e6ff 50%, #e6f7ff 100%)' }}>
      {/* 背景装饰圆 */}
      <div className="fixed top-10 left-10 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ff6b9d, transparent)' }} />
      <div className="fixed bottom-10 right-10 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #c44dff, transparent)' }} />
      <div className="fixed top-1/3 right-20 w-20 h-20 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #6ec6ff, transparent)' }} />

      <Card className={`w-full max-w-sm border-0 shadow-2xl ${shake ? 'animate-shake' : ''}`}
        style={{ borderRadius: '28px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}>
        <CardContent className="p-8">
          {/* 头像区 */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ff6b9d, #c44dff)', boxShadow: '0 8px 32px rgba(255,107,157,0.3)' }}>
              🏠
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#4a3548' }}>退休计划小助手</h1>
            <p className="text-sm mt-1" style={{ color: '#a890a0' }}>✨ 记录每一天的小进步 ✨</p>
          </div>

          {/* 输入框 */}
          <div className="relative mb-5">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10" style={{ color: '#ff6b9d' }} />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码 🔑"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="pl-12 pr-12 h-12 text-base border-2 focus:border-pink-300"
              style={{ borderRadius: '999px', borderColor: '#ffe0e8', background: '#fff5f7' }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-pink-50"
              style={{ color: '#ff6b9d' }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* 登录按钮 */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 text-base font-bold text-white border-0 shadow-lg hover:shadow-xl"
            style={{
              borderRadius: '999px',
              background: loading ? '#d4a0b0' : 'linear-gradient(135deg, #ff6b9d, #c44dff)',
              boxShadow: '0 6px 24px rgba(255,107,157,0.35)',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">登录中<Loader2 className="w-5 h-5 animate-spin" /></span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> 进入我的小天地</span>
            )}
          </Button>

          {/* 底部装饰 */}
          <div className="flex justify-center gap-1 mt-5">
            {['💖', '🌸', '🎀', '🌸', '💖'].map((e, i) => (
              <span key={i} className="text-xs opacity-60">{e}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* shake动画 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}
