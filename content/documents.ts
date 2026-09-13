import type { DocumentBundle } from "@/lib/documents/types";

/**
 * Seed content for the résumé, cover letter and outreach templates.
 *
 * These are the DEFAULTS. Once a database is configured the admin panel stores
 * an edited copy and that takes precedence; with no database the site falls
 * back to exactly what is below.
 *
 * Deliberately ATS-safe: no tables, no columns, no images, no glyph bullets —
 * the original Word résumé used 11 tables and 2 embedded images, which is what
 * applicant tracking systems fail to parse.
 */
export const defaultDocuments: DocumentBundle = {
  resume: {
    fullName: "Zahoor Ahmed",
    headline: "Senior Software Engineer | AI / LLM Engineer",
    location: "Mülheim-Kärlich, Germany",
    phone: "+49 162 3363430",
    email: "zahoor_ahmed143@hotmail.com",
    extras: "Permanent Residency | German B1",
    // Recruiters look for both. Fill these in and they appear automatically;
    // left blank they are omitted rather than printed as dead labels.
    linkedin: "linkedin.com/in/zahoorahmed",
    github: "github.com/zwebapps",
    preferredVariant: "ats",
    photoShape: "square",
    summary:
      "Senior Software Engineer and AI/LLM Engineer with 8+ years of experience building scalable enterprise applications, microservices and cloud-native systems across fleet telematics, e-commerce and airline technology. Experienced with TypeScript, Node.js, Python, AWS and Kubernetes, with a hands-on focus on Generative AI, Retrieval-Augmented Generation (RAG), LLM applications, AI agents and vector-based retrieval. Designs production-ready APIs, distributed systems and AI workflows using LangChain, LangGraph, OpenAI and AWS Bedrock, working in Agile and Scrum teams with test-driven development.",
    skills: [
      {
        label: "AI / Generative AI",
        items:
          "Generative AI, Large Language Models (LLM), Retrieval-Augmented Generation (RAG), Agentic AI, AI Agents, Multi-Agent Systems, Model Context Protocol (MCP), Prompt Engineering, Function / Tool Calling, Structured Outputs, Response Streaming, Embeddings, Vector Search, Semantic Search, Chunking Strategies, Context Engineering, Hallucination Mitigation, Guardrails, LLM Evaluation and Benchmarking, AI Observability and Tracing, Token and Cost Optimisation",
      },
      {
        label: "AI Frameworks, Models and Infrastructure",
        items:
          "LangChain, LangGraph, LangSmith, OpenAI API, Anthropic Claude, Hugging Face, Ollama, OpenRouter, AWS Bedrock, Amazon SageMaker, Chroma DB, Neo4j Graph Retrieval, Python, FastAPI, Jupyter",
      },
      {
        label: "Programming",
        items: "TypeScript, JavaScript, Python, Java, Kotlin, PHP",
      },
      {
        label: "Backend",
        items:
          "Node.js, NestJS, FastAPI, Spring Boot, REST APIs, GraphQL, Microservices, Event-Driven Architecture",
      },
      {
        label: "Frontend",
        items:
          "Angular, React, Next.js, Vue.js, Redux, NgRx, Progressive Web Apps (PWA), Responsive Design",
      },
      {
        label: "Databases and Vector Stores",
        items:
          "PostgreSQL, MongoDB, Chroma DB, Neo4j, Redis, Elasticsearch, CouchDB, Entity-Relationship Modeling (ERM), UML",
      },
      {
        label: "Cloud and DevOps",
        items:
          "Amazon Web Services (AWS), Lambda, API Gateway, Amazon ECS, S3, CloudFront, CloudFormation, Docker, Kubernetes, GitLab Continuous Integration / Continuous Deployment (CI/CD), Grafana",
      },
      {
        label: "Testing and Practice",
        items:
          "Jest, Playwright, Mocha, End-to-End (E2E) Testing, Test-Driven Development (TDD), Agile, Scrum, Software Development Life Cycle (SDLC), Code Review",
      },
    ],
    roles: [
      {
        title: "Senior Software Engineer",
        company: "PTC Telematik GmbH",
        location: "Coblenz, Germany",
        start: "December 2024",
        end: "Present",
        bullets: [
          "Build Angular 19 and TypeScript PWA modules for fleet telematics, from test-driven development through to deployment.",
          "Architect NestJS backend services with PostgreSQL, covering schema design and REST APIs.",
          "Operate Kubernetes-based microservices on AWS, ensuring scalability and high availability in production.",
          "Build CI/CD pipelines in GitLab CI with Grafana-based monitoring and observability.",
          "Develop Kotlin services for real-time vehicle route tracking and fleet monitoring.",
          "Deliver a full AWS serverless stack (Lambda, API Gateway, CloudFront, S3, CodePipeline) with SNS notifications.",
        ],
      },
      {
        title: "Full Stack Developer",
        company: "Retromotion GmbH",
        location: "Stuttgart, Germany",
        start: "December 2022",
        end: "August 2024",
        bullets: [
          "Architected a microservices-based e-commerce platform for auto parts using Vue.js, Node.js, TypeScript and PostgreSQL.",
          "Built a real-time admin dashboard with Socket.io and implemented Elasticsearch for high-performance product search.",
          "Integrated the Amazon Seller API over SOAP and REST, automating eBay, Amazon and Tyre24 order synchronisation via cron jobs.",
          "Containerised services on AWS and designed CouchDB analytics queries alongside bulk import and export workflows.",
          "Automated DHL address correction through DHL REST and SOAP APIs, reducing manual support overhead.",
        ],
      },
      {
        title: "Software Engineer",
        company: "TPConnects Technologies",
        location: "Dubai, UAE",
        start: "October 2019",
        end: "October 2022",
        bullets: [
          "Developed an NDC flight booking platform (Angular, React, Node.js, PostgreSQL) from scratch to production.",
          "Integrated GDS and airline suppliers using Java Spring Boot microservices behind AWS API Gateway.",
          "Managed complex booking state with NgRx and Redux, adapting frontend workflows to dynamic client requirements.",
          "Secured the application with JWT, OAuth 2.0, CORS and HTTP interceptors.",
          "Designed and deployed a full AWS architecture using Lambda, API Gateway, CloudFormation, Route 53 and SNS.",
          "Built GitLab CI/CD pipelines on AWS ECS and applied TDD with Jest and Playwright across the end-to-end booking flow.",
        ],
      },
      {
        title: "Full Stack Developer",
        company: "Diwan Arabia Dubai LLC",
        location: "Dubai, UAE",
        start: "September 2018",
        end: "August 2019",
        bullets: [
          "Built web servers and REST APIs with Node.js and Express, covering routing, middleware, cookies and sessions.",
          "Developed reusable React front-ends with Redux state management across hotel, real-estate and social products.",
          "Used Webpack for bundling and Jenkins for continuous integration, with Git and JIRA across the team.",
        ],
      },
      {
        title: "Web Developer",
        company: "Jinnah Software House",
        location: "Jhelum, Pakistan",
        start: "January 2017",
        end: "August 2018",
        bullets: [
          "Developed dynamic websites on core PHP, CodeIgniter and Laravel backends.",
          "Built WordPress themes and custom plugins for a range of clients.",
          "Delivered Java web and Android applications backed by SQLite.",
        ],
      },
    ],
    /**
     * Evidence for the AI positioning, drawn from work actually in the repos.
     * Add measurable results (throughput, latency, time saved) as soon as you
     * have real figures — invented numbers are the fastest way to lose an
     * interview, so none are stated here.
     */
    aiProjects: [
      {
        name: "RankForge AI — Autonomous SEO Engineer",
        role: "Creator, full stack and AI engineering",
        bullets: [
          "Built a multi-tenant Generative AI platform that crawls a website, analyses it with LLM agents and opens the resulting fixes as GitHub pull requests.",
          "Implemented the agent layer over Ollama and OpenRouter, with task decomposition, tool calling and structured outputs.",
          "Built the ingestion and crawling pipeline in Playwright, with BullMQ background workers and a Fastify orchestration API.",
          "Integrated GitHub and Google Search Console through Model Context Protocol (MCP) clients, closing the loop from recommendation to measured ranking change.",
          "Modelled tenants, crawls and findings in PostgreSQL via Prisma.",
        ],
      },
      {
        name: "DeutschFlow AI — Conversational Language Tutor",
        role: "Creator",
        bullets: [
          "Built an AI German-language tutor using conversational LLM agents over graded source material.",
          "Implemented Retrieval-Augmented Generation (RAG) with document chunking, embeddings and semantic retrieval to keep responses grounded in the correct proficiency level.",
        ],
      },
      {
        name: "Applied AI Engineering Programme — Turing College",
        role: "Programme projects",
        bullets: [
          "Built Retrieval-Augmented Generation (RAG) applications with LangChain, covering ingestion, chunking, embeddings, vector retrieval and LLM response generation.",
          "Developed multi-agent workflows in LangGraph using task decomposition, tool calling and long-term memory.",
          "Applied prompt engineering, LLM benchmarking and response evaluation to improve reliability and reduce hallucination.",
        ],
      },
    ],
    projects: [
      {
        name: "Guessto",
        url: "guessto.com",
        summary:
          "Multi-tenant restaurant discovery and ordering platform; every venue runs on its own subdomain from a single codebase, with QR ordering and Stripe payments.",
      },
      {
        name: "RankForge AI",
        url: "",
        summary:
          "Autonomous SEO engineer that crawls a site, analyses it with LLM agents, generates fixes as GitHub pull requests and tracks the resulting rankings.",
      },
      {
        name: "Retromotion",
        url: "retromotion.com",
        summary:
          "Microservices auto-parts marketplace with Elasticsearch search and automated marketplace order synchronisation.",
      },
      {
        name: "TPConnects",
        url: "tpconnects.com",
        summary:
          "NDC and IATA-certified air retailing platform with GDS and airline supplier integration.",
      },
      {
        name: "DUDI",
        url: "dudiapp.com",
        summary: "Sports community platform shipping on web, iOS and Android.",
      },
      {
        name: "UniKoop",
        url: "unikoop.nl",
        summary: "Dutch home-shopping storefront with a full catalogue and checkout flow.",
      },
    ],
    education: [
      {
        qualification: "B.Eng. Software Engineering (BSCSE)",
        institution: "Virtual University of Pakistan",
        period: "2014 - 2018",
      },
    ],
    certifications: [
      {
        qualification: "Associate AI Engineer for Developers",
        institution: "DataCamp",
        period: "2026",
      },
      {
        qualification: "AI Engineering Programme",
        institution: "Turing College",
        period: "2026",
        detail:
          "Prompt engineering and LLM benchmarking, RAG with LangChain, function calling, and production AI agents with long-term memory.",
      },
    ],
    languages: "English (professional working proficiency), German (B1)",
  },

  coverLetter: {
    fullName: "Zahoor Ahmed",
    headline: "Senior Software Engineer | AI Engineer",
    location: "Mülheim-Kärlich, Germany",
    phone: "+49 162 3363430",
    email: "zahoor_ahmed143@hotmail.com",
    targetRole: "",
    targetCompany: "",
    greeting: "Dear Hiring Manager,",
    paragraphs: [
      "I am writing to express my interest in the {{role}} position at {{company}}. With 8+ years of experience building enterprise-grade software across telematics, e-commerce and airline technology, combined with my recent specialisation in Applied AI Engineering, I bring software architecture expertise, cloud engineering experience and practical AI development skills.",
      "Throughout my career I have designed and delivered scalable applications and microservices using TypeScript, Node.js, NestJS, Angular, React, Python, Java, PostgreSQL and AWS. In my current role at PTC Telematik GmbH I work on fleet-telematics solutions, developing Angular and TypeScript applications, NestJS backend services, Kubernetes-based microservices, AWS serverless infrastructure and real-time vehicle tracking services. I am also responsible for CI/CD, observability, scalability and production reliability.",
      "My recent focus has shifted toward AI Engineering and LLM-powered applications. I have hands-on expertise in RAG architectures, vector-based retrieval, LangChain, LangGraph, LangSmith, AI agents, prompt engineering, and foundation models such as OpenAI and Claude. I am particularly interested in applying these technologies to real business problems while maintaining the engineering principles production systems demand: reliability, security, observability, scalability and maintainability. I completed the Associate AI Engineer for Developers certification through Datacamp and the AI Engineering programme at Turing College.",
      "I also bring substantial experience with AWS, Docker, Kubernetes, GitLab CI/CD, PostgreSQL, MongoDB, Elasticsearch, Redis, REST APIs and GraphQL. My previous work includes architecting a microservices-based automotive e-commerce platform, integrating Amazon and eBay APIs, building airline flight-booking platforms, integrating GDS and airline suppliers, and developing AWS-based systems for high-volume production environments.",
      "What motivates me is combining an established software engineering background with emerging AI technologies. I enjoy taking an idea from architecture and prototyping through implementation, testing, deployment and continuous improvement. That combination of backend engineering, cloud architecture, frontend experience and applied AI lets me contribute quickly to teams building intelligent, scalable products.",
      "I am based in Germany, hold permanent residency and have German at B1 level. I would welcome the opportunity to discuss how my experience could contribute to your team.",
    ],
    closing:
      "Thank you for your time and consideration. I look forward to hearing from you.",
  },

  /**
   * Outreach templates for winning project work.
   *
   * Placeholders are filled per recipient: {{firstName}}, {{company}},
   * {{observation}}, {{senderName}}, {{portfolioUrl}}, {{calendarUrl}}.
   *
   * Note on compliance: unsolicited commercial email to businesses is
   * restricted in Germany and the wider EU (UWG §7 / GDPR). Every template
   * therefore identifies the sender, gives a concrete reason for the contact,
   * and closes with an opt-out line. Keep the opt-out in place, send to
   * genuine business addresses only, and keep volumes low and personalised.
   */
  emailTemplates: [
    {
      id: "website-rebuild",
      name: "Cold outreach — website rebuild",
      purpose:
        "First contact with a business whose site is dated, slow or not mobile-friendly.",
      subject: "{{company}}'s site on mobile — quick observation",
      body: `Hi {{firstName}},

I came across {{company}} while looking at businesses in the area, and noticed {{observation}}.

I build websites and web applications for a living — most recently fleet-telematics software at PTC Telematik and an e-commerce platform at Retromotion. I also run Guessto, a restaurant ordering platform I built end to end.

If it is useful, I am happy to send a short, free breakdown of what I would change on {{company}}'s site and what it would take. No obligation, and no follow-up if the timing is wrong.

Would that be worth a look?

Best regards,
{{senderName}}
{{portfolioUrl}}

If you would rather not hear from me again, just reply "no thanks" and I will not contact you further.`,
    },
    {
      id: "ai-automation",
      name: "Cold outreach — AI and automation",
      purpose:
        "For businesses with a manual, repetitive process an LLM workflow could absorb.",
      subject: "Automating {{observation}} at {{company}}",
      body: `Hi {{firstName}},

I work as a Senior Software Engineer specialising in Applied AI — retrieval systems, agent workflows and LLM features that hold up in production rather than in a demo.

I noticed {{observation}}. That is usually the kind of work a well-scoped AI workflow removes almost entirely: document handling, support triage, data extraction, internal search over your own material.

I have built exactly this — including RankForge AI, which crawls a site, analyses it with LLM agents and opens the fixes as pull requests.

If you are curious, I would be glad to spend 20 minutes mapping which parts of that process are worth automating and which honestly are not. Free, and useful either way.

Best regards,
{{senderName}}
{{portfolioUrl}}

Prefer not to receive these? Reply "no thanks" and I will remove you immediately.`,
    },
    {
      id: "follow-up",
      name: "Follow-up — no reply",
      purpose: "One polite follow-up, sent 5–7 days after the first email. Send only once.",
      subject: "Re: {{company}} — following up once",
      body: `Hi {{firstName}},

Following up once on my note from last week, in case it arrived at a busy moment.

The short version: I build web, mobile and desktop applications, and AI features that reach production. If {{company}} has something planned this quarter, I would be glad to talk. If not, I will leave it there and you will not hear from me again.

Either way, thanks for your time.

Best regards,
{{senderName}}
{{portfolioUrl}}`,
    },
    {
      id: "project-application",
      name: "Reply to a posted project",
      purpose: "Responding to a job board, RFP or freelance listing.",
      subject: "{{role}} — Zahoor Ahmed, Senior Software Engineer",
      body: `Hi {{firstName}},

I am writing about the {{role}} listing at {{company}}.

The most relevant parts of my background:

- 8+ years building production software across fleet telematics, e-commerce and airline platforms.
- Current stack: TypeScript, Angular, React and Next.js on the front end; Node.js, NestJS, FastAPI and Python behind it; AWS and Kubernetes underneath.
- Applied AI: RAG pipelines, LangChain and LangGraph agent workflows, vector stores including Chroma and Neo4j.
- Based in Germany with permanent residency and German at B1.

Recent work worth a look: {{portfolioUrl}}

I have attached my CV. Happy to walk through any part of it, or to take a short technical exercise if that is how you prefer to assess.

Best regards,
{{senderName}}
{{phone}}`,
    },
    {
      id: "referral",
      name: "Warm introduction request",
      purpose: "Asking an existing contact to refer you. Highest conversion of the set.",
      subject: "Quick favour — introduction at {{company}}?",
      body: `Hi {{firstName}},

Hope things are going well at {{company}}.

I am taking on new project work at the moment — web and mobile applications, and increasingly AI features for teams that want them built properly rather than bolted on.

If anyone in your network is looking for that kind of help, I would be grateful for an introduction. And if it is easier, here is a line you can forward:

"Zahoor is a senior engineer in Germany with 8+ years across telematics, e-commerce and airline platforms. He builds web, mobile and desktop applications and production AI systems. Portfolio: {{portfolioUrl}}"

No pressure at all — and let me know if I can return the favour.

Best regards,
{{senderName}}`,
    },
    {
      id: "post-call",
      name: "After a call — scope and next step",
      purpose: "Sent within 24 hours of a first call, while the conversation is fresh.",
      subject: "{{company}} — summary and suggested next step",
      body: `Hi {{firstName}},

Thanks for the time today. Writing down what I understood, so we are working from the same page:

What you want to achieve:
- {{observation}}

What I would suggest:
- A short discovery phase to pin down scope and the data model.
- A first working slice you can use, rather than a long build with nothing to see.
- Then iterate, with a fixed price per stage so there are no surprises.

I will send a written proposal with timings and cost by {{deadline}}.

If anything above is wrong, tell me now rather than later — it is much cheaper to fix at this stage.

Best regards,
{{senderName}}
{{phone}}`,
    },
  ],
};
