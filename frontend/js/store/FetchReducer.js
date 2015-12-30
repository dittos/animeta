// TODO: gc

export default function reducer(state = {}, action) {
    switch (action.type) {
    case 'fetch':
        return {
            ...state,
            isLoading: {
                ...state.isLoading,
                [action.cacheKey]: true
            }
        };
    case 'fetchSuccess':
        return {
            ...state,
            [action.cacheKey]: action.data
        };
    }
    return state;
}
