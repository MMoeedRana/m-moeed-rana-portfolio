"use server";
import { hash, verify } from "@node-rs/argon2";
import { admins, contactOptions, projectCategories } from "@/db/schema";
import { passwordSchema, profileSchema } from "@/lib/settings-schema";
import { testimonials } from "@/db/schema";
import { testimonialSchema } from "@/lib/testimonial-schema";
import { brandingSettings } from "@/db/schema";
import { navigationItems, socialLinks } from "@/db/schema";
import { ctaSchema, navItemSchema, socialSchema } from "@/lib/nav-schema";
import { isNull } from "drizzle-orm";
import { media, projects } from "@/db/schema";
import { projectSchema } from "@/lib/project-schema";
import { remove } from "@/lib/storage";
import { BLOCKS, conform, fill, type BlockKey } from "@/lib/blocks";
import { contentBlocks } from "@/db/schema";
import { and, ne } from "drizzle-orm";
import { themeSettings } from "@/db/schema";
import { themeSchema } from "@/lib/theme";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { contactMessages } from "@/db/schema";
import { login, logout, requireAdmin } from "@/lib/auth";

const creds = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});
export async function loginAction(
  _: { error?: string } | undefined,
  fd: FormData,
) {
  const p = creds.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Enter a valid email and password." };
  const r = await login(p.data.email, p.data.password);
  if (r.error) return r;
  redirect("/admin");
}
export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

const id = z.string().uuid();
export async function setMessageStatus(
  messageId: string,
  status: "new" | "read" | "archived",
) {
  await requireAdmin();
  await db
    .update(contactMessages)
    .set({ status })
    .where(eq(contactMessages.id, id.parse(messageId)));
  revalidatePath("/admin", "layout");
}
export async function deleteMessage(messageId: string) {
  await requireAdmin();
  await db
    .delete(contactMessages)
    .where(eq(contactMessages.id, id.parse(messageId)));
  revalidatePath("/admin", "layout");
}

export async function syncKnowledge(scope: "all" | "projects" | "profile") {
  await requireAdmin();
  const { AI_SERVICE_URL, INTERNAL_API_KEY } = process.env;
  if (AI_SERVICE_URL && INTERNAL_API_KEY)
    await fetch(`${AI_SERVICE_URL}/ai/sync`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({ scope }),
      signal: AbortSignal.timeout(120_000),
    }).catch(() => null);
  revalidatePath("/admin/ai");
}

type R = { ok: boolean; error?: string };
export async function saveTheme(input: unknown): Promise<R> {
  await requireAdmin();
  const p = themeSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Invalid theme values." };
  const [act] = await db
    .select({ id: themeSettings.id })
    .from(themeSettings)
    .where(eq(themeSettings.isActive, true))
    .limit(1);
  if (act)
    await db
      .update(themeSettings)
      .set({ tokens: p.data })
      .where(eq(themeSettings.id, act.id));
  else
    await db
      .insert(themeSettings)
      .values({ name: "Active theme", tokens: p.data, isActive: true });
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function savePreset(name: string, input: unknown): Promise<R> {
  await requireAdmin();
  const n = z.string().trim().min(1).max(40).safeParse(name),
    p = themeSchema.safeParse(input);
  if (!n.success || !p.success)
    return { ok: false, error: "Enter a preset name (max 40 characters)." };
  await db.insert(themeSettings).values({ name: n.data, tokens: p.data });
  revalidatePath("/admin/theme");
  return { ok: true };
}
export async function deletePreset(id: string): Promise<R> {
  await requireAdmin();
  await db
    .delete(themeSettings)
    .where(
      and(
        eq(themeSettings.id, z.string().uuid().parse(id)),
        eq(themeSettings.isActive, false),
      ),
    );
  revalidatePath("/admin/theme");
  return { ok: true };
}

export async function saveBlock(key: string, value: unknown): Promise<R> {
  await requireAdmin();
  const def = BLOCKS[key as BlockKey];
  if (!def) return { ok: false, error: "Unknown content block." };
  try {
    const data = conform(fill(value, def.shape), def.shape);
    const err = "check" in def ? def.check(data) : null;
    if (err) return { ok: false, error: err };
    await db
      .insert(contentBlocks)
      .values({ key, data })
      .onConflictDoUpdate({
        target: contentBlocks.key,
        set: { data, updatedAt: new Date() },
      });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

const uuid = z.string().uuid();
export async function saveProject(
  id: string | null,
  input: unknown,
): Promise<R & { id?: string }> {
  await requireAdmin();
  const p = projectSchema.safeParse(input);
  if (!p.success)
    return {
      ok: false,
      error: p.error.issues[0]?.message ?? "Invalid project.",
    };
  const d = p.data,
    v = {
      slug: d.slug,
      title: d.title,
      category: d.category,
      summary: d.summary,
      body: d.body,
      status: d.status,
      sortOrder: d.sortOrder,
      meta: {
        chip: d.chip,
        tech: d.tech
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        live: d.live,
        nda: d.nda,
        caseStudy: d.caseStudy,
        image: d.image,
      },
    };
  try {
    if (id)
      await db
        .update(projects)
        .set(v)
        .where(
          and(eq(projects.id, uuid.parse(id)), isNull(projects.deletedAt)),
        );
    else
      id = (
        await db.insert(projects).values(v).returning({ id: projects.id })
      )[0].id;
  } catch (e) {
    return {
      ok: false,
      error: /duplicate|unique/i.test(String(e))
        ? "That slug is already used."
        : "Could not save the project.",
    };
  }
  revalidatePath("/", "layout");
  return { ok: true, id: id ?? undefined };
}
export async function setProjectStatus(
  id: string,
  status: "draft" | "published" | "unpublished",
) {
  await requireAdmin();
  await db
    .update(projects)
    .set({ status })
    .where(eq(projects.id, uuid.parse(id)));
  revalidatePath("/", "layout");
}
export async function deleteProject(id: string) {
  await requireAdmin();
  await db
    .update(projects)
    .set({ deletedAt: new Date(), status: "unpublished" })
    .where(
      and(eq(projects.id, uuid.parse(id)), ne(projects.status, "published")),
    );
  revalidatePath("/", "layout");
}
export async function deleteMedia(id: string) {
  await requireAdmin();
  const [m] = await db
    .delete(media)
    .where(eq(media.id, uuid.parse(id)))
    .returning({ path: media.path });
  if (m) await remove(m.path);
  revalidatePath("/admin/media");
}

const navArray = z.array(navItemSchema).max(15);
export async function saveNavigation(items: unknown, cta: unknown): Promise<R> {
  await requireAdmin();

  const n = navArray.safeParse(items);
  const c = ctaSchema.safeParse(cta);

  if (!n.success) {
    return {
      ok: false,
      error: n.error.issues[0]?.message ?? "Invalid navigation.",
    };
  }

  if (!c.success) {
    return {
      ok: false,
      error: c.error.issues[0]?.message ?? "Invalid CTA button.",
    };
  }

  try {
    await db.delete(navigationItems);

    await db.insert(navigationItems).values([
      ...n.data.map((x, i) => ({
        ...x,
        isCta: false,
        sortOrder: i,
      })),
      {
        ...c.data,
        desktop: false,
        isCta: true,
        sortOrder: 99,
      },
    ]);
  } catch (e) {
    console.log("Could not save navigation.", e);
    return {
      ok: false,
      error: "Could not save navigation.",
    };
  }

  revalidatePath("/", "layout");

  return { ok: true };
}

const socialArray = z.array(socialSchema).max(10);
export async function saveSocials(items: unknown): Promise<R> {
  await requireAdmin();

  const p = socialArray.safeParse(items);

  if (!p.success) {
    return {
      ok: false,
      error: p.error.issues[0]?.message ?? "Invalid social links.",
    };
  }

  try {
    await db.delete(socialLinks);

    await db.insert(socialLinks).values(
      p.data.map((x, i) => ({
        ...x,
        sortOrder: i,
      })),
    );
  } catch (e) {
    console.log("Could not save social links.", e);
    return {
      ok: false,
      error: "Could not save social links.",
    };
  }

  revalidatePath("/", "layout");

  return { ok: true };
}

const brandingSchema = z.object({
  logoUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^\/media\//.test(v), "Upload a file"),
  faviconUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^\/media\//.test(v), "Upload a file"),
  ogImageUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^\/media\//.test(v), "Upload a file"),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(200),
});
export async function saveBranding(input: unknown): Promise<R> {
  await requireAdmin();
  const p = brandingSchema.safeParse(input);
  if (!p.success)
    return {
      ok: false,
      error: p.error.issues[0]?.message ?? "Invalid branding.",
    };
  const [row] = await db
    .select({ id: brandingSettings.id })
    .from(brandingSettings)
    .limit(1);
  if (row)
    await db
      .update(brandingSettings)
      .set(p.data)
      .where(eq(brandingSettings.id, row.id));
  else await db.insert(brandingSettings).values(p.data);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveTestimonial(
  id: string | null,
  input: unknown,
): Promise<R & { id?: string }> {
  await requireAdmin();
  const p = testimonialSchema.safeParse(input);
  if (!p.success)
    return {
      ok: false,
      error: p.error.issues[0]?.message ?? "Invalid testimonial.",
    };
  if (id)
    await db
      .update(testimonials)
      .set(p.data)
      .where(eq(testimonials.id, uuid.parse(id)));
  else
    id = (
      await db
        .insert(testimonials)
        .values(p.data)
        .returning({ id: testimonials.id })
    )[0].id;
  revalidatePath("/", "layout");
  return { ok: true, id };
}
export async function setTestimonialStatus(
  id: string,
  status: "draft" | "published" | "unpublished",
) {
  await requireAdmin();
  await db
    .update(testimonials)
    .set({ status })
    .where(eq(testimonials.id, uuid.parse(id)));
  revalidatePath("/", "layout");
}
export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await db.delete(testimonials).where(eq(testimonials.id, uuid.parse(id)));
  revalidatePath("/", "layout");
}

const aiSettingsSchema = z.object({
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().int().min(50).max(2000),
  topK: z.number().int().min(1).max(15),
  threshold: z.number().min(0).max(1),
  history: z.number().int().min(0).max(20),
  storeConversations: z.boolean(),
});
export async function saveAiSettings(input: unknown): Promise<R> {
  await requireAdmin();
  const p = aiSettingsSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Invalid AI settings." };
  await db
    .insert(contentBlocks)
    .values({ key: "ai_settings", data: p.data })
    .onConflictDoUpdate({
      target: contentBlocks.key,
      set: { data: p.data, updatedAt: new Date() },
    });
  return { ok: true };
}
export async function deleteConversation(id: string) {
  await requireAdmin();
  await db.delete(conversations).where(eq(conversations.id, uuid.parse(id)));
  revalidatePath("/admin/conversations");
}

export async function saveAdminProfile(input: unknown): Promise<R> {
  const admin = await requireAdmin();
  const p = profileSchema.safeParse(input);
  if (!p.success)
    return {
      ok: false,
      error: p.error.issues[0]?.message ?? "Invalid profile.",
    };
  const [clash] = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, p.data.email.toLowerCase()))
    .limit(1);
  if (clash && clash.id !== admin.id)
    return { ok: false, error: "That email is already in use." };
  await db
    .update(admins)
    .set({ name: p.data.name, email: p.data.email.toLowerCase() })
    .where(eq(admins.id, admin.id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}
export async function changeAdminPassword(input: unknown): Promise<R> {
  const admin = await requireAdmin();
  const p = passwordSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "Invalid input." };
  const [row] = await db
    .select({ passwordHash: admins.passwordHash })
    .from(admins)
    .where(eq(admins.id, admin.id))
    .limit(1);
  if (
    !row ||
    !(await verify(row.passwordHash, p.data.currentPassword).catch(() => false))
  )
    return { ok: false, error: "Current password is incorrect." };
  await db
    .update(admins)
    .set({ passwordHash: await hash(p.data.newPassword) })
    .where(eq(admins.id, admin.id));
  return { ok: true };
}

const categorySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and dashes only",
    )
    .max(40),
  label: z.string().trim().min(1, "Required").max(40),
});

export async function saveCategories(items: unknown): Promise<R> {
  await requireAdmin();

  const p = z
    .array(categorySchema)
    .min(1, "Add at least one category")
    .max(20)
    .safeParse(items);

  if (!p.success) {
    return {
      ok: false,
      error: p.error.issues[0]?.message ?? "Invalid categories.",
    };
  }

  const slugs = new Set(p.data.map((c) => c.slug));

  if (slugs.size !== p.data.length) {
    return {
      ok: false,
      error: "Category slugs must be unique.",
    };
  }

  await db.delete(projectCategories);

  await db.insert(projectCategories).values(
    p.data.map((c, i) => ({
      ...c,
      sortOrder: i,
    })),
  );

  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");

  return { ok: true };
}

const optionSchema = z.object({
  label: z.string().trim().min(1, "Required").max(60),
});

export async function saveContactOptions(
  kind: "projectType" | "budget",
  items: unknown,
): Promise<R> {
  await requireAdmin();

  const p = z.array(optionSchema).max(20).safeParse(items);

  if (!p.success) {
    return {
      ok: false,
      error: p.error.issues[0]?.message ?? "Invalid options.",
    };
  }

  await db
    .delete(contactOptions)
    .where(eq(contactOptions.kind, kind));

  await db.insert(contactOptions).values(
    p.data.map((o, i) => ({
      kind,
      label: o.label,
      sortOrder: i,
    })),
  );

  revalidatePath("/", "layout");
  revalidatePath("/admin/contact-options");

  return { ok: true };
}
