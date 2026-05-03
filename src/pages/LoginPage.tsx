import { useState } from 'react'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

const isDevOrTest = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signUp } from '@/api/user'
import type { Page } from '@/types'

interface LoginPageProps {
  onNavigate: (page: Page) => void
}

type Mode = 'login' | 'signup'

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signUp(name, email, password)
        await login(email, password)
      }
      onNavigate('home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* 로고 */}
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">DROPZONE</h1>
          <p className="mt-1 text-sm text-muted-foreground">한정판 스니커즈 드랍 플랫폼</p>
        </div>

        {isDevOrTest && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span><strong>{import.meta.env.MODE}</strong> 환경 — 회원가입 시 어드민 계정으로 생성됩니다</span>
          </div>
        )}

        {/* 탭 */}
        <div className="flex rounded-xl bg-muted p-1">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === m ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />처리 중...</>
            ) : mode === 'login' ? '로그인' : '회원가입'}
          </Button>
        </form>
      </div>
    </div>
  )
}
