"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronsLeft, ChevronsRight, ListTree, Tags } from "lucide-react";
import {
  Bot,
  FileText,
  FolderKanban,
  Images,
  Layout,
  ImageIcon,
  MessageSquareQuote,
  MessagesSquare,
  Sliders,
  UserCog,
  LayoutDashboard,
  Palette,
  LogOut,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/messages", label: "Contact Messages", icon: Mail },
  { href: "/admin/content", label: "Site Content", icon: FileText },
  { href: "/admin/navigation", label: "Navigation & Socials", icon: Layout },
  { href: "/admin/branding", label: "Branding", icon: ImageIcon },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/categories", label: "Project Categories", icon: Tags },
  { href: "/admin/contact-options", label: "Contact Form Options", icon: ListTree },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/theme", label: "Theme", icon: Palette },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
  },
  { href: "/admin/ai", label: "AI Knowledge", icon: Bot },
  {
    href: "/admin/conversations",
    label: "AI Conversations",
    icon: MessagesSquare,
  },
  { href: "/admin/ai-settings", label: "AI Settings", icon: Sliders },
  { href: "/admin/settings", label: "Settings", icon: UserCog },
];

export function AdminShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [rail, setRail] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect 
      setRail(localStorage.getItem("admin_rail") === "1");
    } catch {}
  }, []);
  const toggleRail = () =>
    setRail((r) => {
      try {
        localStorage.setItem("admin_rail", r ? "0" : "1");
      } catch {}
      return !r;
    });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect 
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);
  const active = (h: string) =>
    h === "/admin" ? path === h : path.startsWith(h);
  return (
    <div
      className={`min-h-dvh transition-[padding] duration-200 md:${rail ? "pl-20" : "pl-64"} lg:pl-64`}
    >
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex ${rail ? "md:w-20" : "md:w-64"} w-64 max-w-[85vw] flex-col gap-6 border-r border-border bg-deep p-4 transition-all duration-200 lg:w-64 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        aria-label="Admin"
      >
        <div className="flex items-center justify-between">
          <Link href="/" className={`brand ${rail ? "md:hidden lg:flex" : ""}`}>
            <span className="mark">MR</span>Admin
          </Link>
          <button
            className="hidden rounded-lg p-2 text-body hover:text-foreground md:block lg:hidden"
            onClick={toggleRail}
            aria-label={rail ? "Expand sidebar" : "Collapse sidebar"}
          >
            {rail ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
          <button
            className="rounded-lg p-2 text-body hover:text-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${rail ? "md:justify-center lg:justify-start" : ""} ${active(href) ? "bg-primary/12 text-primary" : "text-body hover:bg-elevated hover:text-foreground"}`}
            >
              <Icon size={18} className="flex-none" />
              <span className={rail ? "md:hidden lg:inline" : ""}>{label}</span>
            </Link>
          ))}
        </nav>
        <div
          className={`mt-auto rounded-xl border border-border bg-card p-3 ${rail ? "md:px-2" : ""}`}
        >
          <p
            className={`truncate text-sm font-medium text-foreground ${rail ? "md:hidden lg:block" : ""}`}
          >
            {name}
          </p>
          <p
            className={`truncate text-xs text-muted-foreground ${rail ? "md:hidden lg:block" : ""}`}
          >
            {email}
          </p>
          <form action={logoutAction}>
            <button
              title="Log out"
              className={`mt-3 flex items-center gap-2 text-sm text-body hover:text-primary ${rail ? "md:justify-center lg:justify-start" : ""}`}
            >
              <LogOut size={16} />{" "}
              <span className={rail ? "md:hidden lg:inline" : ""}>Log out</span>
            </button>
          </form>
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
        <button
          className="rounded-lg p-2 text-foreground lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu size={22} />
        </button>
        <span className="mono text-xs text-muted-foreground">
          Portfolio CMS
        </span>
      </header>
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-8">
        {children}
      </main>
    </div>
  );
}
