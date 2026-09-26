import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

const pk = () => uuid().primaryKey().defaultRandom();
const tz = () => timestamp({ withTimezone: true });
const ts = () => ({
  createdAt: tz().notNull().defaultNow(),
  updatedAt: tz()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const contentStatus = pgEnum("content_status", [
  "draft",
  "published",
  "unpublished",
]);
export const messageStatus = pgEnum("message_status", [
  "new",
  "read",
  "archived",
]);
export const mailStatus = pgEnum("mail_status", [
  "pending",
  "sent",
  "failed",
  "skipped",
]);

export const admins = pgTable("admins", {
  id: pk(),
  email: text().notNull().unique(),
  name: text().notNull(),
  passwordHash: text().notNull(),
  ...ts(),
});
export const sessions = pgTable(
  "sessions",
  {
    id: pk(),
    adminId: uuid()
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    tokenHash: text().notNull().unique(),
    expiresAt: tz().notNull(),
    userAgent: text(),
    createdAt: tz().notNull().defaultNow(),
  },
  (t) => [index("sessions_admin_idx").on(t.adminId)],
);
export const loginAttempts = pgTable(
  "login_attempts",
  { id: pk(), key: text().notNull(), createdAt: tz().notNull().defaultNow() },
  (t) => [index("login_attempts_key_idx").on(t.key, t.createdAt)],
);

export const contentBlocks = pgTable("content_blocks", {
  id: pk(),
  key: text().notNull().unique(),
  data: jsonb().$type<Record<string, unknown>>().notNull(),
  ...ts(),
});
export const navigationItems = pgTable("navigation_items", {
  id: pk(),
  label: text().notNull(),
  href: text().notNull(),
  desktop: boolean().notNull().default(true),
  isCta: boolean().notNull().default(false),
  visible: boolean().notNull().default(true),
  sortOrder: integer().notNull().default(0),
  ...ts(),
});
export const socialLinks = pgTable("social_links", {
  id: pk(),
  platform: text().notNull(),
  label: text().notNull(),
  url: text().notNull().default(""),
  enabled: boolean().notNull().default(true),
  newTab: boolean().notNull().default(true),
  sortOrder: integer().notNull().default(0),
  ...ts(),
});
export const media = pgTable("media", {
  id: pk(),
  url: text().notNull(),
  storage: text().notNull().default("local"),
  path: text().notNull(),
  alt: text().default(""),
  mime: text(),
  size: integer(),
  ...ts(),
});
export const brandingSettings = pgTable("branding_settings", {
  id: pk(),
  logoUrl: text().notNull().default(""),
  faviconUrl: text().notNull().default(""),
  ogImageUrl: text().notNull().default(""),
  seoTitle: text().notNull().default(""),
  seoDescription: text().notNull().default(""),
  ...ts(),
});
export const themeSettings = pgTable("theme_settings", {
  id: pk(),
  name: text().notNull(),
  tokens: jsonb().$type<Record<string, unknown>>().notNull(),
  isActive: boolean().notNull().default(false),
  inSwitcher: boolean().notNull().default(false),
  sortOrder: integer().notNull().default(0),
  ...ts(),
});
export const projects = pgTable(
  "projects",
  {
    id: pk(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    summary: text().notNull().default(""),
    body: text().notNull().default(""),
    category: text().notNull().default("llm"),
    status: contentStatus().notNull().default("draft"),
    featured: boolean().notNull().default(false),
    thumbnailId: uuid().references(() => media.id, { onDelete: "set null" }),
    meta: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    sortOrder: integer().notNull().default(0),
    deletedAt: tz(),
    ...ts(),
  },
  (t) => [index("projects_status_idx").on(t.status, t.sortOrder)],
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: pk(),
    name: text().notNull(),
    email: text().notNull(),
    projectType: text(),
    budget: text(),
    message: text().notNull(),
    status: messageStatus().notNull().default("new"),
    notifyStatus: mailStatus().notNull().default("pending"),
    autoreplyStatus: mailStatus().notNull().default("pending"),
    mailError: text(),
    ipHash: text(),
    ...ts(),
  },
  (t) => [index("contact_status_idx").on(t.status, t.createdAt)],
);

export const aiDocuments = pgTable(
  "ai_documents",
  {
    id: pk(),
    sourceType: text().notNull(),
    sourceKey: text().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    hash: text().notNull(),
    status: text().notNull().default("indexed"),
    error: text(),
    ...ts(),
  },
  (t) => [uniqueIndex("ai_documents_source_idx").on(t.sourceType, t.sourceKey)],
);
export const aiChunks = pgTable(
  "ai_chunks",
  {
    id: pk(),
    documentId: uuid()
      .notNull()
      .references(() => aiDocuments.id, { onDelete: "cascade" }),
    content: text().notNull(),
    embedding: vector({ dimensions: 1536 }).notNull(),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    ...ts(),
  },
  (t) => [
    index("ai_chunks_doc_idx").on(t.documentId),
    index("ai_chunks_embedding_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
  ],
);
export const conversations = pgTable(
  "conversations",
  {
    id: pk(),
    sessionId: text().notNull(),
    title: text().notNull().default(""),
    ...ts(),
  },
  (t) => [index("conversations_session_idx").on(t.sessionId)],
);
export const chatMessages = pgTable(
  "messages",
  {
    id: pk(),
    conversationId: uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text().notNull(),
    content: text().notNull(),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: tz().notNull().defaultNow(),
  },
  (t) => [index("messages_conv_idx").on(t.conversationId, t.createdAt)],
);

export const testimonials = pgTable(
  "testimonials",
  {
    id: pk(),
    quote: text().notNull(),
    authorName: text().notNull(),
    authorRole: text().notNull().default(""),
    source: text().notNull().default(""),
    rating: integer().notNull().default(5),
    featured: boolean().notNull().default(false),
    status: contentStatus().notNull().default("draft"),
    sortOrder: integer().notNull().default(0),
    ...ts(),
  },
  (t) => [index("testimonials_status_idx").on(t.status, t.sortOrder)],
);

export const projectCategories = pgTable("project_categories", {
  id: pk(),
  slug: text().notNull().unique(),
  label: text().notNull(),
  sortOrder: integer().notNull().default(0),
  ...ts(),
});
export const contactOptions = pgTable(
  "contact_options",
  {
    id: pk(),
    kind: text().notNull(),
    label: text().notNull(),
    sortOrder: integer().notNull().default(0),
    ...ts(),
  },
  (t) => [index("contact_options_kind_idx").on(t.kind, t.sortOrder)],
);
