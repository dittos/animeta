import React from 'react';
import GlobalHeader from './ui/GlobalHeader';

export function App(Component) {
    const Wrapped = (props) => <div>
        <GlobalHeader
            currentUser={props.currentUser}
            useRouterLink={true}
        />
        <Component {...props} />
    </div>;
    Wrapped.fetchData = Component.fetchData;
    return Wrapped;
}
