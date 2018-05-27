import React from 'react';
import { User } from '../layouts';
import AddRecordDialog from '../ui/AddRecordDialog';
import { trackEvent } from '../Tracking';

class AddRecord extends React.Component {
  render() {
    return (
      <AddRecordDialog
        initialTitle={this.props.data.title}
        onCancel={this._returnToUser}
        onCreate={this._returnToUser}
      />
    );
  }

  _returnToUser = () => {
    const basePath = `/users/${encodeURIComponent(this.props.data.user.name)}/`;
    trackEvent({
      eventCategory: 'Record',
      eventAction: 'Create',
      eventLabel: 'AddRecord',
    });
    this.props.controller.load({ path: basePath, query: {} });
  };
}

export default {
  component: User(AddRecord),

  async load({ loader, params }) {
    const currentUser = await loader.getCurrentUser({
      options: {
        stats: true,
      },
    });
    return {
      currentUser,
      user: currentUser, // for layout
      title: params.title,
    };
  },

  renderTitle({ currentUser }) {
    return `${currentUser.name} 사용자`;
  },
};
