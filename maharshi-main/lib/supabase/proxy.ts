import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return response
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth/')
  if (!user && !isAuthRoute) {
    const target = request.nextUrl.clone()
    target.pathname = '/login'
    target.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(target)
  }
  if (user && request.nextUrl.pathname === '/login') {
    const target = request.nextUrl.clone()
    target.pathname = '/dashboard'
    target.search = ''
    return NextResponse.redirect(target)
  }
  return response
}
