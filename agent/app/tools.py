from .db import q
from .rag import LABELS, retrieve


async def _blocks(*keys):
    return {
        r["key"]: r["data"]
        for r in await q(
            "select key,data from content_blocks where key = any(%s)", (list(keys),)
        )
    }


async def get_profile():
    b = await _blocks("brand", "hero")
    br, h = b.get("brand"), b.get("hero", {})
    return (
        (
            f"Name: {br['name']}\nRole: {br['role']}\nBase: {br['tagline']}\nSummary: {h.get('lead', '')}",
            ["Profile"],
        )
        if br
        else ("", [])
    )


async def get_contact_info():
    c = (await _blocks("contact")).get("contact")
    return (
        (f"Email: {c['email']}\nWhatsApp: {c['whatsappDisplay']}", ["Contact"])
        if c
        else ("", [])
    )


async def get_social_links():
    rows = await q(
        "select label,platform,url from social_links where enabled order by sort_order"
    )
    return (
        (
            "Social links: "
            + "; ".join(
                f"{r['label']} {r['url']}" if r["url"] else r["label"] for r in rows
            ),
            ["Contact"],
        )
        if rows
        else ("", [])
    )


async def get_projects():
    rows = await q(
        "select title,category,summary,meta from projects where status='published' and deleted_at is null order by sort_order"
    )
    return (
        (
            "\n".join(
                f"- {r['title']} ({r['category']}): {r['summary']} Stack: {', '.join(r['meta'].get('tech', []))}"
                for r in rows
            ),
            ["Projects"],
        )
        if rows
        else ("", [])
    )


async def get_project_details(slug: str):
    r = await q(
        "select title,summary,body,meta from projects where slug=%s and status='published' and deleted_at is null",
        (slug,),
    )
    return (
        (f"{r[0]['title']}: {r[0]['summary']}\n{r[0]['body']}", ["Projects"])
        if r
        else ("", [])
    )


async def search_portfolio_knowledge(query, provider, k, threshold):
    hits = await retrieve(query, provider, k, threshold)
    return "\n---\n".join(h["content"] for h in hits), sorted(
        {LABELS.get(h["source_type"], "Portfolio") for h in hits}
    )
