import React from 'react';
import { User, Stackable, StackablePropsData } from '../layouts';
import AddRecordDialog from '../ui/AddRecordDialog';
import { trackEvent } from '../Tracking';
import * as Mutations from '../Mutations';
import { RouteComponentProps, RouteHandler } from 'nuri/app';
import { RecordDTO, UserDTO } from '../types_generated';

type AddRecordRouteData = StackablePropsData & {
  currentUser: UserDTO;
  user: UserDTO;
  title?: string;
  referrer: string;
};

class AddRecord extends React.Component<RouteComponentProps<AddRecordRouteData>> {
  render() {
    return (
      <AddRecordDialog
        initialTitle={this.props.data.title}
        onCancel={this._returnToUser}
        onCreate={this._onCreate}
      />
    );
  }

  _onCreate = (result: { record: RecordDTO }) => {
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
    this.props.controller!.load({ path: basePath, query: {} }, { stacked: false, returnToParent: true });
  };
}

const routeHandler: RouteHandler<AddRecordRouteData> = {
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
export default routeHandler;
