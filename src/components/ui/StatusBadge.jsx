/**
 * StatusBadge — maps backend status strings to styled badges.
 */
const STATUS_MAP = {
  // Employee
  ACTIVE:       { label: 'Active',       cls: 'badge-success' },
  INACTIVE:     { label: 'Inactive',     cls: 'badge-neutral' },
  ON_LEAVE:     { label: 'On Leave',     cls: 'badge-warning' },
  TERMINATED:   { label: 'Terminated',   cls: 'badge-danger'  },

  // Leave
  PENDING:      { label: 'Pending',      cls: 'badge-warning' },
  APPROVED:     { label: 'Approved',     cls: 'badge-success' },
  REJECTED:     { label: 'Rejected',     cls: 'badge-danger'  },
  CANCELLED:    { label: 'Cancelled',    cls: 'badge-neutral' },

  // Attendance
  PRESENT:      { label: 'Present',      cls: 'badge-success' },
  ABSENT:       { label: 'Absent',       cls: 'badge-danger'  },
  HALF_DAY:     { label: 'Half Day',     cls: 'badge-warning' },
  LEAVE:        { label: 'Leave',        cls: 'badge-info'    },

  // Payroll
  DRAFT:        { label: 'Draft',        cls: 'badge-neutral' },
  PROCESSED:    { label: 'Processed',    cls: 'badge-info'    },
  PAID:         { label: 'Paid',         cls: 'badge-success' },

  // Performance
  SELF_REVIEW:  { label: 'Self Review',  cls: 'badge-warning' },
  MANAGER_REVIEW: { label: 'Manager Review', cls: 'badge-info' },
  COMPLETED:    { label: 'Completed',    cls: 'badge-success' },

  // Notifications
  LOW:          { label: 'Low',          cls: 'badge-neutral' },
  MEDIUM:       { label: 'Medium',       cls: 'badge-info'    },
  HIGH:         { label: 'High',         cls: 'badge-warning' },
  URGENT:       { label: 'Urgent',       cls: 'badge-danger'  },

  // Generic
  IN_PROGRESS:  { label: 'In Progress',  cls: 'badge-info'    },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, cls: 'badge-neutral' };
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
}
