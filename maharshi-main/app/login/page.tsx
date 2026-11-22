'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Sprout, Mail, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [nextPath, setNextPath] = useState('/dashboard')
  useEffect(() => { const requested = new URLSearchParams(window.location.search).get('next'); if (requested?.startsWith('/')) setNextPath(requested) }, [])
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('')
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } })
    setBusy(false)
    if (result.error) return setMessage(result.error.message)
    if (mode === 'signup' && !result.data.session) setMessage('Check your email to confirm your account, then sign in.')
    else location.assign(nextPath)
  }

  async function google() {
    setBusy(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
    if (error) { setMessage(error.message); setBusy(false) }
  }

  return <div className="mx-auto flex min-h-[78vh] max-w-md items-center px-4 py-12">
    <section className="w-full rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
      <div className="mb-7 flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Sprout /></span><div><p className="font-serif text-2xl font-semibold">Welcome to Maharshi</p><p className="text-sm text-muted-foreground">Your crop health companion</p></div></div>
      <div className="mb-6 grid grid-cols-2 rounded-full bg-muted p-1"><button onClick={() => setMode('login')} className={`rounded-full py-2 text-sm font-medium ${mode === 'login' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Sign in</button><button onClick={() => setMode('signup')} className={`rounded-full py-2 text-sm font-medium ${mode === 'signup' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Create account</button></div>
      <form onSubmit={submit} className="flex flex-col gap-4"><label className="text-sm font-medium">Email address<div className="mt-1 flex h-12 items-center gap-2 rounded-xl border border-input px-3"><Mail className="size-4 text-muted-foreground"/><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="you@example.com"/></div></label><label className="text-sm font-medium">Password<div className="mt-1 flex h-12 items-center gap-2 rounded-xl border border-input px-3"><LockKeyhole className="size-4 text-muted-foreground"/><input required minLength={6} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="At least 6 characters"/></div></label><Button disabled={busy} className="h-12 rounded-full">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</Button></form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/>OR<span className="h-px flex-1 bg-border"/></div>
      <Button type="button" variant="outline" disabled={busy} onClick={google} className="h-12 w-full rounded-full">Continue with Google</Button>
      {message && <p role="status" className="mt-4 rounded-xl bg-muted p-3 text-sm">{message}</p>}
      <p className="mt-6 text-center text-xs text-muted-foreground">By continuing, you agree to use Maharshi as an informational crop-monitoring aid, not a substitute for expert diagnosis.</p>
      <p className="mt-4 text-center text-xs"><Link href="/" className="text-primary underline">Back to home</Link></p>
    </section>
  </div>
}
