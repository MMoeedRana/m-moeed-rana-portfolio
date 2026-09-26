from typing import TypedDict
from langgraph.graph import END, StateGraph
from . import tools

INTENTS = ["general", "portfolio", "projects", "contact", "unknown"]
NO_INFO = "I don't currently have that information in my portfolio knowledge base."

class State(TypedDict, total=False):
    question: str; mode: str; cfg: dict; intent: str; context: str; sources: list[str]; answer: str

def build(provider):
    async def classify(s): 
        if s["mode"] in ("portfolio", "recruiter"): return {"intent": "portfolio"}
        i = await provider.classify_intent(s["question"], INTENTS)
        return {"intent": "general" if i == "unknown" else i}

    async def general(s): return {"context": "", "sources": []}

    async def portfolio(s):
        c = s["cfg"]; t, src = await tools.search_portfolio_knowledge(s["question"], provider, c["top_k"], c["threshold"])
        return {"context": t, "sources": src}

    async def projects(s):
        (a, sa), (b, sb) = await tools.get_projects(), await tools.search_portfolio_knowledge(s["question"], provider, s["cfg"]["top_k"], s["cfg"]["threshold"])
        return {"context": "\n\n".join(x for x in (a, b) if x), "sources": sorted(set(sa + sb))}

    async def contact(s):
        (a, sa), (b, sb) = await tools.get_contact_info(), await tools.get_social_links()
        return {"context": "\n".join(x for x in (a, b) if x), "sources": sorted(set(sa + sb))}

    async def ground(s):  
        return {"answer": NO_INFO} if s["intent"] != "general" and not s.get("context") else {}

    g = StateGraph(State)
    for n, f in [("classify", classify), ("general", general), ("portfolio", portfolio), ("projects", projects), ("contact", contact), ("ground", ground)]:
        g.add_node(n, f)
    g.set_entry_point("classify")
    g.add_conditional_edges("classify", lambda s: s["intent"] if s["intent"] in ("general", "projects", "contact") else "portfolio",
                            {"general": "general", "projects": "projects", "contact": "contact", "portfolio": "portfolio"})
    for n in ("general", "portfolio", "projects", "contact"): g.add_edge(n, "ground")
    g.add_edge("ground", END)
    return g.compile()
