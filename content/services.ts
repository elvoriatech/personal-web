export type Service = {
  title: string;
  blurb: string;
  icon: "web" | "mobile" | "desktop" | "ai";
};

export const services: Service[] = [
  {
    title: "Website Development",
    blurb:
      "Fast, accessible, SEO-ready web applications in Next.js, React and Angular — from design handoff to production deployment.",
    icon: "web",
  },
  {
    title: "Mobile App Development",
    blurb:
      "Installable PWAs and cross-platform mobile experiences that work offline and feel native on every device.",
    icon: "mobile",
  },
  {
    title: "Desktop Applications",
    blurb:
      "Cross-platform desktop tools built on the same modern web stack, sharing one codebase with your web product.",
    icon: "desktop",
  },
  {
    title: "AI Engineering",
    blurb:
      "RAG pipelines, multi-agent workflows and LLM features wired into real products — evaluated, observable and production-ready.",
    icon: "ai",
  },
];
