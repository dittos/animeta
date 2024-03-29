import React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import Styles from './LibraryFilter.module.less';
import { LinkProps } from 'nuri/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { LibraryFilter_CategoryFragment, LibraryFilter_RecordFiltersFragment } from './__generated__/LibraryFilter.graphql';
import { StatusType } from '../__generated__/globalTypes';
import { NormalizedUserRouteQuery } from '../UserRouteUtils';

export function LibraryFilter({
  query,
  getLinkParams,
  filters,
  categoryList,
  canEdit,
}: {
  query: NormalizedUserRouteQuery;
  getLinkParams(params: Partial<NormalizedUserRouteQuery>): LinkProps;
  filters: LibraryFilter_RecordFiltersFragment;
  categoryList: LibraryFilter_CategoryFragment[];
  canEdit: boolean;
}) {
  const statusTypeStats = filters.statusType.items.reduce((acc, it) => { acc[it.key] = it.count; return acc }, {} as Record<string, number>)
  const categoryStats = filters.categoryId.items.reduce((acc, it) => { acc[it.key] = it.count; return acc }, {} as Record<string, number>)
  return (
    <div className={Styles.filter}>
      <div className={Styles.filterGroup}>
        <div className={Styles.filterGroupTitle}>상태</div>
        <div
          className={
            query.statusType == null
              ? Styles.filterGroupItemActive
              : Styles.filterGroupItem
          }
        >
          <Link {...getLinkParams({ statusType: null })}>
            전체 ({filters.statusType.allCount})
          </Link>
        </div>
        {[StatusType.Watching, StatusType.Finished, StatusType.Suspended, StatusType.Interested].map(
          statusType => (
            <div
              className={
                query.statusType === statusType
                  ? Styles.filterGroupItemActive
                  : Styles.filterGroupItem
              }
            >
              <Link
                {...getLinkParams({ statusType })}
              >
                {util.GQL_STATUS_TYPE_TEXT[statusType]} ({statusTypeStats[statusType] || 0})
              </Link>
            </div>
          )
        )}
      </div>
      <div className={Styles.filterGroup}>
        <div className={Styles.filterGroupTitle}>분류</div>
        <div
          className={
            query.categoryId == null
              ? Styles.filterGroupItemActive
              : Styles.filterGroupItem
          }
        >
          <Link {...getLinkParams({ categoryId: null })}>
            전체 ({filters.categoryId.allCount})
          </Link>
        </div>
        {[{ databaseId: '0', name: '지정 안함' }]
          .concat(categoryList)
          .map(category => (
            <div
              className={
                query.categoryId === category.databaseId
                  ? Styles.filterGroupItemActive
                  : Styles.filterGroupItem
              }
            >
              <Link
                {...getLinkParams({
                  categoryId: category.databaseId,
                })}
              >
                {category.name} ({categoryStats[category.databaseId] || 0})
              </Link>
            </div>
          ))}{' '}
        {canEdit && (
          <Link
            to="/records/category/"
            className={Styles.manageCategoryButton}
          >
            <FontAwesomeIcon icon={faCog} /> 분류 관리
          </Link>
        )}
      </div>
    </div>
  );
}
