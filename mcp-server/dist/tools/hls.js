import { z } from 'zod';
import { callOrFail } from './util.js';
const paginationSchema = {
    page: z.number().int().min(1).optional(),
    itemsPerPage: z.number().int().min(1).max(1000).optional(),
};
export function registerHlsTools(server, api) {
    server.registerTool('mediamtx_hls_muxers_list', {
        title: 'List HLS muxers',
        description: 'List active HLS muxers and their request stats.',
        annotations: { readOnlyHint: true },
        inputSchema: paginationSchema,
    }, async ({ page, itemsPerPage }) => callOrFail(api.v3.hlsMuxersList({ page, itemsPerPage })));
    server.registerTool('mediamtx_hls_muxers_get', {
        title: 'Get HLS muxer',
        description: 'Return detail for a single HLS muxer.',
        annotations: { readOnlyHint: true },
        inputSchema: { name: z.string() },
    }, async ({ name }) => callOrFail(api.v3.hlsMuxersGet(name)));
}
//# sourceMappingURL=hls.js.map