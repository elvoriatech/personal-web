export type Service = {
  /** Stable id, used for anchors and structured data. */
  id: string;
  title: string;
  blurb: string;
  /** What the client actually gets — short, concrete deliverables. */
  deliverables: string[];
  icon: "agents" | "rag" | "product" | "integration" | "cloud";
};

/**
 * Framed as problems a business hires for, not technologies. The stack the
 * work is built with lives in content/skills.ts and lower on the page.
 */
export const services: Service[] = [
  {
    id: "ai-agents-automation",
    title: "AI Agents & Business Automation",
    blurb:
      "Agents that call your APIs, work with your business data and carry a workflow through to the end — instead of a chatbot that only talks.",
    deliverables: [
      "Tool-calling agents wired to your systems",
      "Multi-step workflows with human approval where it matters",
      "Guardrails, evaluation and logging from day one",
    ],
    icon: "agents",
  },
  {
    id: "rag-knowledge-assistants",
    title: "RAG & Knowledge Assistants",
    blurb:
      "Turn manuals, tickets, contracts and internal wikis into an assistant that answers from your own documents and shows its sources.",
    deliverables: [
      "Document ingestion, chunking and embeddings pipeline",
      "Hybrid retrieval with citations and access control",
      "Answer-quality evaluation before and after launch",
    ],
    icon: "rag",
  },
  {
    id: "ai-product-development",
    title: "AI Product Development",
    blurb:
      "Take an AI idea to a working SaaS or MVP — backend, frontend, database, payments and deployment, built to be extended rather than thrown away.",
    deliverables: [
      "Scoped MVP with a clear release plan",
      "Multi-tenant SaaS foundations, auth and billing",
      "Production deployment on AWS with monitoring",
    ],
    icon: "product",
  },
  {
    id: "ai-integration",
    title: "AI Integration into Existing Software",
    blurb:
      "Add OpenAI, Claude or self-hosted models, MCP servers and LLM features to the applications your team already runs — without a rewrite.",
    deliverables: [
      "Model selection for cost, latency and data privacy",
      "MCP servers and function-calling interfaces to your data",
      "Fallbacks, rate limits and cost controls",
    ],
    icon: "integration",
  },
  {
    id: "full-stack-cloud-engineering",
    title: "Full-Stack & Cloud Engineering",
    blurb:
      "The engineering around the model is what reaches users: APIs, front-ends, databases, Kubernetes on AWS and CI/CD pipelines that keep shipping.",
    deliverables: [
      "TypeScript, Node.js, Python and Next.js / Angular front-ends",
      "PostgreSQL, vector stores and search",
      "Docker, Kubernetes, GitLab CI/CD and Grafana observability",
    ],
    icon: "cloud",
  },
];
