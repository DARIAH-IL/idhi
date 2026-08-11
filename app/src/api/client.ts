import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
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
    if (err.response?.status === 401) {
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
