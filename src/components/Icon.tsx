import { 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  Calendar, 
  Wallet, 
  User, 
  Sparkles, 
  Bell, 
  LogOut, 
  ChevronRight,
  Users,
  Medal,
  FormInput,
  Settings,
  Loader2,
  Upload,
  Download,
  Info,
  type LucideIcon
} from 'lucide-react'

export type IconName = 
  | 'LayoutDashboard'
  | 'CheckSquare'
  | 'Award'
  | 'Calendar'
  | 'Wallet'
  | 'User'
  | 'Sparkles'
  | 'Bell'
  | 'LogOut'
  | 'ChevronRight'
  | 'Users'
  | 'Medal'
  | 'FormInput'
  | 'Settings'
  | 'Loader2'
  | 'Upload'
  | 'Download'
  | 'Info'

const iconMap: Record<IconName, LucideIcon> = {
  LayoutDashboard,
  CheckSquare,
  Award,
  Calendar,
  Wallet,
  User,
  Sparkles,
  Bell,
  LogOut,
  ChevronRight,
  Users,
  Medal,
  FormInput,
  Settings,
  Loader2,
  Upload,
  Download,
  Info,
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
  color?: string
  strokeWidth?: number
}

export function Icon({ name, size = 20, className = '', color = 'currentColor', strokeWidth = 1.5 }: IconProps) {
  const LucideIcon = iconMap[name]
  if (!LucideIcon) return null
  return <LucideIcon size={size} className={className} color={color} strokeWidth={strokeWidth} />
}