'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function FollowUpStatus({ observationId, status }: { observationId: string; status: string | null }) {
  const router = useRouter()
  const [current, setCurrent] = useState(status || 'pending')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function markCompleted() {
    setSaving(true)
    setError('')
    const { error } = await createClient().from('observations')
      .update({ follow_up_status: 'completed' }).eq('id', observationId)
    if (error) setError(error.message)
    else { setCurrent('completed'); router.refresh() }
    setSaving(false)
  }
  return <div className="flex flex-col items-start gap-2">
    <span className="text-sm font-medium">{current === 'completed' ? 'Follow-up marked completed' : 'Follow-up pending'}</span>
    {current !== 'completed' ? <Button type="button" size="sm" onClick={markCompleted} disabled={saving}>{saving ? 'Saving…' : 'Mark follow-up completed'}</Button> : null}
    {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
  </div>
}
