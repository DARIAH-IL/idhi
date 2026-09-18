import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { ErrorCode } from '@/api/models'
import { getApiErrorMessage, getApiErrorResponse } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth'

const client = axios.create({
  baseURL: import.meta.env['VITE_SERVER_URL'] ?? 'http://localhost:8787',
})

const AUTH_FLOW_URL_PREFIX = '/api/v1/auth/'

const ERROR_LOG_WINDOW_MS = 5000
const ERROR_LOG_MAX_KEYS = 100
const lastLoggedErrors = new Map<string, number>()

function isAuthFlowRequest(url: string | undefined): boolean {
  return !!url && url.startsWith(AUTH_FLOW_URL_PREFIX)
}

function shouldLogError(errorKey: string): boolean {
  const now = Date.now()
  const lastLoggedAt = lastLoggedErrors.get(errorKey)
  if (lastLoggedAt !== undefined && now - lastLoggedAt < ERROR_LOG_WINDOW_MS) {
    return false
  }

  if (lastLoggedErrors.size >= ERROR_LOG_MAX_KEYS) {
    for (const [staleKey, loggedAt] of lastLoggedErrors) {
      if (now - loggedAt >= ERROR_LOG_WINDOW_MS) {
        lastLoggedErrors.delete(staleKey)
      }
    }
  }

  lastLoggedErrors.set(errorKey, now)
  return true
}

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.setAuthorization(`Bearer ${token}`)
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (axios.isCancel(err)) {
      return Promise.reject(err)
    }

    const apiError = getApiErrorResponse(err)
    const errorKey = `api-error:${err.config?.method}:${err.config?.url}:${apiError?.errorCode ?? err.code}`

    // API failures are intentionally surfaced in developer tools as well as UI.
    if (shouldLogError(errorKey)) {
      // eslint-disable-next-line no-console
      console.error(
        'API request failed',
        {
          method: err.config?.method?.toUpperCase(),
          url: err.config?.url,
          status: err.response?.status,
          errorCode: apiError?.errorCode,
          message: apiError?.message ?? err.message,
        },
        err,
      )
    }

    if (!isAuthFlowRequest(err.config?.url)) {
      toast.error(getApiErrorMessage(err), { id: errorKey })
    }

    if (apiError?.errorCode === ErrorCode.Unauthorized) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(err)
  },
)

export const customInstance = async <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await client({ ...config })
  return data
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData
