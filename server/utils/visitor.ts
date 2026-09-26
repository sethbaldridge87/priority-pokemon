import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'

const VISITOR_COOKIE = 'priority-pokemon-visitor'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

function isSecureRequest(event: H3Event): boolean {
  const forwardedProtocol = getHeader(event, 'x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()

  if (forwardedProtocol) {
    return forwardedProtocol.toLowerCase() === 'https'
  }

  return getRequestURL(event).protocol === 'https:'
}

export function getVisitorId(event: H3Event): string {
  const existingVisitorId = getCookie(event, VISITOR_COOKIE)

  if (existingVisitorId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existingVisitorId)) {
    return existingVisitorId
  }

  const visitorId = randomUUID()
  setCookie(event, VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: 'lax',
    secure: isSecureRequest(event),
    path: '/',
  })

  return visitorId
}
