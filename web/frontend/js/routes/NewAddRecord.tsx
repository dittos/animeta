import React, { useState } from 'react';
import { useObservable } from 'rxjs-hooks';
import { ApolloClient, ApolloProvider, gql, useLazyQuery, useQuery } from '@apollo/client';
import { User, Stackable, StackablePropsData } from '../layouts';
import AddRecordDialog from '../ui/AddRecordDialog';
import { trackEvent } from '../Tracking';
import * as Mutations from '../Mutations';
import { RouteComponentProps, RouteHandler } from '../routes';
import { RecordDTO, UserDTO } from '../../../shared/types_generated';
import { CenteredFullWidth } from '../ui/Layout';
import Styles from './NewAddRecord.module.less';
import { SearchResultItem } from '../../../shared/types';
import { of, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { chunk } from 'lodash';
import { CuratedListsQuery } from './__generated__/CuratedListsQuery';
import { CuratedListQuery, CuratedListQuery_curatedList_works_edges_node } from './__generated__/CuratedListQuery';
import { WorksSearchQuery, WorksSearchQuery_searchWorks_edges_node } from './__generated__/WorksSearchQuery';
import { SearchItemWorkFragment } from './__generated__/SearchItemWorkFragment';
import { StatusType } from '../../../__generated__/globalTypes';

type AddRecordRouteData = StackablePropsData & {
  currentUser: UserDTO;
  user: UserDTO;
};

function ImageLoader({ src }: { src: string }) {
  const [loading, setLoading] = useState(true);
  return <img key={src} src={src} onLoad={() => setLoading(false)} className={loading ? Styles.imageLoading : Styles.imageLoaded} />;
}

function Loading() {
  return <div className={Styles.spinnerContainer}>
    <i className="fa fa-spinner fa-spin fa-3x" aria-hidden="true" />
  </div>;
}

const SEARCH_ITEM_WORK_FRAGMENT = gql`
  fragment SearchItemWorkFragment on Work {
    id
    record {
      id
      statusType
    }
  }
`;

const WORKS_SEARCH_QUERY = gql`
  ${SEARCH_ITEM_WORK_FRAGMENT}
  query WorksSearchQuery($query: String!) {
    searchWorks(query: $query) {
      edges {
        recordCount
        node {
          ...SearchItemWorkFragment
          title
          imageUrl
        }
      }
    }
  }
`;

function GqlSearchResult({ query, onSelect }: {
  query: string;
  onSelect(item: WorksSearchQuery_searchWorks_edges_node): void;
}) {
  const [runQuery, { loading, error, data }] = useLazyQuery<WorksSearchQuery>(WORKS_SEARCH_QUERY)
  // const [loading, setLoading] = useState(false)
  const _result = useObservable<SearchResultItem[], [string]>(
    (_, input$) => {
      const query$ = input$.pipe(map(([query]) => query.trim()))
      return query$.pipe(
        // tap(() => setLoading(true)),
        switchMap(query => {
          if (query === '')
            return of([]);
          return timer(200 /*ms*/).pipe(tap(() => runQuery({ variables: { query } })), map(() => []))
        }),
        // tap(() => setLoading(false)),
      )
    },
    [],
    [query]
  )
  const result = data?.searchWorks?.edges ?? []
  const rowSize = 2

  return (
    <div className={query ? Styles.searchResult : ''}>
      {loading ? (
        <Loading />
      ) : result.length > 0 ? chunk(result, rowSize).map((row, j) => {
        const rowHasImage = row.some(it => it.node.imageUrl != null)
        const items = row.map(({ node, recordCount }) => (
          <div key={`item-${node.id}`} className={rowHasImage ? Styles.searchItem : Styles.searchItemCompact}>
            {node.imageUrl ? <div className={Styles.searchItemImage}><ImageLoader src={node.imageUrl} /></div> : null}
            <div className={Styles.searchItemText}>
              <div className={Styles.searchItemTitle}>{node.title}</div>
              <div className={Styles.searchItemMeta}>
                {recordCount}명 기록
              </div>
            </div>
            <div className={Styles.searchItemActions}>
              {node.record ? (
                <div className={Styles.searchItemMetaStatus}><i className="fa fa-check" />추가함</div>
              ) : (
                <div className={Styles.searchItemMetaStatusNotAdded} onClick={() => onSelect(node)}><i className="fa fa-plus" />추가</div>
              )}
            </div>
          </div>
        ))
        for (let i = 0; i < rowSize - row.length; i++) {
          items.push(<div key={`${j}-${i}`} className={Styles.searchItemFiller} />)
        }
        return <div key={j} className={Styles.searchResultRow}>
          {items}
        </div>
      }) : (
        query && (<div className={Styles.searchResultEmpty}>검색 결과가 없습니다.</div>)
      )}
    </div>
  )
}

const CURATED_LISTS_QUERY = gql`
  query CuratedListsQuery {
    curatedLists {
      id
      name
    }
  }
`;

function CuratedLists({ onSelect }: {
  onSelect(item: CuratedListQuery_curatedList_works_edges_node): void;
}) {
  const [selectedId, setSelectedId] = useState('');
  const result = useQuery<CuratedListsQuery>(CURATED_LISTS_QUERY, {
    onCompleted: data => setSelectedId(data.curatedLists?.[0]?.id ?? '')
  });
  if (result.loading) {
    return <Loading />
  }

  return (
    <div className={Styles.curated}>
      <div className={Styles.curatedTitle}>목록에서 찾기</div>

      {result.loading ? (
        <Loading />
      ) : (
        <div className={Styles.curatedListSelectors}>
          {result.data!.curatedLists!.map(it => (
            <a
              key={it!.id}
              href="#"
              className={it!.id === selectedId ? Styles.activeCuratedListSelector : Styles.curatedListSelector}
              onClick={event => { event.preventDefault(); setSelectedId(it!.id!) }}
            >
              {it!.name}
            </a>
          ))}
        </div>
      )}

      {selectedId && <CuratedList curatedListId={selectedId} onSelect={onSelect} />}
    </div>
  );
}

const CURATED_LIST_QUERY = gql`
  ${SEARCH_ITEM_WORK_FRAGMENT}
  query CuratedListQuery($id: ID) {
    curatedList(id: $id) {
      works {
        edges {
          node {
            ...SearchItemWorkFragment
            title
            imageUrl
            recordCount
          }
        }
      }
    }
  }
`;

function CuratedList({ curatedListId, onSelect }: {
  curatedListId: string;
  onSelect(item: CuratedListQuery_curatedList_works_edges_node): void;
}) {
  const result = useQuery<CuratedListQuery>(CURATED_LIST_QUERY, { variables: { id: curatedListId } });
  if (result.loading) {
    return <Loading />
  }
  const rowSize = 2
  return (
    <div className={Styles.searchResult}>
      {chunk(result.data?.curatedList?.works?.edges, rowSize).map((row, j) => {
        const items = row.map(edge => edge!.node!).map(item => (
          <div key={`item-${item.id}`} className={Styles.searchItem}>
            {item.imageUrl ? <div className={Styles.searchItemImage}><ImageLoader src={item.imageUrl} /></div> : null}
            <div className={Styles.searchItemText}>
              <div className={Styles.searchItemTitle}>{item.title}</div>
              <div className={Styles.searchItemMeta}>
                {item.recordCount}명 기록
              </div>
            </div>
            <div className={Styles.searchItemActions}>
              {item.record ? (
                <div className={Styles.searchItemMetaStatus}><i className="fa fa-check" />추가함</div>
              ) : (
                <div className={Styles.searchItemMetaStatusNotAdded} onClick={() => onSelect(item)}><i className="fa fa-plus" />추가</div>
              )}
            </div>
          </div>
        ))
        for (let i = 0; i < rowSize - row.length; i++) {
          items.push(<div key={`${j}-${i}`} className={Styles.searchItemFiller} />)
        }
        return <div key={j} className={Styles.searchResultRow}>
          {items}
        </div>
      })}
    </div>
  )
}

class AddRecord extends React.Component<RouteComponentProps<AddRecordRouteData>> {
  state: {
    query: string;
    selectedItem: SearchResultItem | null;
  } = {
    query: '',
    selectedItem: null,
  };

  render() {
    return (
      <CenteredFullWidth>
        <div className={Styles.header}>
          <span className={Styles.title}>작품 추가</span>
        </div>

        <div className={Styles.searchContainer}>
          <div className={Styles.curatedTitle}>제목으로 찾기</div>

          <div className={Styles.search}>
            <i className="fa fa-search" />
            <input
              autoFocus
              value={this.state.query}
              onChange={event => this.setState({ query: event.target.value })}
            />
          </div>

          {this.props.loader.apolloClient && (
            <ApolloProvider client={this.props.loader.apolloClient}>
              {this.state.query !== '' && <GqlSearchResult
                query={this.state.query}
                onSelect={item => this.setState({ selectedItem: item })}
              />}
            </ApolloProvider>
          )}
        </div>

        {this.props.loader.apolloClient && (
          <ApolloProvider client={this.props.loader.apolloClient}>
            <CuratedLists onSelect={item => this.setState({ selectedItem: item })} />
          </ApolloProvider>
        )}

        {this.state.selectedItem && (
          <AddRecordDialog
            initialTitle={this.state.selectedItem.title}
            initialStatusType="finished"
            onCancel={this._closeDialog}
            onCreate={this._onCreate}
          />
        )}
      </CenteredFullWidth>
    );
  }

  _closeDialog = () => this.setState({ selectedItem: null });

  _onCreate = (result: { record: RecordDTO }) => {
    trackEvent({
      eventCategory: 'Record',
      eventAction: 'Create',
      eventLabel: 'NewAdd',
    });
    Mutations.records.next(result.record);
    this._closeDialog();

    const apollo = this.props.loader.apolloClient as ApolloClient<any>;
    if (apollo) {
      apollo.writeFragment<SearchItemWorkFragment>({
        fragment: SEARCH_ITEM_WORK_FRAGMENT,
        data: {
          __typename: 'Work',
          id: `${result.record.work_id}`,
          record: {
            __typename: 'Record',
            id: `${result.record.id}`,
            statusType: result.record.status_type.toUpperCase() as StatusType,
          },
        }
      });
    }
  };
}

const routeHandler: RouteHandler<AddRecordRouteData> = {
  component: Stackable(User, AddRecord),

  async load({ loader, stacked }) {
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
    };
  },

  renderTitle() {
    return '작품 추가';
  },
};
export default routeHandler;
