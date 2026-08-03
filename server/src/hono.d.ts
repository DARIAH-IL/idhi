import 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    requestId: string
    user: {
      id: string
    }
  }
}
