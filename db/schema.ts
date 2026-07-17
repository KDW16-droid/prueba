import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const roleEnum = pgEnum("user_role", [
  "employee",
  "hr",
  "operations",
]);

export const workdayStatusEnum = pgEnum("workday_status", [
  "not_started",
  "working",
  "on_break",
  "provisional_exit",
  "reentry_authorized",
  "finished",
]);

export const timeEventTypeEnum = pgEnum("time_event_type", [
  "clock_in",
  "break_start",
  "break_end",
  "provisional_exit",
  "reentry",
  "clock_out",
]);

export const requestTypeEnum = pgEnum("approval_request_type", [
  "correction",
  "reentry",
  "overtime",
]);

export const requestStatusEnum = pgEnum("approval_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    legalName: varchar("legal_name", { length: 180 }).notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    timezone: varchar("timezone", { length: 80 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("companies_display_name_uq").on(table.displayName)],
);

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    name: varchar("name", { length: 120 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    timezone: varchar("timezone", { length: 80 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("locations_company_name_uq").on(table.companyId, table.name),
    index("locations_company_idx").on(table.companyId),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 254 }).notNull(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    employeeNumber: varchar("employee_number", { length: 60 }),
    passwordHash: text("password_hash").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_uq").on(table.email)],
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    role: roleEnum("role").notNull(),
    companyId: uuid("company_id").references(() => companies.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_roles_global_uq")
      .on(table.userId, table.role)
      .where(sql`${table.companyId} is null`),
    uniqueIndex("user_roles_company_uq")
      .on(table.userId, table.role, table.companyId)
      .where(sql`${table.companyId} is not null`),
    index("user_roles_user_idx").on(table.userId),
  ],
);

export const employeeAssignments = pgTable(
  "employee_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("employee_assignments_scope_uq").on(
      table.userId,
      table.companyId,
      table.locationId,
      table.startsOn,
    ),
    index("employee_assignments_user_idx").on(table.userId),
    index("employee_assignments_company_idx").on(table.companyId),
  ],
);

export const attendancePolicies = pgTable(
  "attendance_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    toleranceMinutes: integer("tolerance_minutes").default(15).notNull(),
    cityChangeCreatesAlert: boolean("city_change_creates_alert").default(true).notNull(),
    overtimeRequiresApproval: boolean("overtime_requires_approval").default(true).notNull(),
    timezone: varchar("timezone", { length: 80 }).notNull(),
    holidays: jsonb("holidays").$type<string[]>().default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("attendance_policies_scope_uq").on(
      table.companyId,
      table.countryCode,
      table.name,
    ),
  ],
);

export const schedules = pgTable(
  "schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => employeeAssignments.id),
    policyId: uuid("policy_id")
      .notNull()
      .references(() => attendancePolicies.id),
    weekday: integer("weekday").notNull(),
    startTime: time("start_time").notNull(),
    authorizedMinutes: integer("authorized_minutes").notNull(),
    validFrom: date("valid_from").notNull(),
    validUntil: date("valid_until"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("schedules_assignment_idx").on(table.assignmentId),
    index("schedules_policy_idx").on(table.policyId),
  ],
);

export const workdays = pgTable(
  "workdays",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => employeeAssignments.id),
    scheduleId: uuid("schedule_id").references(() => schedules.id),
    localDate: date("local_date").notNull(),
    status: workdayStatusEnum("status").default("not_started").notNull(),
    scheduledStartAt: timestamp("scheduled_start_at", { withTimezone: true }),
    authorizedMinutes: integer("authorized_minutes").notNull(),
    workedMinutes: integer("worked_minutes").default(0).notNull(),
    breakMinutes: integer("break_minutes").default(0).notNull(),
    overtimeMinutes: integer("overtime_minutes").default(0).notNull(),
    lateMinutes: integer("late_minutes").default(0).notNull(),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workdays_assignment_date_uq").on(table.assignmentId, table.localDate),
    index("workdays_user_date_idx").on(table.userId, table.localDate),
    index("workdays_status_idx").on(table.status),
  ],
);

export const timeEvents = pgTable(
  "time_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workdayId: uuid("workday_id")
      .notNull()
      .references(() => workdays.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: timeEventTypeEnum("type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ipAddress: varchar("ip_address", { length: 64 }).notNull(),
    ipCity: varchar("ip_city", { length: 120 }),
    ipCountryCode: varchar("ip_country_code", { length: 2 }),
    userAgent: text("user_agent"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("time_events_workday_at_idx").on(table.workdayId, table.occurredAt),
    index("time_events_user_at_idx").on(table.userId, table.occurredAt),
  ],
);

export const approvalRequests = pgTable(
  "approval_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id),
    workdayId: uuid("workday_id")
      .notNull()
      .references(() => workdays.id),
    type: requestTypeEnum("type").notNull(),
    status: requestStatusEnum("status").default("pending").notNull(),
    reason: text("reason").notNull(),
    originalData: jsonb("original_data").$type<Record<string, unknown>>().notNull(),
    requestedData: jsonb("requested_data").$type<Record<string, unknown>>().notNull(),
    resolvedById: uuid("resolved_by_id").references(() => users.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: text("resolution_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("approval_requests_status_idx").on(table.status, table.createdAt),
    index("approval_requests_workday_idx").on(table.workdayId),
  ],
);

export const approvalDecisions = pgTable(
  "approval_decisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => approvalRequests.id),
    decidedById: uuid("decided_by_id")
      .notNull()
      .references(() => users.id),
    decision: requestStatusEnum("decision").notNull(),
    note: text("note"),
    decidedAt: timestamp("decided_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("approval_decisions_request_idx").on(table.requestId)],
);

export const cityAlerts = pgTable(
  "city_alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workdayId: uuid("workday_id")
      .notNull()
      .references(() => workdays.id),
    timeEventId: uuid("time_event_id")
      .notNull()
      .references(() => timeEvents.id),
    previousCity: varchar("previous_city", { length: 120 }).notNull(),
    detectedCity: varchar("detected_city", { length: 120 }).notNull(),
    acknowledgedById: uuid("acknowledged_by_id").references(() => users.id),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("city_alerts_open_idx").on(table.acknowledgedAt, table.createdAt)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_uq").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
  ],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("password_reset_tokens_hash_uq").on(table.tokenHash)],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => users.id),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    before: jsonb("before").$type<Record<string, unknown>>(),
    after: jsonb("after").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_events_entity_idx").on(table.entityType, table.entityId, table.createdAt),
    index("audit_events_actor_idx").on(table.actorId, table.createdAt),
  ],
);
