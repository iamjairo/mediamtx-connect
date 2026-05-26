import { registerConfigTools } from './config.js';
import { registerHlsTools } from './hls.js';
import { registerPathTools } from './paths.js';
import { registerSessionTools } from './sessions.js';
export function registerAllTools({ server, api, allowKick }) {
    registerConfigTools(server, api, allowKick);
    registerPathTools(server, api, allowKick);
    registerHlsTools(server, api);
    registerSessionTools(server, api, allowKick);
}
//# sourceMappingURL=index.js.map