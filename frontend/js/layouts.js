import React from 'react';
import GlobalHeader from './ui/GlobalHeader';

export function App(Component) {
    return (props) => <div>
        <GlobalHeader
            currentUser={props.data.currentUser}
            useRouterLink={true}
        />
        <Component {...props} />
    </div>;
}
