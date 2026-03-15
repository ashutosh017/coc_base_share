import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const next = searchParams.get('next') ?? '/'

  if (token && email) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )

    console.log("email: ", email, "\ntoken: ", token);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'magiclink',
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error("Verification error:", error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}