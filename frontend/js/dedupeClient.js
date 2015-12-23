import RequestCache from './RequestCache';

export default function dedupeClient(client) {
    const ongoingRequests = new RequestCache();
    const cache = new RequestCache();
    const callWithCache = (f, path, params) => {
        const cachedResult = cache.getIfPresent(path, params);
        if (cachedResult) {
            return Promise.resolve(cachedResult);
        }
        var promise = ongoingRequests.getIfPresent(path, params);
        if (!promise) {
            promise = f().then(result => {
                ongoingRequests.remove(path, params);
                cache.put(path, params, result);
                return result;
            }, err => {
                ongoingRequests.remove(path, params);
                return Promise.reject(err);
            });
            ongoingRequests.put(path, params, promise);
        }
        return promise;
    };
    return {
        call(path, params) {
            return callWithCache(() => client.call(path, params), path, params);
        },

        getCurrentUser() {
            return callWithCache(() => client.getCurrentUser(), '__current_user__');
        }
    };
}
