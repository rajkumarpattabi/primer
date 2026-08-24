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
  },
  {
    term: "Model drift", theme: "AI models",
    oneLiner: "A model gets worse as the world changes around it.",
    why: "A model is trained on past data; when real-world patterns shift (new behaviour, prices, fraud tactics), its predictions quietly degrade unless it's monitored and retrained.",
    analogy: "A map of a city that slowly goes stale as new roads are built — still usable at first, wrong over time.",
    connects: ["Confusion matrix", "Confidence score", "Model types"],
    summary: "Model drift is the silent decay of a deployed model's accuracy as live data diverges from its training data; the fix is monitoring plus retraining.",
    nextTopics: ["Data drift vs concept drift", "Model monitoring", "Retraining pipelines"],
    cards: [
      { q: "What is model drift?", a: "The gradual drop in a deployed model's accuracy as real-world data drifts away from what it was trained on." },
      { q: "How do you deal with model drift?", a: "Monitor performance in production and retrain the model on fresh data when it degrades." }
    ]
  },
  {
    term: "Hallucinations", theme: "AI models",
    oneLiner: "When an AI states false things as if confidently true.",
    why: "Language models predict plausible-sounding text, not verified facts — so they can invent details, citations or answers that look right but aren't.",
    analogy: "A smooth talker who never says 'I don't know' — always gives a confident answer, sometimes made up.",
    connects: ["Confidence score", "RAG", "Guardrails", "Model types"],
    summary: "Hallucination is an AI generating confident but false or fabricated content; grounding it with RAG and guardrails reduces it.",
    nextTopics: ["RAG", "Grounding", "Prompt engineering"],
    cards: [
      { q: "What is an AI hallucination?", a: "When a model produces false or fabricated information stated as if it were true." },
      { q: "Why do hallucinations happen?", a: "Models predict plausible text, not verified facts, so they can invent confident-sounding but wrong answers." },
      { q: "How can hallucinations be reduced?", a: "Ground the model in real sources (RAG), add guardrails, and ask for citations." }
    ]
  },
  {
    term: "Explainability", theme: "AI models",
    oneLiner: "Understanding WHY an AI made a given decision.",
    why: "Many models are 'black boxes'. In regulated or high-stakes uses (loans, hiring, health) you must be able to justify a decision, spot bias, and build trust.",
    analogy: "A doctor who not only gives a diagnosis but explains the symptoms and reasoning behind it.",
    connects: ["Model types", "Collibra", "MetricStream", "Confusion matrix"],
    summary: "Explainability (XAI) is the ability to show why a model produced an output — essential for trust, debugging, fairness and compliance.",
    nextTopics: ["SHAP & LIME", "Bias & fairness", "AI governance"],
    cards: [
      { q: "What is explainability in AI?", a: "The ability to understand and justify why a model made a particular decision, rather than treating it as a black box." },
      { q: "Why does explainability matter?", a: "For trust, debugging, detecting bias, and meeting regulations in high-stakes decisions like loans or healthcare." }
    ]
  },
  {
    term: "AI agents", theme: "AI applications",
    oneLiner: "An AI that can plan, use tools and act toward a goal.",
    why: "A plain chatbot only answers. An agent is given a goal and can decide steps, call tools (search, code, APIs), check results and keep going until it's done.",
    analogy: "A capable assistant you hand a goal to — 'book my trip' — who then figures out and does the steps, not just answers questions.",
    connects: ["Agentic AI", "LangGraph", "LangChain", "Guardrails"],
    summary: "An AI agent is a single autonomous actor: an LLM plus tools and a loop of plan → act → observe → repeat, working toward a goal.",
    nextTopics: ["Agentic AI", "Multi-agent systems", "Tool use / function calling"],
    cards: [
      { q: "How is an AI agent different from a chatbot?", a: "A chatbot only responds; an agent is given a goal and autonomously plans, uses tools, and acts in a loop until it's achieved." },
      { q: "What is an AI agent made of?", a: "An LLM 'brain' plus tools it can call and a plan → act → observe loop." }
    ]
  },
  {
    term: "Agentic AI", theme: "AI applications",
    oneLiner: "The paradigm of AI that acts autonomously, not just answers.",
    why: "It names the broader shift from AI that responds to prompts toward AI systems that pursue goals over many steps — often coordinating several agents and tools.",
    analogy: "'AI agent' is one self-directed employee; 'agentic AI' is running the whole operation with self-directed staff — the approach, not a single worker.",
    connects: ["AI agents", "LangGraph", "Guardrails"],
    summary: "Agentic AI is the design approach/property of goal-driven, autonomous, multi-step AI systems; an 'AI agent' is a single actor within that paradigm.",
    nextTopics: ["Multi-agent systems", "Orchestration frameworks", "Human-in-the-loop"],
    cards: [
      { q: "Agentic AI vs an AI agent?", a: "An AI agent is one autonomous actor; agentic AI is the broader paradigm of building systems that act autonomously — often many agents together." },
      { q: "What defines 'agentic' behaviour?", a: "Goal-driven, autonomous, multi-step action with tool use — rather than one-shot responses to prompts." }
    ]
  },
  {
    term: "Precision vs recall", theme: "AI models",
    oneLiner: "Two ways to be right — avoiding false alarms vs misses.",
    why: "One accuracy number hides the trade-off between two kinds of mistake; precision and recall separate them so you can optimise for the one that matters.",
    analogy: "Fishing with a net: precision = how much of your catch is the fish you wanted; recall = how many of all the fish in the lake you actually caught.",
    connects: ["Confusion matrix", "Confidence score", "A/B testing"],
    summary: "Precision = of the items flagged positive, how many were right; recall = of all real positives, how many you caught. Raising one usually lowers the other.",
    nextTopics: ["F1 score", "ROC curve & AUC", "Thresholding"],
    cards: [
      { q: "What is precision?", a: "Of everything the model flagged as positive, the fraction that was actually correct (few false alarms)." },
      { q: "What is recall?", a: "Of all the real positives, the fraction the model actually caught (few misses)." },
      { q: "Why can't you always maximise both?", a: "They trade off — being stricter raises precision but lowers recall, and vice versa; F1 balances them." }
    ]
  },
  {
    term: "MLOps", theme: "Ways of working",
    oneLiner: "DevOps for machine-learning models in production.",
    why: "Getting a model into production and keeping it healthy (deploying, monitoring, retraining as it drifts) needs its own practices beyond normal software delivery.",
    analogy: "A pit crew for a race car: not just building it, but constantly refuelling, checking and tuning it while it runs.",
    connects: ["Model drift", "DevSecOps", "FinOps", "Databricks"],
    summary: "MLOps is the set of practices and tooling to reliably deploy, monitor, and retrain ML models in production — DevOps adapted for models and data.",
    nextTopics: ["Model drift", "Model monitoring", "CI/CD"],
    cards: [
      { q: "What is MLOps?", a: "Practices for reliably deploying, monitoring and retraining machine-learning models in production — DevOps applied to ML." },
      { q: "Why does ML need its own 'ops'?", a: "Models degrade as data drifts and depend on data + retraining, so they need monitoring and pipelines beyond normal software delivery." }
    ]
  },
  {
    term: "DevSecOps", theme: "Ways of working",
    oneLiner: "Building security into development, not bolting it on.",
    why: "Treating security as a final gate causes late, costly surprises; DevSecOps bakes security checks into every step of the build-and-ship pipeline.",
    analogy: "Food safety checked at every stage of the kitchen, not just one inspector at the exit door.",
    connects: ["MLOps", "FinOps", "Guardrails"],
    summary: "DevSecOps extends DevOps by embedding automated security throughout the development lifecycle — 'shift security left' so issues are caught early.",
    nextTopics: ["DevOps", "Shift-left security", "CI/CD"],
    cards: [
      { q: "What does DevSecOps add to DevOps?", a: "Security built into every stage of the pipeline (automated scans, checks) instead of a final gate." },
      { q: "What does 'shift security left' mean?", a: "Catch security issues early in development rather than late before release." }
    ]
  },
  {
    term: "FinOps", theme: "Ways of working",
    oneLiner: "Managing and optimising cloud spend as a team practice.",
    why: "Cloud costs are easy to run up and hard to see; FinOps gives engineering, finance and business a shared way to track, allocate and reduce spend.",
    analogy: "A household budget for the cloud — everyone can see the bill and is accountable for their share.",
    connects: ["MLOps", "DevSecOps"],
    summary: "FinOps is the practice of bringing financial accountability to variable cloud spend, so teams make cost-aware decisions without slowing down.",
    nextTopics: ["Cloud cost optimisation", "Showback vs chargeback", "Unit economics"],
    cards: [
      { q: "What is FinOps?", a: "A practice for managing and optimising cloud spend collaboratively across engineering, finance and business." },
      { q: "MLOps vs DevSecOps vs FinOps in one line?", a: "MLOps runs ML models reliably; DevSecOps builds security into delivery; FinOps controls cloud cost — three 'ops' disciplines for different concerns." }
    ]
  },
  {
    term: "Data drift", theme: "AI models",
    oneLiner: "The model's input data changes over time.",
    why: "A model expects inputs that look like its training data; when the incoming data's patterns shift (new users, seasons, formats), predictions degrade even if the underlying rule hasn't changed.",
    analogy: "A tailor who sizes suits from last year's measurements — the customers changed shape, so the fits are off.",
    connects: ["Concept drift", "Model drift", "MLOps"],
    summary: "Data drift is a change in the distribution of a model's INPUTS over time; the relationship being predicted may still hold, but the data feeding it looks different.",
    nextTopics: ["Concept drift", "Model monitoring", "Retraining pipelines"],
    cards: [
      { q: "What is data drift?", a: "When the distribution of the model's input data shifts away from what it was trained on." },
      { q: "Data drift vs concept drift?", a: "Data drift = the inputs change; concept drift = the input→output relationship itself changes." }
    ]
  },
  {
    term: "Concept drift", theme: "AI models",
    oneLiner: "The rule linking inputs to outputs changes over time.",
    why: "Even with the same kind of inputs, what they MEAN can change (e.g. what counts as 'fraud' or 'spam' evolves), so a once-accurate model becomes wrong.",
    analogy: "A fraud detector trained before a new scam existed — the inputs look normal, but the meaning of 'suspicious' has moved.",
    connects: ["Data drift", "Model drift", "MLOps"],
    summary: "Concept drift is a change in the input→output relationship itself; the model's learned rule no longer matches reality, so it must be retrained.",
    nextTopics: ["Data drift", "Model monitoring", "Retraining pipelines"],
    cards: [
      { q: "What is concept drift?", a: "When the relationship between inputs and the correct output changes over time, making the model's learned rule wrong." },
      { q: "Which drift is about meaning changing, not the data?", a: "Concept drift — the input→output rule shifts, even if the inputs look similar." }
    ]
  },
  {
    term: "Red teaming", theme: "Governance",
    oneLiner: "Deliberately attacking a system to find its weaknesses.",
    why: "The best way to know how something fails is to try to break it on purpose; for AI, red teams probe a model for harmful, biased, or manipulable behaviour before attackers or users hit it in the wild.",
    analogy: "Hiring ethical burglars to test your locks before real thieves do.",
    connects: ["Guardrails", "Hallucinations", "Explainability", "MetricStream"],
    summary: "Red teaming is adversarial testing — experts intentionally try to make a system (or AI model) misbehave, exposing risks so they can be fixed.",
    nextTopics: ["Guardrails", "Jailbreaking", "AI governance"],
    cards: [
      { q: "What is red teaming?", a: "Deliberately attacking or stress-testing a system to uncover weaknesses before real adversaries do." },
      { q: "Why red team an AI model?", a: "To find harmful, biased or manipulable outputs (e.g. jailbreaks) before release, so guardrails can be added." }
    ]
  },
  {
    term: "Model monitoring", theme: "AI models",
    oneLiner: "Watching a live model's accuracy and inputs over time.",
    why: "Models silently degrade in production as data shifts; monitoring tracks predictions, inputs and outcomes so the drop is caught early.",
    analogy: "A hospital monitor that beeps when a patient's vitals slip out of range.",
    connects: ["Model drift", "Data drift", "Concept drift", "MLOps", "Retraining pipelines"],
    summary: "Continuously tracking a deployed model's performance and input data so degradation is detected and fixed.",
    nextTopics: ["Retraining pipelines", "Data drift", "Confusion matrix"],
    cards: [
      { q: "Why monitor a model in production?", a: "Accuracy silently decays as data drifts; monitoring catches the drop early." },
      { q: "What does model monitoring track?", a: "Predictions, input distributions, and real-world outcomes vs expectations." }
    ]
  },
  {
    term: "Retraining pipelines", theme: "AI models",
    oneLiner: "Automated flow to refresh a model on new data.",
    why: "When a model drifts you must retrain it on fresh data; a pipeline automates that repeatedly instead of by hand.",
    analogy: "A dishwasher cycle for your model — feed in new data, get a refreshed model out, on schedule.",
    connects: ["Model drift", "Model monitoring", "MLOps"],
    summary: "An automated sequence that retrains, validates and redeploys a model on new data to counter drift.",
    nextTopics: ["MLOps", "Model monitoring", "Data drift"],
    cards: [
      { q: "What is a retraining pipeline?", a: "An automated flow that retrains, validates and redeploys a model on fresh data." },
      { q: "Why automate retraining?", a: "Models drift over time; automation keeps them current without manual rework." }
    ]
  },
  {
    term: "SHAP & LIME", theme: "AI models",
    oneLiner: "Techniques that explain individual model predictions.",
    why: "Black-box models don't say why; SHAP and LIME estimate how much each input feature pushed a specific prediction, making it interpretable.",
    analogy: "An itemised receipt showing which items made up the total.",
    connects: ["Explainability", "Model types", "Confusion matrix"],
    summary: "SHAP and LIME attribute a model's prediction to its input features — the practical tools of explainability.",
    nextTopics: ["Explainability", "Bias & fairness", "Feature importance"],
    cards: [
      { q: "What do SHAP and LIME do?", a: "Explain a model's prediction by estimating each input feature's contribution." },
      { q: "Which concept do SHAP/LIME serve?", a: "Explainability — turning a black-box output into an interpretable one." }
    ]
  },
  {
    term: "Showback vs chargeback", theme: "Ways of working",
    oneLiner: "Two ways to make teams see their cloud costs.",
    why: "To control cloud spend you attribute it to teams; showback just reports each team's cost, chargeback actually bills it to them.",
    analogy: "Showback = showing each flatmate their share of the bill; chargeback = actually making them pay it.",
    connects: ["FinOps"],
    summary: "Showback reports cost per team for awareness; chargeback financially charges them — two FinOps accountability models.",
    nextTopics: ["FinOps", "Cloud cost optimisation", "Unit economics"],
    cards: [
      { q: "Showback vs chargeback?", a: "Showback shows each team its cost (awareness); chargeback actually bills the cost to them." }
    ]
  },
  {
    term: "ROC curve & AUC", theme: "AI models",
    oneLiner: "A curve and score summarising a classifier at all thresholds.",
    why: "A classifier's quality depends on the chosen threshold; the ROC curve plots the trade-offs across all thresholds and AUC boils it into one number.",
    analogy: "A car's full performance graph across all speeds, plus a single overall rating.",
    connects: ["Confusion matrix", "Precision vs recall", "Confidence score", "Thresholding"],
    summary: "ROC plots true-positive vs false-positive rate across thresholds; AUC (area under it, 0.5–1) is a single threshold-independent score.",
    nextTopics: ["Precision vs recall", "Thresholding", "F1 score"],
    cards: [
      { q: "What does AUC measure?", a: "Overall classifier quality across all thresholds — 1.0 perfect, 0.5 random." },
      { q: "What does the ROC curve show?", a: "True-positive rate vs false-positive rate as the decision threshold varies." }
    ]
  },
  {
    term: "F1 score", theme: "AI models",
    oneLiner: "One number balancing precision and recall.",
    why: "Precision and recall trade off; F1 combines them into a single score so you can compare models when both matter.",
    analogy: "A combined grade for a student strong in both accuracy and coverage, not just one.",
    connects: ["Precision vs recall", "Confusion matrix", "ROC curve & AUC"],
    summary: "F1 is the harmonic mean of precision and recall; high only when both are high — useful on imbalanced data.",
    nextTopics: ["Precision vs recall", "ROC curve & AUC", "Class imbalance"],
    cards: [
      { q: "What is the F1 score?", a: "The harmonic mean of precision and recall — a single balanced metric." },
      { q: "When is F1 useful?", a: "When classes are imbalanced and both false alarms and misses matter." }
    ]
  },
  {
    term: "Thresholding", theme: "AI models",
    oneLiner: "Choosing the cutoff that turns a score into a decision.",
    why: "Models output a probability; you must pick the cutoff above which it counts as a 'yes' — and that choice trades precision against recall.",
    analogy: "Setting how sensitive a smoke alarm is — too low means nuisance alarms, too high means missed fires.",
    connects: ["Confidence score", "Precision vs recall", "ROC curve & AUC", "Confusion matrix"],
    summary: "Thresholding sets the probability cutoff for a positive decision; moving it shifts the precision/recall balance.",
    nextTopics: ["Precision vs recall", "ROC curve & AUC", "Confidence score"],
    cards: [
      { q: "What is thresholding?", a: "Picking the score cutoff above which a prediction counts as positive." },
      { q: "What does changing the threshold affect?", a: "The precision/recall balance — and thus the confusion matrix." }
    ]
  },
  {
    term: "Chunking", theme: "AI applications",
    oneLiner: "Splitting documents into pieces for retrieval.",
    why: "You can't embed a whole document as one vector; chunking cuts text into focused pieces so search can return the right passage.",
    analogy: "Cutting a long book into labelled index cards you can pull individually.",
    connects: ["RAG", "Retrieval", "Semantic search"],
    summary: "Chunking breaks source text into right-sized, often overlapping pieces so retrieval is precise; chunk size is the key tuning knob.",
    nextTopics: ["Retrieval", "Re-ranking", "Semantic search"],
    cards: [
      { q: "Why chunk documents in RAG?", a: "So retrieval returns focused passages; a whole document is too big to embed or search precisely." },
      { q: "What's the main chunking trade-off?", a: "Too big = noisy/imprecise; too small = missing context. Overlap helps." }
    ]
  },
  {
    term: "Retrieval", theme: "AI applications",
    oneLiner: "Fetching the most relevant pieces to answer a query.",
    why: "RAG must find the right chunks before the model answers; retrieval ranks and returns the best-matching pieces.",
    analogy: "A librarian pulling the few relevant books before you write your essay.",
    connects: ["RAG", "Chunking", "Semantic search", "Re-ranking"],
    summary: "Retrieval is the step that finds and ranks the most relevant chunks (dense, keyword, or hybrid) to feed the model.",
    nextTopics: ["Re-ranking", "Hybrid search", "Chunking"],
    cards: [
      { q: "What does retrieval do in RAG?", a: "Finds and ranks the most relevant chunks for the query before the LLM answers." },
      { q: "Dense vs sparse retrieval?", a: "Dense = by meaning (embeddings); sparse = by exact keywords; hybrid combines both." }
    ]
  },
  {
    term: "Re-ranking", theme: "AI applications",
    oneLiner: "Reordering retrieved results by true relevance.",
    why: "First-pass retrieval is fast but rough; a re-ranker re-scores the top results more carefully so the best ones rise to the top.",
    analogy: "A quick sift grabs a shortlist; a picky judge then reorders the finalists.",
    connects: ["Retrieval", "RAG", "Semantic search"],
    summary: "Re-ranking is a second, more accurate scoring pass over retrieved candidates — often the biggest easy win for RAG precision.",
    nextTopics: ["Retrieval", "Hybrid search", "Chunking"],
    cards: [
      { q: "What is re-ranking?", a: "A second, more precise scoring pass that reorders the top retrieved results." },
      { q: "Why re-rank?", a: "Fast retrieval is rough; re-ranking sharpens which results are actually most relevant." }
    ]
  },
  {
    term: "State management", theme: "AI applications",
    oneLiner: "Tracking data that persists across steps.",
    why: "Multi-step programs and agents must remember what happened so far; state management is how that memory is stored and updated between steps.",
    analogy: "A running scoreboard everyone updates as a game progresses.",
    connects: ["LangGraph", "AI agents", "Agentic AI"],
    summary: "State management keeps and updates the shared 'memory' a multi-step workflow or agent carries between steps.",
    nextTopics: ["LangGraph", "Multi-agent systems", "Human-in-the-loop"],
    cards: [
      { q: "What is state in an agent workflow?", a: "The shared, evolving memory of progress carried between steps." }
    ]
  },
  {
    term: "Multi-agent systems", theme: "AI applications",
    oneLiner: "Several AI agents cooperating on a task.",
    why: "One agent struggles with big, varied jobs; splitting work across specialised agents that coordinate can be more capable and modular.",
    analogy: "A project team of specialists — researcher, writer, reviewer — instead of one generalist.",
    connects: ["AI agents", "Agentic AI", "Orchestration frameworks", "LangGraph"],
    summary: "Multi-agent systems coordinate several specialised agents (often with roles and messaging) to solve a task together.",
    nextTopics: ["Orchestration frameworks", "AI agents", "Human-in-the-loop"],
    cards: [
      { q: "What is a multi-agent system?", a: "Several AI agents, often specialised, coordinating to complete a task." },
      { q: "Why use multiple agents?", a: "To divide complex work into specialised, modular roles that collaborate." }
    ]
  },
  {
    term: "Orchestration frameworks", theme: "AI applications",
    oneLiner: "Tools that coordinate AI agents and steps.",
    why: "Running agents, tools and multi-step flows reliably needs plumbing; orchestration frameworks manage the control flow, state and tool calls.",
    analogy: "A conductor keeping every musician in time and on cue.",
    connects: ["LangGraph", "LangChain", "Multi-agent systems", "AI agents"],
    summary: "Orchestration frameworks (e.g. LangGraph, CrewAI, AutoGen) coordinate the steps, state and tools of agentic AI systems.",
    nextTopics: ["LangGraph", "Multi-agent systems", "AI agents"],
    cards: [
      { q: "What do orchestration frameworks do?", a: "Coordinate the steps, state and tool calls of agents and multi-step AI systems." }
    ]
  },
  {
    term: "Human-in-the-loop", theme: "AI applications",
    oneLiner: "A person reviews or approves AI actions.",
    why: "For risky or uncertain steps, a human checkpoint keeps an autonomous system safe and correct before it acts.",
    analogy: "A learner driver with an instructor who can grab the wheel.",
    connects: ["Guardrails", "AI agents", "Agentic AI", "Red teaming"],
    summary: "Human-in-the-loop inserts a person to review, correct or approve at key points, balancing automation with oversight.",
    nextTopics: ["Guardrails", "Multi-agent systems", "Red teaming"],
    cards: [
      { q: "What is human-in-the-loop?", a: "Inserting a human to review or approve AI decisions at critical points." },
      { q: "Why use it?", a: "To keep autonomous systems safe and correct on risky or uncertain steps." }
    ]
  },
  {
    term: "CAP theorem", theme: "Concepts",
    oneLiner: "Pick two: consistency, availability, partition tolerance.",
    why: "In a distributed system that can lose network links, you can't have perfect consistency and availability at once — CAP names that unavoidable trade-off.",
    analogy: "Two shops that can't phone each other: either stop selling to stay in sync, or keep selling and risk disagreeing.",
    connects: ["ACID", "Data lake"],
    summary: "CAP theorem: during a network partition a distributed store must choose between consistency and availability — you can't have both.",
    nextTopics: ["ACID", "BASE / eventual consistency", "Distributed systems"],
    cards: [
      { q: "What does CAP theorem state?", a: "During a network partition, a distributed system must trade off consistency vs availability." },
      { q: "What do C, A and P stand for?", a: "Consistency, Availability, Partition tolerance." }
    ]
  },
  {
    term: "Multithreading", theme: "Concepts",
    oneLiner: "Running several tasks at once within one program.",
    why: "A single-threaded program does one thing at a time and stalls while waiting; multithreading runs several threads concurrently, using multi-core CPUs and staying responsive.",
    analogy: "One cook working several burners at once instead of finishing one dish before starting the next.",
    connects: ["ACID", "CAP theorem"],
    summary: "Multithreading splits a program into concurrent threads so work overlaps — faster and more responsive, but shared data must be guarded from race conditions.",
    nextTopics: ["Concurrency vs parallelism", "Race conditions", "Async / await"],
    cards: [
      { q: "What is multithreading?", a: "Running multiple threads (tasks) concurrently within one program, so work overlaps instead of running one at a time." },
      { q: "What's the main risk of multithreading?", a: "Threads sharing data can collide (race conditions), so access must be synchronised (e.g. locks)." }
    ]
  }
];
