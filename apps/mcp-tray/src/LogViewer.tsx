import { useEffect, useRef, useState } from 'react'

import { getLogs, onLogLine } from './ipc'

export function LogViewer() {
  const [lines, setLines] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getLogs(500).then(setLines)
    const off = onLogLine((line) => {
      setLines(prev => [...prev.slice(-499), line])
    })
    return off
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 600 }}>MCP server logs</h2>
        <button
          type="button"
          onClick={() => setLines([])}
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            border: '1px solid oklch(1 0 0 / 16%)',
            background: 'transparent',
            color: 'inherit',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px',
          background: 'oklch(0.18 0.012 250)',
          border: '1px solid oklch(1 0 0 / 8%)',
          borderRadius: '12px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '11px',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {lines.length === 0
          ? <p style={{ color: 'oklch(0.72 0.012 250)' }}>No log lines yet.</p>
          : lines.map((line, i) => <div key={i}>{line}</div>)}
      </div>
    </div>
  )
}
