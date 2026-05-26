import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

export function jsonResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  }
}

export function errorResult(message: string): CallToolResult {
  return {
    content: [{ type: 'text', text: `Error: ${message}` }],
    isError: true,
  }
}

export async function callOrFail<T>(
  promise: Promise<{ data: T, status: number }>,
): Promise<CallToolResult> {
  try {
    const resp = await promise
    if (resp.status >= 400) {
      return errorResult(`HTTP ${resp.status}`)
    }
    return jsonResult(resp.data)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return errorResult(message)
  }
}

export async function callVoidOrFail(
  promise: Promise<{ status: number }>,
  successMessage: string,
): Promise<CallToolResult> {
  try {
    const resp = await promise
    if (resp.status >= 400) {
      return errorResult(`HTTP ${resp.status}`)
    }
    return {
      content: [{ type: 'text', text: successMessage }],
    }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return errorResult(message)
  }
}
