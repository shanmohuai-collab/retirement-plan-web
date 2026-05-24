'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  PenLine,
  TrendingUp,
  BotMessageSquare,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const navItems = [
  { href: '/weight', label: '体重板块', icon: Activity },
  { href: '/writing', label: '网文板块', icon: PenLine },
  { href: '/investment', label: '投资板块', icon: TrendingUp },
  { href: '/ai', label: 'AI 助理', icon: BotMessageSquare },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // 关闭移动端抽屉
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('已退出登录')
      window.location.href = '/login'
    } catch {
      toast.error('退出失败')
    }
  }

  const isActive = (href: string) => {
    if (href === '/weight') return pathname === '/' || pathname === '/weight'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* 移动端顶部栏 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">退</span>
          </div>
          <span className="font-semibold text-gray-900">退休计划</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-14 left-0 w-64 h-[calc(100vh-3.5rem)] bg-white shadow-xl p-4 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <nav className="space-y-1 flex-1">
              {navItems.map(item => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      )}

      {/* 桌面端侧边栏 */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-60 lg:bg-white lg:border-r lg:border-gray-100 lg:shadow-sm">
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
              <span className="text-white text-lg font-bold">退</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">退休计划</h2>
              <p className="text-xs text-gray-400">AI 助理 · 数据追踪</p>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* 退出按钮 */}
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            退出登录
          </Button>
        </div>
      </div>
    </>
  )
}
