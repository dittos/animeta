import React from 'react';

function isLeftClickEvent(event) {
    return event.button === 0;
}

function isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default function Link({ to, onClick, ...props }, { history }) {
    function handleClick(event) {
        var allowTransition = true;

        if (onClick) onClick(event);

        if (isModifiedEvent(event) || !isLeftClickEvent(event)) return;

        if (event.defaultPrevented === true) allowTransition = false;

        // If target prop is set (e.g. to "_blank") let browser handle link.
        if (props.target) {
            if (!allowTransition) event.preventDefault();

            return;
        }

        event.preventDefault();

        if (allowTransition) {
            history.push(to);
        }
    }

    return <a {...props} href={to} onClick={handleClick} />;
}

Link.contextTypes = {
    history: React.PropTypes.object.isRequired
};
