/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const statusBarMessages = {
  label: "Status history",
  tableCaption: "{label} data",
  period: "Period",
  status: "Status",
  details: "Details",
  legend: "Status legend",
  inspect: "{label}: inspect period",
  empty: "No status data",
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  maintenance: "Maintenance",
  unknown: "No data",
};

export type StatusBarMessages = typeof statusBarMessages;
