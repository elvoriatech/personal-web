/**
 * Skill levels are a self-assessment derived from the emphasis and duration of
 * each technology across the CV. Adjust the numbers freely — they are opinion,
 * not measurement.
 */
export const skillBars = [
  { label: "TypeScript / JavaScript", level: 95 },
  { label: "Angular / NgRx", level: 95 },
  { label: "React / Next.js", level: 90 },
  { label: "Node.js / NestJS", level: 90 },
  { label: "Python / FastAPI", level: 88 },
  { label: "AWS / Kubernetes", level: 85 },
  { label: "AI / RAG / Vector DBs", level: 85 },
] as const;

export type TechKey =
  | "typescript" | "react" | "nextjs" | "angular" | "nodejs"
  | "python" | "fastapi" | "postgresql" | "neo4j"
  | "aws" | "docker" | "kubernetes"
  | "langchain" | "langgraph" | "openai" | "claude" | "huggingface" | "chroma";

/**
 * Two labelled tile groups: the engineering stack (twelve, two rows of six)
 * and the AI toolchain (six, one row).
 */
export const techGroups: {
  title: string;
  items: { key: TechKey; label: string }[];
}[] = [
  {
    title: "Engineering Stack",
    items: [
      { key: "typescript", label: "TypeScript" },
      { key: "react", label: "React" },
      { key: "nextjs", label: "Next.js" },
      { key: "angular", label: "Angular" },
      { key: "nodejs", label: "Node.js" },
      { key: "python", label: "Python" },
      { key: "fastapi", label: "FastAPI" },
      { key: "postgresql", label: "PostgreSQL" },
      { key: "neo4j", label: "Neo4j" },
      { key: "aws", label: "AWS" },
      { key: "docker", label: "Docker" },
      { key: "kubernetes", label: "Kubernetes" },
    ],
  },
  {
    title: "AI Engineering",
    items: [
      { key: "langchain", label: "LangChain" },
      { key: "langgraph", label: "LangGraph" },
      { key: "openai", label: "OpenAI" },
      { key: "claude", label: "Claude" },
      { key: "huggingface", label: "Hugging Face" },
      { key: "chroma", label: "Chroma DB" },
    ],
  },
];

/** Grouped skill list used by the Career section. */
export const skillGroups = [
  {
    title: "AI / LLM Engineering",
    items: [
      "Generative AI", "RAG", "LangChain", "LangGraph", "LangSmith",
      "Agentic AI", "Multi-Agent Systems", "Model Context Protocol (MCP)",
      "Prompt Engineering", "Function Calling", "Embeddings", "Semantic Search",
      "Guardrails", "LLM Evaluation", "OpenAI / Claude", "Hugging Face", "Ollama",
    ],
  },
  {
    title: "Frontend",
    items: ["TypeScript", "Angular 19", "React", "Next.js", "Redux", "NgRx", "PWA"],
  },
  {
    title: "Backend",
    items: ["Node.js", "NestJS", "Python", "FastAPI", "Java", "Spring Boot", "REST", "GraphQL"],
  },
  {
    title: "Data & Vector Stores",
    items: ["PostgreSQL", "MongoDB", "Chroma DB", "Neo4j", "Redis", "Elasticsearch", "CouchDB", "ERM / UML"],
  },
  {
    title: "Testing",
    items: ["Jest", "Playwright", "E2E", "TDD"],
  },
  {
    title: "DevOps / Cloud",
    items: ["AWS Bedrock", "SageMaker", "Lambda", "S3", "Docker", "Kubernetes", "GitLab CI/CD", "Grafana"],
  },
] as const;
