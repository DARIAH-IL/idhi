import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { ErrorCode } from '@/api/models'
import { getApiErrorMessage, getApiErrorResponse } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth'

const client = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] ?? 'http://localhost:8787',
})

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
    const apiError = getApiErrorResponse(err)

    // API failures are intentionally surfaced in developer tools as well as UI.
    // eslint-disable-next-line no-console
    console.error('API request failed', {
      method: err.config?.method?.toUpperCase(),
      url: err.config?.url,
      status: err.response?.status,
      errorCode: apiError?.errorCode,
      message: apiError?.message ?? err.message,
    })

    toast.error(getApiErrorMessage(err), {
      id: `api-error:${err.config?.method}:${err.config?.url}:${apiError?.errorCode ?? err.code}`,
    })

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
