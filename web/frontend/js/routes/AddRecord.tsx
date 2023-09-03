import React from 'react';
import { CurrentUserLayout } from '../layouts/CurrentUserLayout';
import AddRecordDialog from '../ui/AddRecordDialog';
import { trackEvent } from '../Tracking';
import * as Mutations from '../Mutations';
import { RouteComponentProps } from '../routes';
import { AddRecordRouteDocument, AddRecordRouteQuery, AddRecord_CreateRecordDocument, AddRecord_CreateRecordMutation } from './__generated__/AddRecord.graphql';

type AddRecordRouteData = AddRecordRouteQuery & {
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
      id: result.record.databaseId,
      userId: result.record.user!.databaseId,
      workId: result.record.work!.databaseId,
    });
    this._returnToUser();
  };

  _returnToUser = () => {
    const basePath = `/users/${encodeURIComponent(this.props.data.currentUser!.name!)}/`;
    this.props.controller!.load({ path: basePath, query: {} }, { stacked: false, returnToParent: true });
  };
}

const routeHandler = CurrentUserLayout.wrap({
  component: AddRecord,
  unwrapLayoutOnStacked: true,

  async load({ loader, params, query }) {
    const {currentUser, ...data} = await loader.graphql(AddRecordRouteDocument);
    // TODO: redirect to login page
    if (!currentUser) {
      throw new Error('Login required.');
    }
    return {
      ...data,
      currentUser,
      title: params.title,
      referrer: query.ref || 'AddRecord',
    };
  },
});
export default routeHandler;
