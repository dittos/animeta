import React from 'react';
import GlobalHeader from './GlobalHeader';

export default function({ currentUser, children }) {
    return <div>
        <GlobalHeader
            currentUser={currentUser}
            useRouterLink={true}
        />
        {children}
    </div>;
}
