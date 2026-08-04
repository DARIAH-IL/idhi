import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'

const client = axios.create({ baseURL: 'TODO' })

client.interceptors.request.use((config) => {
  config.headers.setAuthorization(`Bearer TODO`)
  return config
})

export const customInstance = async <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await client({ ...config })
  return data
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData
