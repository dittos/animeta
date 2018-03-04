import React from 'react';
import GlobalHeader from './ui/GlobalHeader';
import UserLayout from './ui/UserLayout';

export function App(Component, globalHeaderProps) {
    return (props) => <div>
        <GlobalHeader
            currentUser={props.data.currentUser}
            {...globalHeaderProps}
        />
        <Component {...props} />
    </div>;
}

export function User(Component) {
    return (props) => <div>
        <GlobalHeader
            currentUser={props.data.currentUser}
            activeMenu={props.data.currentUser && props.data.currentUser.id === props.data.user.id ? 'user' : null}
        />
        <UserLayout {...props}>
            <Component {...props} />
        </UserLayout>
    </div>;
}
