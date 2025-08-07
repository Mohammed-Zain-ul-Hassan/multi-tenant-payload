import type { Access, PayloadRequest } from 'payload'

export const isAdmin = (args: { req: PayloadRequest }): boolean => {
  const {
    req: { user },
  } = args
  return user?.roles?.includes('super-admin') || false
}
