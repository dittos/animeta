import Batch from './batch';

export function createContext({ auth }) {
    var requestFetch = async function(path, options = {}) {
        const resp = await fetch('http://localhost:8000' + path, Object.assign(options, {
            headers: Object.assign({cookie: auth.cookie}, options.headers)
        }));
        if (resp.ok)
            return resp.json();
        return null;
    };
    var batch = new Batch(queries => requestFetch('/api/batch/', {
        method: 'POST',
        body: JSON.stringify(queries),
    }));
    return {
        fetch: requestFetch,
        call: batch.call.bind(batch),
    };
}

export function fetchNode(context, nodeID) {
    return context.call({
        type: 'node',
        id: nodeID
    });
}

export function lazyFieldResolver(node, args, context, info) {
    return context.call({
        type: 'field',
        id: node.id,
        args,
        field: info.fieldName,
    });
}

export function lazyRootResolver(node, args, context, info) {
    return context.call({
        type: 'root',
        args,
        field: info.fieldName,
    });
}
