'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Scale, BookOpen, Newspaper, Menu, X, Home, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const navItems = [
  { href: '/weight',   label: '体重板块', icon: Scale },
  { href: '/writing',  label: '网文板块', icon: BookOpen },
  { href: '/ai',       label: 'AI 前沿',  icon: Newspaper },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* 移动端顶部栏 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 shadow-sm"
        style={{ background: 'linear-gradient(90deg, #fff0f5, #f0e6ff)', borderBottom: '2px solid #ffe0e8' }}>
        <span className="font-bold text-lg" style={{ color: '#4a3548' }}>🏠 退休计划</span>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-full" style={{ color: '#ff6b9d' }}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-56 shadow-2xl transform transition-transform duration-300
        md:translate-x-0 md:z-30
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
        style={{
          background: 'linear-gradient(180deg, #fff5f7 0%, #f8f0ff 50%, #f0f5ff 100%)',
          borderRight: '2px solid #ffe0e8',
          borderTopRightRadius: '0',
          borderBottomRightRadius: '0',
        }}>
        {/* 顶部标题 */}
        <div className="flex items-center gap-2 px-5 py-5" style={{ borderBottom: '2px dashed #ffe0e8' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md"
            style={{ background: 'linear-gradient(135deg, #ff6b9d, #c44dff)', boxShadow: '0 4px 16px rgba(255,107,157,0.3)' }}>
            🏠
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight" style={{ color: '#4a3548' }}>退休计划</h2>
            <p className="text-xs" style={{ color: '#a890a0' }}>✨ 可爱版 ✨</p>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200
                  ${active ? 'shadow-md' : 'hover:bg-white/60'}
                `}
                style={{
                  borderRadius: '16px',
                  background: active
                    ? 'linear-gradient(135deg, #ff6b9d22, #c44dff22)'
                    : 'transparent',
                  color: active ? '#ff6b9d' : '#4a3548',
                  border: active ? '2px solid #ff6b9d44' : '2px solid transparent',
                }}>
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {active && <span className="ml-auto text-xs">🌸</span>}
              </Link>
            )
          })}
        </nav>

        {/* 底部 */}
        <div className="px-3 py-4" style={{ borderTop: '2px dashed #ffe0e8' }}>
          <Button variant="ghost" size="sm"
            onClick={() => {
              document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
              toast.success('👋 拜拜～')
              setTimeout(() => location.href = '/login', 800)
            }}
            className="w-full justify-start rounded-2xl hover:bg-pink-50"
            style={{ color: '#a890a0' }}>
            <LogOut className="w-4 h-4 mr-2" /> 退出登录
          </Button>
          <p className="text-center text-xs mt-3" style={{ color: '#d4b0c0' }}>Made with 💖</p>
        </div>
      </aside>

      {/* 主内容区留白 */}
      <div className="md:pl-56 pt-14 md:pt-0" />
    </>
  )
}
