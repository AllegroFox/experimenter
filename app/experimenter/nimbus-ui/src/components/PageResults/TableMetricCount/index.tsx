/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useContext } from "react";
import { ResultsContext } from "../../../lib/contexts";
import {
  COUNT_METRIC_COLUMNS,
  DISPLAY_TYPE,
  METRIC_TYPE,
  TABLE_LABEL,
} from "../../../lib/visualization/constants";
import { BranchComparisonValues } from "../../../lib/visualization/types";
import { getExtremeBounds } from "../../../lib/visualization/utils";
import GraphsWeekly from "../GraphsWeekly";
import TableVisualizationRow from "../TableVisualizationRow";
import MetricHeader from "./MetricHeader";

type CountMetricStatistic = {
  name: string;
  displayType: DISPLAY_TYPE;
  branchComparison: BranchComparisonValues;
  value?: string;
};

type MetricTypes =
  | typeof METRIC_TYPE.PRIMARY
  | typeof METRIC_TYPE.USER_SELECTED_SECONDARY
  | typeof METRIC_TYPE.DEFAULT_SECONDARY
  | typeof METRIC_TYPE.GUARDRAIL;

type TableMetricCountProps = {
  outcomeSlug: string;
  outcomeDefaultName: string;
  group: string;
  metricType?: MetricTypes;
  segment?: string;
};

const getStatistics = (slug: string): Array<CountMetricStatistic> => {
  // Make a copy of `COUNT_METRIC_COLUMNS` since we modify it.
  const countMetricStatisticsList = COUNT_METRIC_COLUMNS.map(
    (statistic: CountMetricStatistic) => {
      statistic["value"] = slug;
      return statistic;
    },
  );

  return countMetricStatisticsList;
};

const TableMetricCount = ({
  outcomeSlug,
  outcomeDefaultName,
  group,
  metricType = METRIC_TYPE.DEFAULT_SECONDARY,
  segment = "all",
}: TableMetricCountProps) => {
  const countMetricStatistics = getStatistics(outcomeSlug);
  const {
    analysis: { metadata, overall, weekly },
    sortedBranchNames,
    controlBranchName,
  } = useContext(ResultsContext);
  const overallResults = overall![segment]!;

  const bounds = getExtremeBounds(
    sortedBranchNames,
    overall!,
    outcomeSlug,
    group,
    segment,
  );
  const outcomeName =
    metadata?.metrics[outcomeSlug]?.friendly_name || outcomeDefaultName;

  return (
    <div data-testid="table-metric-secondary" className="mb-5">
      <MetricHeader
        outcomeSlug={outcomeSlug}
        outcomeDefaultName={outcomeDefaultName}
        metricType={metricType}
      />

      <table className="table-visualization-center border">
        <thead>
          <tr>
            <th scope="col" className="border-bottom-0 bg-light" />
            {COUNT_METRIC_COLUMNS.map((value) => (
              <th
                key={value.name}
                className="border-bottom-0 bg-light"
                scope="col"
              >
                <div>{value.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {group &&
            sortedBranchNames.map((branch) => {
              const isControlBranch = branch === controlBranchName;
              return (
                overallResults[branch].branch_data[group] && (
                  <tr key={`${branch}-${group}`}>
                    <th className="align-middle" scope="row">
                      {branch}
                    </th>
                    {countMetricStatistics.map(
                      ({ displayType, value, branchComparison }) => (
                        <TableVisualizationRow
                          key={`${displayType}-${value}`}
                          results={overallResults[branch]}
                          tableLabel={TABLE_LABEL.SECONDARY_METRICS}
                          metricKey={outcomeSlug}
                          {...{
                            displayType,
                            branchComparison,
                            bounds,
                            group,
                            isControlBranch,
                          }}
                        />
                      ),
                    )}
                  </tr>
                )
              );
            })}
        </tbody>
      </table>
      {weekly?.all && (
        <GraphsWeekly
          weeklyResults={weekly}
          {...{ outcomeSlug, outcomeName, group }}
        />
      )}
    </div>
  );
};

export default TableMetricCount;
