import {
  LayoutDashboard, CheckSquare, Award, Calendar, Wallet, User,
  Sparkles, Bell, LogOut, ChevronRight, Users, Medal, Settings,
  Loader2, AlertCircle, Check, Save, Search, Plus, Pencil, Trash2,
  X, ChevronDown, TrendingUp, Clock, Star, ShieldCheck, FileText,
  BarChart3, Vote, CreditCard, UserCircle, type LucideIcon
} from 'lucide-react'

export type IconName =
  | 'LayoutDashboard' | 'CheckSquare' | 'Award' | 'Calendar' | 'Wallet'
  | 'User' | 'Sparkles' | 'Bell' | 'LogOut' | 'ChevronRight' | 'Users'
  | 'Medal' | 'Settings' | 'Loader2' | 'AlertCircle' | 'Check' | 'Save'
  | 'Search' | 'Plus' | 'Pencil' | 'Trash2' | 'X' | 'ChevronDown'
  | 'TrendingUp' | 'Clock' | 'Star' | 'ShieldCheck' | 'FileText'
  | 'BarChart3' | 'Vote' | 'CreditCard' | 'UserCircle'

const iconMap: Record<IconName, LucideIcon> = {
  LayoutDashboard, CheckSquare, Award, Calendar, Wallet, User,
  Sparkles, Bell, LogOut, ChevronRight, Users, Medal, Settings,
  Loader2, AlertCircle, Check, Save, Search, Plus, Pencil, Trash2,
  X, ChevronDown, TrendingUp, Clock, Star, ShieldCheck, FileText,
  BarChart3, Vote, CreditCard, UserCircle,
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
  color?: string
  strokeWidth?: number
}

export function Icon({ name, size = 18, className = '', color = 'currentColor', strokeWidth = 1.75 }: IconProps) {
  const LucideIcon = iconMap[name]
  if (!LucideIcon) return null
  return <LucideIcon size={size} className={className} color={color} strokeWidth={strokeWidth} />
}
