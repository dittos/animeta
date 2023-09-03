import React, { useRef, useState } from "react";
import { CurrentUserLayout } from "../layouts/CurrentUserLayout";
import { RouteComponentProps } from "../routes";
import Styles from "./ManageRating.module.less";
import * as Grid from "../ui/Grid";
import { Rating } from "../ui/Rating";
import { chunk } from "lodash";
import { RatingSummary, UnratedRecord } from "../../../shared/client";
import { AutoLoadMore } from "../ui/LoadMore";
import { graphql } from "../API";
import { Link } from "nuri";
import useIntersectionObserver from "../ui/useIntersectionObserver";
import { ManageRatingRoute_UpdateRatingDocument } from "./__generated__/ManageRating.graphql";

type ClientUnratedRecord = UnratedRecord & {
  rating?: number;
};

type ManageRatingRouteData = {
  // currentUser: NonNullable<UserLayoutPropsData['currentUser']>;
  ratingSummaries: RatingSummary[];
  unratedRecordCount: number;
  unratedRecords: {
    data: ClientUnratedRecord[];
    nextCursor: string | null;
  };
};

const RatingEntry: React.FC<{
  record: ClientUnratedRecord;
  onRatingUpdate: (recordId: string, rating: number | null) => void;
}> = ({ record, onRatingUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);

  const updateRating = async (_: any, rating: number | null) => {
    setIsSaving(true);
    try {
      await graphql(ManageRatingRoute_UpdateRatingDocument, {
        input: {
          recordId: record.id,
          rating,
        }
      });
    } finally {
      setIsSaving(false);
    }
    onRatingUpdate(record.id, rating);
  };

  return (
    <div className={Styles.rateEntry}>
      <Link to={`/records/${record.id}/`} className={Styles.rateEntryTitle}>
        {record.title}
      </Link>
      <div className={Styles.rateEntryRating}>
        <Rating
          defaultValue={record.rating}
          onChange={updateRating}
          disabled={isSaving}
        />
      </div>
    </div>
  );
};

const ManageRating: React.FC<RouteComponentProps<ManageRatingRouteData>> = ({
  data,
  loader,
  writeData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const sentinelEl = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(sentinelEl, {
    threshold: [0],
    rootMargin: `-${48 + 16}px 0px 0px 0px`,
  });
  const isHeaderStuck = entry ? !entry.isIntersecting : false;

  const {
    ratingSummaries: rawRatingSummaries,
    unratedRecordCount,
    unratedRecords,
  } = data;

  const ratingSummaries: RatingSummary[] = [5, 4, 3, 2, 1, 0].map(
    (rating) =>
      rawRatingSummaries.filter((it) => Math.floor(it.rating) === rating)
        .reduce((acc, it) => ({
          rating,
          recordCount: acc.recordCount + it.recordCount,
        }), {
          rating,
          recordCount: 0,
        })
  );

  const ratedCount = ratingSummaries.reduce(
    (acc, it) => acc + it.recordCount,
    0
  );
  const totalCount = ratedCount + unratedRecordCount;

  const barMaxValue = ratingSummaries.reduce(
    (acc, it) => Math.max(acc, it.recordCount),
    0
  );

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const result = await loader.v5.call(
        "/api/v5/ManageRating/getUnratedRecords",
        { cursor: unratedRecords.nextCursor }
      );
      writeData((data) => {
        data.unratedRecords.data = data.unratedRecords.data.concat(result.data);
        data.unratedRecords.nextCursor = result.nextCursor;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRatingUpdate = async (recordId: string, rating: number | null) => {
    writeData((data) => {
      const record = data.unratedRecords.data.find((it) => it.id === recordId);
      if (record) {
        if (rating) {
          record.rating = rating;
        } else {
          delete record.rating;
        }
      }
    });

    const result = await loader.v5.call("/api/v5/ManageRating/", {});
    writeData((data) => {
      Object.assign(data, result);
    });
  };

  return (
    <Grid.Row>
      <div ref={sentinelEl} />
      <Grid.Column
        size={4}
        pull="right"
        className={isHeaderStuck ? Styles.stuckSidebar : Styles.sidebar}
      >
        <div className={Styles.progress}>
          <strong>{Math.floor((ratedCount / totalCount) * 100)}% 완료</strong> (
          {ratedCount}/{totalCount})
        </div>
        <table className={Styles.statsTable}>
          <tbody>
            {ratingSummaries.map((it) => (
              <tr key={`rating-${it.rating}`}>
                <th className={Styles.ratingCell}>
                  {it.rating === 5 ? '5점' : it.rating === 0 ? '0.5점' : `${it.rating}점대`}
                </th>
                <td>
                  <div className={Styles.bar}>
                    <div
                      className={Styles.barInner}
                      style={{
                        width: `${
                          barMaxValue > 0
                            ? (it.recordCount / barMaxValue) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </td>
                <td className={Styles.countCell}>{it.recordCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Grid.Column>
      <Grid.Column size={8} pull="left">
        {unratedRecords.data.length > 0 ? (
          <>
            <div className={Styles.title}>별점을 매겨보세요 🤩</div>
            <div className={Styles.help}>
              아직 별점이 없는 감상 완료 작품이 표시됩니다.
            </div>
          </>
        ) : (
          <div className={Styles.empty}>
            <h1>별점을 모두 매겼습니다 🤩</h1>
            <p>개별 작품 기록에서 언제든지 별점을 수정할 수 있습니다.</p>
          </div>
        )}

        {chunk(unratedRecords.data, 2).map((records, j) => (
          <div key={j} className={Styles.rateEntryRow}>
            {records.map((record) => (
              <RatingEntry
                key={`record-${record.id}`}
                record={record}
                onRatingUpdate={onRatingUpdate}
              />
            ))}
            {records.length === 1 && <div className={Styles.rateEntryFiller} />}
          </div>
        ))}

        {unratedRecords.nextCursor && (
          <div className={Styles.loadMore}>
            <AutoLoadMore isLoading={isLoading} onClick={loadMore} />
          </div>
        )}
      </Grid.Column>

      {/* this is required for position: sticky to work */}
      <div style={{ clear: "both" }} />
    </Grid.Row>
  );
};

const routeHandler = CurrentUserLayout.wrap({
  component: ManageRating,

  async load({ loader }) {
    const [data, unratedRecords] = await Promise.all([
      loader.v5.call("/api/v5/ManageRating/", {}),
      loader.v5.call("/api/v5/ManageRating/getUnratedRecords", {
        cursor: null,
      }),
    ]);
    return {
      ...data,
      unratedRecords,
    };
  },
});
export default routeHandler;
