const initialState = {
    isCurrentUserLoaded: false
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
    case 'loadedCurrentUser':
        return {
            ...state,
            isCurrentUserLoaded: true,
            currentUser: action.user
        };
    case 'loadedSidebarChart':
        return {
            ...state,
            sidebarChart: action.data
        };
    }
    return state;
}
