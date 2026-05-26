import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { z } from 'zod'

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'audit-paths',
    {
      title: 'Audit paths',
      description: 'Walk every configured path and runtime path, flag mismatches, unhealthy paths, and stale entries.',
      argsSchema: {},
    },
    () => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Use mediamtx_config_paths_list to enumerate every configured path, then mediamtx_paths_list to enumerate the runtime state. For each path, report:
- Is it configured?
- Is it currently ready (publishing)?
- If not ready, why? (use mediamtx_paths_get for detail)
- Are there active readers?

Flag anything anomalous: paths configured but never reached ready, paths ready but with no readers for an extended period, paths with a source that is no longer responding.`,
        },
      }],
    }),
  )

  server.registerPrompt(
    'kick-stale-sessions',
    {
      title: 'Kick stale sessions',
      description: 'Identify sessions older than a threshold and propose kicking them.',
      argsSchema: { hours: z.string().describe('Threshold in hours (e.g. "24").') },
    },
    ({ hours }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `List active sessions across all six protocols (RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC) using the mediamtx_*_list tools. For each session, compute age from the "created" timestamp. List sessions older than ${hours} hours with their ID, path, remote address, age, and protocol. Do NOT kick anything yet — present the list and let the user confirm which to kick. When confirmed, call the matching mediamtx_*_kick tool.`,
        },
      }],
    }),
  )

  server.registerPrompt(
    'summarize-stream-health',
    {
      title: 'Summarize stream health',
      description: 'One-paragraph status of the MediaMTX server: paths, sessions, muxers, throughput.',
      argsSchema: {},
    },
    () => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Aggregate mediamtx_paths_list, all six mediamtx_*_sessions_list / mediamtx_*_conns_list, and mediamtx_hls_muxers_list into a one-paragraph status summary. Include: number of configured paths, number ready, number of active sessions per protocol, total bytes sent in the last reporting window, and any obvious issues.`,
        },
      }],
    }),
  )

  server.registerPrompt(
    'new-path-from-rtsp',
    {
      title: 'New path from RTSP source',
      description: 'Walk the user through creating a path that proxies an external RTSP source.',
      argsSchema: {
        name: z.string().describe('Path name for the new stream.'),
        source: z.string().describe('External RTSP URL (e.g. rtsp://192.168.1.50:554/stream).'),
      },
    },
    ({ name, source }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Create a new MediaMTX path named "${name}" that proxies the external RTSP source "${source}". Use mediamtx_config_paths_add. Suggest sensible defaults: sourceOnDemand=true with a 10s start timeout and 10s close-after. After creation, call mediamtx_paths_get to verify the path is ready, and report the result.`,
        },
      }],
    }),
  )

  server.registerPrompt(
    'compare-config',
    {
      title: 'Compare config',
      description: 'Diff the current global config against a baseline YAML/JSON.',
      argsSchema: { baseline: z.string().describe('Baseline config as JSON or YAML text.') },
    },
    ({ baseline }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Fetch the current MediaMTX global config via mediamtx_config_global_get. Diff it against this baseline:

\`\`\`
${baseline}
\`\`\`

Report added, removed, and changed keys. Highlight changes that affect security (auth settings, encryption) or networking (addresses, ports).`,
        },
      }],
    }),
  )
}
