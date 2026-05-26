export function jsonResult(data) {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}
export function errorResult(message) {
    return {
        content: [{ type: 'text', text: `Error: ${message}` }],
        isError: true,
    };
}
export async function callOrFail(promise) {
    try {
        const resp = await promise;
        if (resp.status >= 400) {
            return errorResult(`HTTP ${resp.status}`);
        }
        return jsonResult(resp.data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return errorResult(message);
    }
}
export async function callVoidOrFail(promise, successMessage) {
    try {
        const resp = await promise;
        if (resp.status >= 400) {
            return errorResult(`HTTP ${resp.status}`);
        }
        return {
            content: [{ type: 'text', text: successMessage }],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return errorResult(message);
    }
}
//# sourceMappingURL=util.js.map