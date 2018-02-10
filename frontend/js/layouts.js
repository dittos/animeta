import React from 'react';
import GlobalHeader from './ui/GlobalHeader';
import UserLayout from './ui/UserLayout';

export function App(Component) {
    return (props) => <div>
        <GlobalHeader
            currentUser={props.data.currentUser}
            {...props.globalHeaderProps}
        />
        <Component {...props} />
    </div>;
}

export function User(Component) {
    return App((props) => {
        return <UserLayout {...props}>
            <Component {...props} />
        </UserLayout>;
    });
}
