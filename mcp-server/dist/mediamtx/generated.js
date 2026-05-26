/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */
export var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["FormData"] = "multipart/form-data";
    ContentType["UrlEncoded"] = "application/x-www-form-urlencoded";
    ContentType["Text"] = "text/plain";
})(ContentType || (ContentType = {}));
export class HttpClient {
    baseUrl = "http://localhost:9997";
    securityData = null;
    securityWorker;
    abortControllers = new Map();
    customFetch = (...fetchParams) => fetch(...fetchParams);
    baseApiParams = {
        credentials: "same-origin",
        headers: {},
        redirect: "follow",
        referrerPolicy: "no-referrer",
    };
    constructor(apiConfig = {}) {
        Object.assign(this, apiConfig);
    }
    setSecurityData = (data) => {
        this.securityData = data;
    };
    encodeQueryParam(key, value) {
        const encodedKey = encodeURIComponent(key);
        return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
    }
    addQueryParam(query, key) {
        return this.encodeQueryParam(key, query[key]);
    }
    addArrayQueryParam(query, key) {
        const value = query[key];
        return value.map((v) => this.encodeQueryParam(key, v)).join("&");
    }
    toQueryString(rawQuery) {
        const query = rawQuery || {};
        const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
        return keys
            .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
            .join("&");
    }
    addQueryParams(rawQuery) {
        const queryString = this.toQueryString(rawQuery);
        return queryString ? `?${queryString}` : "";
    }
    contentFormatters = {
        [ContentType.Json]: (input) => input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
        [ContentType.Text]: (input) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
        [ContentType.FormData]: (input) => Object.keys(input || {}).reduce((formData, key) => {
            const property = input[key];
            formData.append(key, property instanceof Blob
                ? property
                : typeof property === "object" && property !== null
                    ? JSON.stringify(property)
                    : `${property}`);
            return formData;
        }, new FormData()),
        [ContentType.UrlEncoded]: (input) => this.toQueryString(input),
    };
    mergeRequestParams(params1, params2) {
        return {
            ...this.baseApiParams,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...(this.baseApiParams.headers || {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        };
    }
    createAbortSignal = (cancelToken) => {
        if (this.abortControllers.has(cancelToken)) {
            const abortController = this.abortControllers.get(cancelToken);
            if (abortController) {
                return abortController.signal;
            }
            return void 0;
        }
        const abortController = new AbortController();
        this.abortControllers.set(cancelToken, abortController);
        return abortController.signal;
    };
    abortRequest = (cancelToken) => {
        const abortController = this.abortControllers.get(cancelToken);
        if (abortController) {
            abortController.abort();
            this.abortControllers.delete(cancelToken);
        }
    };
    request = async ({ body, secure, path, type, query, format, baseUrl, cancelToken, ...params }) => {
        const secureParams = ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
            this.securityWorker &&
            (await this.securityWorker(this.securityData))) ||
            {};
        const requestParams = this.mergeRequestParams(params, secureParams);
        const queryString = query && this.toQueryString(query);
        const payloadFormatter = this.contentFormatters[type || ContentType.Json];
        const responseFormat = format || requestParams.format;
        return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
            ...requestParams,
            headers: {
                ...(requestParams.headers || {}),
                ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
            },
            signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
            body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
        }).then(async (response) => {
            const r = response;
            r.data = null;
            r.error = null;
            const data = !responseFormat
                ? r
                : await response[responseFormat]()
                    .then((data) => {
                    if (r.ok) {
                        r.data = data;
                    }
                    else {
                        r.error = data;
                    }
                    return r;
                })
                    .catch((e) => {
                    r.error = e;
                    return r;
                });
            if (cancelToken) {
                this.abortControllers.delete(cancelToken);
            }
            if (!response.ok)
                throw data;
            return data;
        });
    };
}
/**
 * @title MediaMTX API
 * @version 1.0.0
 * @license MIT (https://opensource.org/licenses/MIT)
 * @baseUrl http://localhost:9997
 *
 * API of MediaMTX, a server and proxy that supports various protocols.
 */
export class Api extends HttpClient {
    v3 = {
        /**
         * No description
         *
         * @name ConfigGlobalGet
         * @summary returns the global configuration.
         * @request GET:/v3/config/global/get
         */
        configGlobalGet: (params = {}) => this.request({
            path: `/v3/config/global/get`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * @description all fields are optional.
         *
         * @name ConfigGlobalSet
         * @summary patches the global configuration.
         * @request PATCH:/v3/config/global/patch
         */
        configGlobalSet: (data, params = {}) => this.request({
            path: `/v3/config/global/patch`,
            method: "PATCH",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @name ConfigPathDefaultsGet
         * @summary returns the default path configuration.
         * @request GET:/v3/config/pathdefaults/get
         */
        configPathDefaultsGet: (params = {}) => this.request({
            path: `/v3/config/pathdefaults/get`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * @description all fields are optional.
         *
         * @name ConfigPathDefaultsPatch
         * @summary patches the default path configuration.
         * @request PATCH:/v3/config/pathdefaults/patch
         */
        configPathDefaultsPatch: (data, params = {}) => this.request({
            path: `/v3/config/pathdefaults/patch`,
            method: "PATCH",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @name ConfigPathsList
         * @summary returns all path configurations.
         * @request GET:/v3/config/paths/list
         */
        configPathsList: (query, params = {}) => this.request({
            path: `/v3/config/paths/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name ConfigPathsGet
         * @summary returns a path configuration.
         * @request GET:/v3/config/paths/get/{name}
         */
        configPathsGet: (name, params = {}) => this.request({
            path: `/v3/config/paths/get/${name}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * @description all fields are optional.
         *
         * @name ConfigPathsAdd
         * @summary adds a path configuration.
         * @request POST:/v3/config/paths/add/{name}
         */
        configPathsAdd: (name, data, params = {}) => this.request({
            path: `/v3/config/paths/add/${name}`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * @description all fields are optional.
         *
         * @name ConfigPathsPatch
         * @summary patches a path configuration.
         * @request PATCH:/v3/config/paths/patch/{name}
         */
        configPathsPatch: (name, data, params = {}) => this.request({
            path: `/v3/config/paths/patch/${name}`,
            method: "PATCH",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * @description all fields are optional.
         *
         * @name ConfigPathsReplace
         * @summary replaces all values of a path configuration.
         * @request POST:/v3/config/paths/replace/{name}
         */
        configPathsReplace: (name, data, params = {}) => this.request({
            path: `/v3/config/paths/replace/${name}`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @name ConfigPathsDelete
         * @summary removes a path configuration.
         * @request DELETE:/v3/config/paths/delete/{name}
         */
        configPathsDelete: (name, params = {}) => this.request({
            path: `/v3/config/paths/delete/${name}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @name HlsMuxersList
         * @summary returns all HLS muxers.
         * @request GET:/v3/hlsmuxers/list
         */
        hlsMuxersList: (query, params = {}) => this.request({
            path: `/v3/hlsmuxers/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name HlsMuxersGet
         * @summary returns a HLS muxer.
         * @request GET:/v3/hlsmuxers/get/{name}
         */
        hlsMuxersGet: (name, params = {}) => this.request({
            path: `/v3/hlsmuxers/get/${name}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name PathsList
         * @summary returns all paths.
         * @request GET:/v3/paths/list
         */
        pathsList: (query, params = {}) => this.request({
            path: `/v3/paths/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name PathsGet
         * @summary returns a path.
         * @request GET:/v3/paths/get/{name}
         */
        pathsGet: (name, params = {}) => this.request({
            path: `/v3/paths/get/${name}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspConnsList
         * @summary returns all RTSP connections.
         * @request GET:/v3/rtspconns/list
         */
        rtspConnsList: (query, params = {}) => this.request({
            path: `/v3/rtspconns/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspConnsGet
         * @summary returns a RTSP connection.
         * @request GET:/v3/rtspconns/get/{id}
         */
        rtspConnsGet: (id, params = {}) => this.request({
            path: `/v3/rtspconns/get/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspSessionsList
         * @summary returns all RTSP sessions.
         * @request GET:/v3/rtspsessions/list
         */
        rtspSessionsList: (query, params = {}) => this.request({
            path: `/v3/rtspsessions/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspSessionsGet
         * @summary returns a RTSP session.
         * @request GET:/v3/rtspsessions/get/{id}
         */
        rtspSessionsGet: (id, params = {}) => this.request({
            path: `/v3/rtspsessions/get/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspSessionsKick
         * @summary kicks out a RTSP session from the server.
         * @request POST:/v3/rtspsessions/kick/{id}
         */
        rtspSessionsKick: (id, params = {}) => this.request({
            path: `/v3/rtspsessions/kick/${id}`,
            method: "POST",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspsConnsList
         * @summary returns all RTSPS connections.
         * @request GET:/v3/rtspsconns/list
         */
        rtspsConnsList: (query, params = {}) => this.request({
            path: `/v3/rtspsconns/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspsConnsGet
         * @summary returns a RTSPS connection.
         * @request GET:/v3/rtspsconns/get/{id}
         */
        rtspsConnsGet: (id, params = {}) => this.request({
            path: `/v3/rtspsconns/get/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspsSessionsList
         * @summary returns all RTSPS sessions.
         * @request GET:/v3/rtspssessions/list
         */
        rtspsSessionsList: (query, params = {}) => this.request({
            path: `/v3/rtspssessions/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspsSessionsGet
         * @summary returns a RTSPS session.
         * @request GET:/v3/rtspssessions/get/{id}
         */
        rtspsSessionsGet: (id, params = {}) => this.request({
            path: `/v3/rtspssessions/get/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtspsSessionsKick
         * @summary kicks out a RTSPS session from the server.
         * @request POST:/v3/rtspssessions/kick/{id}
         */
        rtspsSessionsKick: (id, params = {}) => this.request({
            path: `/v3/rtspssessions/kick/${id}`,
            method: "POST",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtmpConnsList
         * @summary returns all RTMP connections.
         * @request GET:/v3/rtmpconns/list
         */
        rtmpConnsList: (query, params = {}) => this.request({
            path: `/v3/rtmpconns/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtmpConnectionsGet
         * @summary returns a RTMP connection.
         * @request GET:/v3/rtmpconns/get/{id}
         */
        rtmpConnectionsGet: (id, params = {}) => this.request({
            path: `/v3/rtmpconns/get/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtmpConnsKick
         * @summary kicks out a RTMP connection from the server.
         * @request POST:/v3/rtmpconns/kick/{id}
         */
        rtmpConnsKick: (id, params = {}) => this.request({
            path: `/v3/rtmpconns/kick/${id}`,
            method: "POST",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtmpsConnsList
         * @summary returns all RTMPS connections.
         * @request GET:/v3/rtmpsconns/list
         */
        rtmpsConnsList: (query, params = {}) => this.request({
            path: `/v3/rtmpsconns/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtmpsConnectionsGet
         * @summary returns a RTMPS connection.
         * @request GET:/v3/rtmpsconns/get/{id}
         */
        rtmpsConnectionsGet: (id, params = {}) => this.request({
            path: `/v3/rtmpsconns/get/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name RtmpsConnsKick
         * @summary kicks out a RTMPS connection from the server.
         * @request POST:/v3/rtmpsconns/kick/{id}
         */
        rtmpsConnsKick: (id, params = {}) => this.request({
            path: `/v3/rtmpsconns/kick/${id}`,
            method: "POST",
            ...params,
        }),
        /**
         * No description
         *
         * @name SrtConnsList
         * @summary returns all SRT connections.
         * @request GET:/v3/srtconns/list
         */
        srtConnsList: (query, params = {}) => this.request({
            path: `/v3/srtconns/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name SrtConnsGet
         * @summary returns a SRT connection.
         * @request GET:/v3/srtconns/get/{id}
         */
        srtConnsGet: (id, params = {}) => this.request({
            path: `/v3/srtconns/get/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name SrtConnsKick
         * @summary kicks out a SRT connection from the server.
         * @request POST:/v3/srtconns/kick/{id}
         */
        srtConnsKick: (id, params = {}) => this.request({
            path: `/v3/srtconns/kick/${id}`,
            method: "POST",
            ...params,
        }),
        /**
         * No description
         *
         * @name WebrtcSessionsList
         * @summary returns all WebRTC sessions.
         * @request GET:/v3/webrtcsessions/list
         */
        webrtcSessionsList: (query, params = {}) => this.request({
            path: `/v3/webrtcsessions/list`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name WebrtcSessionsGet
         * @summary returns a WebRTC session.
         * @request GET:/v3/webrtcsessions/get/{id}
         */
        webrtcSessionsGet: (id, params = {}) => this.request({
            path: `/v3/webrtcsessions/get/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @name WebrtcSessionsKick
         * @summary kicks out a WebRTC session from the server.
         * @request POST:/v3/webrtcsessions/kick/{id}
         */
        webrtcSessionsKick: (id, params = {}) => this.request({
            path: `/v3/webrtcsessions/kick/${id}`,
            method: "POST",
            ...params,
        }),
    };
}
//# sourceMappingURL=generated.js.map