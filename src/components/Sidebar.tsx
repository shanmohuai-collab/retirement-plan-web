'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Weight,
  PenTool,
  TrendingUp,
  Bot,
  LogOut,
} from 'lucide-react'

const menuItems = [
  { href: '/weight', label: '体重板块', icon: Weight },
  { href: '/writing', label: '网文板块', icon: PenTool },
  { href: '/investment', label: '投资板块', icon: TrendingUp },
  { href: '/ai', label: 'AI 助理', icon: Bot },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">退休计划</h1>
        <p className="mt-1 text-sm text-gray-500">1000 天倒计时</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-8">
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </form>
      </div>
    </aside>
  )
}
