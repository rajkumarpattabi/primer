/* ============================================================================
 * Primer — concepts.js (seed data)
 * ----------------------------------------------------------------------------
 * The concepts Primer ships with, so the app is useful on first open. On first
 * run app.js copies these into localStorage (each gets its own review schedule).
 * After that, your saved data is the source of truth and this file is ignored
 * (except as an offline cache asset). Each concept follows the same template
 * the AI Capture returns, so seeded and captured cards look identical.
 *
 * Schema:
 *   term       short name
 *   theme      one of the group headings used in Library / Map
 *   oneLiner   the sub-title (<= ~12 words)
 *   why        why it exists / what problem it solves
 *   analogy    a real-world analogy
 *   connects   [terms] this links to (drives the Map edges)
 *   summary    one-sentence takeaway
 *   nextTopics [terms] natural next things to learn
 *   cards      [{q,a}] flashcards for spaced repetition
 * ==========================================================================*/
window.PRIMER_SEED = [
  {
    term: "Data lake", theme: "Data platforms",
    oneLiner: "Cheap central store for raw data of any type.",
    why: "Warehouses forced you to clean and structure data before storing it — slow and rigid. A lake lets you store first (any shape: tables, images, logs) and structure later.",
    analogy: "A real lake: rivers of every kind flow in and just sit there; you filter a glass only when you need to drink.",
    connects: ["Lakehouse", "Snowflake", "Databricks"],
    summary: "A data lake is cheap storage for all your raw data; it doesn't analyse anything by itself.",
    nextTopics: ["Data warehouse", "Lakehouse", "ETL vs ELT"],
    cards: [
      { q: "What is a data lake?", a: "A single cheap store for all raw data of any type (structured and unstructured), stored first and structured later." },
      { q: "What can't a plain data lake do by itself?", a: "Analyse or query data reliably — it's just storage, and lacks transactions/schema." }
    ]
  },
  {
    term: "Lakehouse", theme: "Data platforms",
    oneLiner: "Lake's cheap storage + warehouse's structure, in one.",
    why: "Companies hated running a separate lake and warehouse and copying data between them. The lakehouse gives one system with cheap flexible storage AND reliable, fast structured querying.",
    analogy: "One building: bulk storage in the back, a tidy organised storefront up front.",
    connects: ["Data lake", "ACID", "Databricks", "Snowflake"],
    summary: "Lakehouse = lake storage + warehouse guarantees, made possible by open table formats (Delta, Iceberg, Hudi).",
    nextTopics: ["ACID", "Delta Lake", "Medallion architecture"],
    cards: [
      { q: "What does a lakehouse combine?", a: "A data lake's cheap flexible storage with a data warehouse's structure, reliability and query speed." },
      { q: "What makes a lakehouse possible technically?", a: "Open table formats (Delta Lake, Iceberg, Hudi) that add ACID transactions and schema on top of cheap storage." }
    ]
  },
  {
    term: "Snowflake", theme: "Data platforms",
    oneLiner: "Warehouse-first cloud platform; great for SQL & reporting.",
    why: "Started as a cloud data warehouse built for structured data and fast SQL analytics; easy and clean for business reporting.",
    analogy: "A well-organised library where every book is catalogued and instantly findable.",
    connects: ["Data lake", "Databricks", "Lakehouse"],
    summary: "Snowflake is a warehouse-first cloud platform, strongest for SQL analytics and BI.",
    nextTopics: ["Databricks", "Data warehouse", "Lakehouse"],
    cards: [
      { q: "What did Snowflake start as?", a: "A cloud data warehouse, optimised for structured data and fast SQL analytics." },
      { q: "Snowflake vs Databricks in one line?", a: "Snowflake is warehouse/SQL-first; Databricks is big-data/ML-first. Both converge on the lakehouse." }
    ]
  },
  {
    term: "Databricks", theme: "Data platforms",
    oneLiner: "ML / big-data-first lakehouse platform, built on Spark.",
    why: "Built by the creators of Apache Spark for massive, messy data and machine learning. It popularised the lakehouse.",
    analogy: "A big workshop where you both organise materials and build complex things (AI models) with them.",
    connects: ["Lakehouse", "Snowflake", "Data lake", "AI models"],
    summary: "Databricks is a big-data/ML-first platform and the originator of the lakehouse idea.",
    nextTopics: ["Apache Spark", "Lakehouse", "Delta Lake"],
    cards: [
      { q: "What engine is Databricks built on?", a: "Apache Spark — for large-scale data processing." },
      { q: "What concept did Databricks popularise?", a: "The lakehouse." }
    ]
  },
  {
    term: "ACID", theme: "Concepts",
    oneLiner: "Four guarantees that make data transactions trustworthy.",
    why: "Without rules, concurrent or interrupted writes corrupt data (money vanishes mid-transfer, two people book the last seat). ACID prevents this.",
    analogy: "A bank transfer must move money out of A and into B as one all-or-nothing action.",
    connects: ["Lakehouse", "Data lake"],
    summary: "ACID = Atomicity (all-or-nothing), Consistency (rules hold), Isolation (no interference), Durability (survives crashes).",
    nextTopics: ["Transactions", "BASE / eventual consistency", "CAP theorem"],
    cards: [
      { q: "What does ACID stand for?", a: "Atomicity, Consistency, Isolation, Durability." },
      { q: "Which ACID property means 'confirmed data survives a crash'?", a: "Durability." },
      { q: "How does ACID relate to lakehouses?", a: "Adding ACID (via Delta/Iceberg/Hudi) to a raw data lake is what turns it into a warehouse-grade lakehouse." }
    ]
  },
  {
    term: "Collibra", theme: "Governance",
    oneLiner: "Data governance: catalog, meaning, lineage & access.",
    why: "Once data sprawls across many systems, you need to find it, define it, trust it, and control who sees it — and prove compliance.",
    analogy: "The card catalog + librarian + rulebook of a library — it doesn't hold the books, it manages knowledge of them.",
    connects: ["MetricStream", "Snowflake", "Databricks", "Metadata"],
    summary: "Collibra governs and describes data (catalog, glossary, lineage, quality, access) — it doesn't store or process it.",
    nextTopics: ["Metadata", "Data lineage", "Data catalog"],
    cards: [
      { q: "What does Collibra govern?", a: "Data — via catalog, business glossary, lineage, quality and access policies." },
      { q: "Does Collibra store your data?", a: "No — it works with metadata and sits above systems like Snowflake/Databricks." }
    ]
  },
  {
    term: "MetricStream", theme: "Governance",
    oneLiner: "GRC platform: business risk, compliance & audits.",
    why: "Large regulated firms must continuously manage risk, follow regulations, run audits and enforce policies — MetricStream centralises all of it.",
    analogy: "The health-and-safety + insurance + audit department, digitised into one system.",
    connects: ["Collibra", "Guardrails"],
    summary: "MetricStream is a GRC (Governance, Risk, Compliance) platform; it governs the whole business's risk, whereas Collibra governs the data.",
    nextTopics: ["GRC", "Risk management", "Internal audit"],
    cards: [
      { q: "What does GRC stand for?", a: "Governance, Risk and Compliance." },
      { q: "MetricStream vs Collibra?", a: "MetricStream governs business risk & compliance; Collibra governs data. Different scope, complementary." }
    ]
  },
  {
    term: "Model types", theme: "AI models",
    oneLiner: "Different axes: what a model outputs, handles, and how it behaves.",
    why: "Terms like 'reasoning' and 'embedding' model confuse because they describe different properties, not competing categories.",
    analogy: "One car described by different axes at once: colour, engine size, transmission — all true together.",
    connects: ["Semantic search", "Model names", "Reasoning model", "Embedding model"],
    summary: "Output (generative/embedding/predictive), modality (text/vision/multimodal), behaviour (fast/reasoning), specialisation (foundation/chat) — one model spans many.",
    nextTopics: ["Embeddings", "LLMs", "Foundation model"],
    cards: [
      { q: "Is 'reasoning model' the opposite of 'embedding model'?", a: "No — they're on different axes. Reasoning = behaviour; embedding = output. One model can be many things at once." },
      { q: "What does an embedding model output?", a: "A vector — a list of numbers representing the meaning of the input." }
    ]
  },
  {
    term: "Model names", theme: "AI models",
    oneLiner: "Which real models fall in each category (2026).",
    why: "Categories are abstract; it helps to attach real names — while remembering versions change monthly, families are stable.",
    analogy: "Brands within categories: sedans vs SUVs each have several makers.",
    connects: ["Model types", "Semantic search"],
    summary: "Generative/LLM: GPT, Claude, Gemini, Llama. Embedding: OpenAI text-embedding-3, Cohere, Voyage. Predictive: XGBoost, Random Forest.",
    nextTopics: ["Embeddings", "Foundation model", "Fine-tuning"],
    cards: [
      { q: "Name embedding-model providers.", a: "OpenAI (text-embedding-3), Cohere (embed-v4), Voyage; open-source BGE/E5." },
      { q: "Which 'model' names are actually algorithms, not brands?", a: "Predictive ones: XGBoost, Random Forest, Logistic Regression." }
    ]
  },
  {
    term: "Semantic search", theme: "AI models",
    oneLiner: "Find by meaning, not keywords — via embeddings.",
    why: "Keyword search matches exact words and misses synonyms ('car' vs 'automobile'). Semantic search matches meaning.",
    analogy: "A knowledgeable librarian who understands what you meant, vs a literal clerk who only matches exact title words.",
    connects: ["Model types", "RAG", "Vector database"],
    summary: "Text → embeddings (vectors) → stored in a vector database → find nearest neighbours by meaning.",
    nextTopics: ["Vector database", "RAG", "Hybrid search"],
    cards: [
      { q: "How does semantic search match results?", a: "By meaning — comparing embedding vectors and finding the nearest neighbours." },
      { q: "What stores the vectors for semantic search?", a: "A vector database (e.g. Pinecone, Weaviate, or vector features in Postgres/Snowflake)." }
    ]
  },
  {
    term: "RAG", theme: "AI applications",
    oneLiner: "Semantic search + a generative model = answers from your data.",
    why: "LLMs don't know your private documents. RAG retrieves the right pieces of your data and feeds them to the model to answer accurately.",
    analogy: "An open-book exam: fetch the relevant page first, then write the answer from it.",
    connects: ["Semantic search", "Parsing", "Chunking", "Retrieval", "LangChain"],
    summary: "RAG pipeline: parse (clean text) → chunk (split) → retrieve (find relevant) → LLM writes the grounded answer.",
    nextTopics: ["Chunking", "Retrieval", "Re-ranking"],
    cards: [
      { q: "What does RAG stand for and do?", a: "Retrieval-Augmented Generation — retrieve relevant data, then have an LLM answer grounded in it." },
      { q: "What are the three pre-LLM stages of RAG?", a: "Parsing (extract text), chunking (split), retrieval (find relevant pieces)." }
    ]
  },
  {
    term: "LangChain", theme: "AI applications",
    oneLiner: "Code framework to wire LLM app steps into chains.",
    why: "Real AI apps need multiple steps (embed → search → LLM). LangChain provides ready-made building blocks so you don't wire each from scratch.",
    analogy: "A box of Lego pieces for LLM apps.",
    connects: ["LangFlow", "LangGraph", "RAG", "Guardrails"],
    summary: "LangChain is the most common code framework for building LLM pipelines (chains, tools, memory, agents).",
    nextTopics: ["LangGraph", "AI agents", "RAG"],
    cards: [
      { q: "What is LangChain for?", a: "Wiring LLM application steps together into chains, with connectors, memory and agent tools." }
    ]
  },
  {
    term: "LangFlow", theme: "AI applications",
    oneLiner: "Drag-and-drop visual version of LangChain.",
    why: "Lets non-programmers or quick prototypers assemble LLM pipelines by connecting boxes instead of writing code.",
    analogy: "A recipe drawn as a flowchart you can rearrange, rather than written in text.",
    connects: ["LangChain", "n8n"],
    summary: "LangFlow is a visual, no-code canvas built on LangChain's ideas.",
    nextTopics: ["LangChain", "n8n"],
    cards: [
      { q: "LangChain vs LangFlow?", a: "LangChain is the code library; LangFlow is the drag-and-drop visual builder." }
    ]
  },
  {
    term: "LangGraph", theme: "AI applications",
    oneLiner: "Graphs with loops, branches & state — for agents.",
    why: "Simple chains run once front-to-back. Agents need to loop, branch, retry, remember state and pause for humans — LangGraph adds that control structure.",
    analogy: "A board game flowchart: you can loop back, take different paths, and keep a running score (state).",
    connects: ["LangChain", "AI agents"],
    summary: "LangGraph builds AI workflows as graphs (nodes=steps, edges=paths that can branch/loop, plus shared state) — the basis of stateful agents.",
    nextTopics: ["AI agents", "State management", "Multi-agent systems"],
    cards: [
      { q: "LangChain vs LangGraph?", a: "Chain = straight line; graph = loops + branches + shared state. LangGraph is for real agents." }
    ]
  },
  {
    term: "Guardrails", theme: "AI applications",
    oneLiner: "Safety controls on AI inputs & outputs.",
    why: "Keeps an AI app safe, on-topic and compliant — blocking toxic/off-topic requests and unsafe or wrongly-formatted answers.",
    analogy: "Guardrails on a mountain road: the car drives freely, but they stop it going off a cliff.",
    connects: ["LangChain", "MetricStream", "Hooks"],
    summary: "Guardrails check and constrain what goes into and comes out of a model; the AI-safety echo of GRC.",
    nextTopics: ["AI governance", "Hooks", "Prompt engineering"],
    cards: [
      { q: "What do guardrails do?", a: "Check and constrain AI inputs and outputs to keep them safe, on-topic and correctly formatted." }
    ]
  },
  {
    term: "Hooks", theme: "AI applications",
    oneLiner: "Your own code run at predefined moments.",
    why: "Lets you insert custom behaviour (logging, cost tracking, actions) at set points without rewriting the framework.",
    analogy: "Hooks on a wall at fixed spots — the framework decides where; you decide what to hang.",
    connects: ["LangChain", "Guardrails"],
    summary: "A hook is a predefined insertion point where your code runs automatically (before/after a step).",
    nextTopics: ["Webhooks", "Callbacks", "Event-driven design"],
    cards: [
      { q: "What is a hook?", a: "A predefined point where you insert your own code to run at a specific moment." }
    ]
  },
  {
    term: "Cursor", theme: "AI applications",
    oneLiner: "AI-first code editor for deep, multi-file work.",
    why: "Rebuilds the editor (a VS Code fork) around AI, with agent mode and multi-file editing — vs Copilot which adds AI to your existing editor.",
    analogy: "Moving into a new office designed around your assistant, vs hiring an assistant into your current office.",
    connects: ["LangGraph", "Guardrails"],
    summary: "Cursor is an AI-native code editor; GitHub Copilot is an AI plugin for your existing editor; Microsoft Copilot is a general office assistant.",
    nextTopics: ["AI agents", "MCP", "Prompt engineering"],
    cards: [
      { q: "Copilot vs Cursor in one line?", a: "GitHub Copilot adds AI to your editor (cheaper, GitHub-integrated); Cursor rebuilds the editor around AI (stronger multi-file agent work)." },
      { q: "What are the two very different 'Copilots'?", a: "Microsoft Copilot (general office/OS assistant) and GitHub Copilot (coding assistant)." }
    ]
  },
  {
    term: "n8n", theme: "AI applications",
    oneLiner: "Open-source, self-hostable workflow automation.",
    why: "Automates repetitive multi-app chores (trigger → actions) without custom code, and can run on your own servers for privacy.",
    analogy: "A digital assembly line for tasks: a trigger starts the belt, each station does one action.",
    connects: ["LangFlow", "Guardrails", "RAG"],
    summary: "n8n wires apps into automated workflows via a visual node canvas; distinctive for self-hosting, open-source, and AI/agent nodes.",
    nextTopics: ["Workflow automation", "Webhooks", "AI agents"],
    cards: [
      { q: "What makes n8n different from Zapier/Make?", a: "It's open-source and self-hostable, so data can stay in-house, and it's more developer-flexible." }
    ]
  },
  {
    term: "Software licenses", theme: "Concepts",
    oneLiner: "Permissive (do anything) vs copyleft (stay open).",
    why: "They define what you may do with code — use commercially, modify, and whether you must share your changes.",
    analogy: "A rental agreement on the code: some landlords say 'do whatever', others 'anything you build here must stay open too'.",
    connects: ["MetricStream"],
    summary: "Permissive: MIT, Apache 2.0, BSD (few strings). Copyleft: LGPL < GPL < AGPL (derivatives must stay open; AGPL even covers SaaS).",
    nextTopics: ["Copyleft vs permissive", "Dual licensing", "License compatibility"],
    cards: [
      { q: "MIT/Apache vs GPL/AGPL?", a: "MIT/Apache are permissive (do almost anything); GPL/AGPL are copyleft (your derivatives must stay open)." },
      { q: "What's special about Apache 2.0 and AGPL?", a: "Apache 2.0 adds an explicit patent grant; AGPL extends copyleft to hosted/SaaS use." }
    ]
  },
  {
    term: "SAFe", theme: "Ways of working",
    oneLiner: "Scales Agile across many teams.",
    why: "Plain Agile/Scrum works for one small team; SAFe coordinates 50–500+ people building one product without chaos.",
    analogy: "Conducting a full orchestra rather than one nimble jazz trio.",
    connects: ["Kanban", "Agile", "Scrum"],
    summary: "SAFe (Scaled Agile Framework) is built around the Agile Release Train (a synced team-of-teams) and PI Planning (joint planning every ~10 weeks).",
    nextTopics: ["Agile", "Scrum", "PI Planning"],
    cards: [
      { q: "What is SAFe's signature concept?", a: "The Agile Release Train — a synchronised 'team of teams' planning together via PI Planning." },
      { q: "Main criticism of SAFe?", a: "Its added structure and ceremonies can make Agile feel heavier and less agile." }
    ]
  },
  {
    term: "Kanban", theme: "Ways of working",
    oneLiner: "Continuous flow; visualise work, limit WIP.",
    why: "Handles continuous or unpredictable work (support, ops) that fixed Scrum sprints handle poorly.",
    analogy: "A conveyor belt: items move through stations as each frees up (from Toyota's factory system).",
    connects: ["SAFe", "Agile", "Scrum"],
    summary: "Kanban's three pillars: visualise work on a board, limit work-in-progress, and manage flow.",
    nextTopics: ["Agile", "Scrumban", "Lean"],
    cards: [
      { q: "Kanban's three core practices?", a: "Visualise work, limit work-in-progress (WIP), and manage flow." },
      { q: "Scrum vs Kanban?", a: "Scrum = fixed sprints/batches; Kanban = continuous flow, pull one item at a time." }
    ]
  },
  {
    term: "Dark factory", theme: "Concepts",
    oneLiner: "Fully automated factory with no humans on the floor.",
    why: "Runs 24/7 with no labour/lighting/heating on the floor — the leading edge of manufacturing automation.",
    analogy: "An automatic car wash scaled up to an entire factory.",
    connects: ["AI models"],
    summary: "A 'lights-out' factory run by robots + sensors/IoT + AI vision; humans only for setup, maintenance and remote oversight.",
    nextTopics: ["Industry 4.0", "IoT", "Digital twin"],
    cards: [
      { q: "Why is it called a 'dark' factory?", a: "No humans on the production floor, so no lights needed — it can run 24/7 in the dark." }
    ]
  },
  {
    term: "Confusion matrix", theme: "AI models",
    oneLiner: "Table of a classifier's right vs wrong predictions.",
    why: "Accuracy alone lies on imbalanced data; the matrix shows HOW a model is wrong (false alarms vs misses), which have different costs.",
    analogy: "A fire alarm: a false positive is annoying; a false negative (fire, no alarm) is dangerous.",
    connects: ["Model types", "Confidence score"],
    summary: "A 2×2 of TP/TN/FP/FN; source of accuracy, precision, recall and F1. FP = false alarm, FN = miss.",
    nextTopics: ["Precision vs recall", "ROC curve & AUC", "Class imbalance"],
    cards: [
      { q: "What are the four cells of a confusion matrix?", a: "True Positive, True Negative, False Positive (false alarm), False Negative (miss)." },
      { q: "Why not judge a classifier on accuracy alone?", a: "On imbalanced data it misleads — e.g. 'never spam' is 99% accurate but useless. The matrix exposes that." }
    ]
  },
  {
    term: "Confidence score", theme: "AI models",
    oneLiner: "How sure a model is about one prediction.",
    why: "Lets you set thresholds (e.g. only auto-act above 0.95) to trade off caution vs automation.",
    analogy: "A forecast of '80% chance of rain' — not just rain/no-rain, but how confident.",
    connects: ["Confusion matrix", "Model types"],
    summary: "A 0–1 certainty attached to a prediction; high confidence means sure, NOT necessarily correct.",
    nextTopics: ["Precision vs recall", "Thresholding", "Calibration"],
    cards: [
      { q: "Does a high confidence score mean the prediction is correct?", a: "No — it means the model is sure. Models can be confidently wrong." }
    ]
  },
  {
    term: "A/B testing", theme: "Concepts",
    oneLiner: "Compare two versions to see which performs better.",
    why: "Lets you decide with evidence instead of opinion: show version A to some users and B to others, then measure which wins on a chosen metric.",
    analogy: "A taste test — two recipes, split the crowd, keep the one more people prefer.",
    connects: ["Confidence score", "Confusion matrix"],
    summary: "A controlled experiment that splits users between two variants to measure which drives a target metric, judged by statistical significance.",
    nextTopics: ["Statistical significance", "p-value", "Multivariate testing"],
    cards: [
      { q: "What is A/B testing?", a: "A controlled experiment showing version A to some users and B to others, to measure which performs better on a chosen metric." },
      { q: "Why does A/B testing need statistical significance?", a: "To confirm the difference between A and B is real and not just random chance before acting on it." }
    ]
  }
];
