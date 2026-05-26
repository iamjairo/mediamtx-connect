import { Api } from './generated.js';
export function createMediaMtxClient(config) {
    const headers = {};
    if (config.username) {
        const credentials = `${config.username}:${config.password ?? ''}`;
        headers.Authorization = `Basic ${Buffer.from(credentials).toString('base64')}`;
    }
    return new Api({
        baseUrl: config.mediaMtxUrl,
        baseApiParams: { headers },
    });
}
//# sourceMappingURL=client.js.map