import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const styles = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-primary text-primary-foreground',
}

export function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const Icon = icons[type]

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-xl transition-all duration-300 lg:bottom-6',
        styles[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-white/70 hover:bg-white/20 hover:text-white"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
