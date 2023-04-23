import React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import Styles from './LibraryFilter.module.less';
import { CategoryDTO, LegacyStatusType } from '../../../shared/types';
import { LinkProps } from 'nuri/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

type LibraryRouteQuery = {
  type?: string;
  category?: string;
  sort?: string;
};

export function LibraryFilter({
  statusTypeFilter,
  categoryFilter,
  getLinkParams,
  statusTypeStats,
  categoryStats,
  categoryList,
  canEdit,
}: {
  statusTypeFilter: string;
  categoryFilter: string;
  getLinkParams(params: Partial<LibraryRouteQuery>): LinkProps;
  statusTypeStats: {[key: string]: number} & {_all: number};
  categoryStats: {[key: string]: number} & {_all: number};
  categoryList: CategoryDTO[];
  canEdit: boolean;
}) {
  return (
    <div className={Styles.filter}>
      <div className={Styles.filterGroup}>
        <div className={Styles.filterGroupTitle}>상태</div>
        <div
          className={
            statusTypeFilter === ''
              ? Styles.filterGroupItemActive
              : Styles.filterGroupItem
          }
        >
          <Link {...getLinkParams({ type: '' })}>
            전체 ({statusTypeStats._all})
          </Link>
        </div>
        {['watching', 'finished', 'suspended', 'interested'].map(
          (statusType: LegacyStatusType) => (
            <div
              className={
                statusTypeFilter === statusType
                  ? Styles.filterGroupItemActive
                  : Styles.filterGroupItem
              }
            >
              <Link
                {...getLinkParams({
                  type: statusType,
                })}
              >
                {util.STATUS_TYPE_TEXT[statusType]} ({statusTypeStats[statusType] || 0})
              </Link>
            </div>
          )
        )}
      </div>
      <div className={Styles.filterGroup}>
        <div className={Styles.filterGroupTitle}>분류</div>
        <div
          className={
            categoryFilter === ''
              ? Styles.filterGroupItemActive
              : Styles.filterGroupItem
          }
        >
          <Link {...getLinkParams({ category: '' })}>
            전체 ({categoryStats._all})
          </Link>
        </div>
        {[{ id: 0, name: '지정 안함' }]
          .concat(categoryList)
          .map(category => (
            <div
              className={
                categoryFilter === String(category.id)
                  ? Styles.filterGroupItemActive
                  : Styles.filterGroupItem
              }
            >
              <Link
                {...getLinkParams({
                  category: String(category.id),
                })}
              >
                {category.name} ({categoryStats[category.id] || 0})
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
