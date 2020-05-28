import React from 'react';
import { User, Stackable } from '../layouts';
import AddRecordDialog from '../ui/AddRecordDialog';
import { trackEvent } from '../Tracking';
import * as Mutations from '../Mutations';

class AddRecord extends React.Component {
  render() {
    return (
      <AddRecordDialog
        initialTitle={this.props.data.title}
        onCancel={this._returnToUser}
        onCreate={this._onCreate}
      />
    );
  }

  _onCreate = (result) => {
    trackEvent({
      eventCategory: 'Record',
      eventAction: 'Create',
      eventLabel: this.props.data.referrer,
    });
    Mutations.records.next(result.record);
    this._returnToUser();
  };

  _returnToUser = () => {
    const basePath = `/users/${encodeURIComponent(this.props.data.user.name)}/`;
    this.props.controller.load({ path: basePath, query: {} }, { returnToParent: true });
  };
}

export default {
  component: Stackable(User, AddRecord),

  async load({ loader, params, query, stacked }) {
    const currentUser = await loader.getCurrentUser({
      options: {
        stats: true,
      },
    });
    // TODO: login check
    return {
      currentUser,
      user: currentUser, // for layout
      stacked, // for layout
      title: params.title,
      referrer: query.ref || 'AddRecord',
    };
  },

  renderTitle({ currentUser }) {
    return `${currentUser.name} 사용자`;
  },
};
