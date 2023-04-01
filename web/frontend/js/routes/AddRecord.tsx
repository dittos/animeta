import React from 'react';
import { User, Stackable, StackablePropsData } from '../layouts';
import AddRecordDialog from '../ui/AddRecordDialog';
import { trackEvent } from '../Tracking';
import * as Mutations from '../Mutations';
import { RouteComponentProps, RouteHandler } from '../routes';
import { RecordDTO, UserDTO } from '../../../shared/types_generated';
import { AddRecord_CreateRecordDocument, AddRecord_CreateRecordMutation } from './__generated__/AddRecord.graphql';

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
        createRecordMutation={AddRecord_CreateRecordDocument}
      />
    );
  }

  _onCreate = (result: AddRecord_CreateRecordMutation['createRecord']) => {
    trackEvent({
      eventCategory: 'Record',
      eventAction: 'Create',
      eventLabel: this.props.data.referrer,
    });
    Mutations.records.next({
      id: result.record.id,
      userId: result.record.user!.id,
      workId: result.record.work!.id,
    });
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
    // TODO: redirect to login page
    if (!currentUser) {
      throw new Error('Login required.');
    }
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
