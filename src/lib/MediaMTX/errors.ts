import type { Error as ApiError } from './generated'

export interface NormalizedApiError {
  message: string
  status?: number
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof Error) {
    const maybeResponse = error as Error & { status?: number, error?: ApiError }
    return {
      message: maybeResponse.error?.error ?? maybeResponse.message,
      status: maybeResponse.status,
    }
  }
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const apiError = error as ApiError
    return { message: apiError.error ?? 'Unknown error' }
  }
  return { message: 'Unknown error' }
}
