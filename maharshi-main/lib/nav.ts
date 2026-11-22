import { History, Home, LayoutDashboard, ScanLine, Settings } from 'lucide-react'

export const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crop-info', label: 'New Analysis', icon: ScanLine },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
]
