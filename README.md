# KnowSlope

**Live at [knowslope.com](https://knowslope.com)**

**Transform team knowledge buried in chat into structured, searchable documentation — automatically.**

KnowSlope captures unstructured knowledge from Slack threads, screenshots, and ad-hoc decisions, then uses AI to convert them into structured **Knows**: publishable, discoverable knowledge assets that live beyond the chat window.

---

## The Problem

Institutional knowledge dies in chat. Engineering decisions, support runbooks, QA edge cases, product tradeoffs — all of it gets buried in Slack threads that no one can find six months later. Copy-pasting into Notion or Confluence is manual, inconsistent, and nobody does it consistently.

**KnowSlope solves this by making capture and structuring automatic.**

---

## Core Concepts

### Know
A **Know** is a structured knowledge asset — a single unit of documented truth extracted from real team conversations. Knows are categorized, tagged, and searchable. They replace the "ask someone who was in that meeting" pattern with something actually discoverable.

### Slope
A **Slope** is a reusable intent + rules + output shape that guides AI drafting. It's not just a prompt — it encodes your team's tone, formatting standards, and policies. When a new Know is drafted from a Slack thread, the right Slope ensures the output matches your team's standards without manual reformatting every time.

### KnowSlope
The hub where Knows live — organized by category, type, and status, searchable and accessible to the right people based on their role.

---

## Features

- **Slack Integration** — Connect your workspace via OAuth. Incoming threads are captured via webhook and queued for processing.
- **AI-Powered Drafting** — Edge Functions analyze Slack threads and generate structured Know drafts using the team's configured Slopes.
- **Incoming Items Queue** — A dedicated review queue where captured Slack items wait to be processed, edited, and published.
- **Wizard-Style Doc Creation** — Step-by-step flow for creating Knows manually with inline preview and category selection.
- **Role-Based Access** — Admin, Publisher, and Member roles with whitelist-controlled publishing permissions.
- **Card-Based Dashboard** — Filter Knows by category, type, and status. Full-text search across the knowledge base.
- **Dark-Themed UI** — Typography-led design with kinetic scroll animations, glassmorphism cards, and consistent design tokens.
- **Mobile Responsive** — Clean filter/search UX that works on any screen size.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + Row Level Security) |
| Edge Functions | Deno / Supabase Functions |
| Auth | Supabase Auth |
| Integrations | Slack OAuth, Slack Webhooks |

---

## Project Structure

```
src/
├── components/
│   ├── landing/        # Marketing page sections and animations
│   ├── document/       # Know editor and preview components
│   └── ui/             # shadcn/ui primitives
├── pages/
│   ├── Landing.tsx     # Public marketing page
│   ├── Index.tsx       # Dashboard (authenticated)
│   ├── NewDocWizard.tsx
│   ├── DocumentDetail.tsx
│   ├── DocumentEdit.tsx
│   ├── SlackSetup.tsx
│   └── Settings.tsx
├── hooks/              # Data fetching and state hooks
├── contexts/           # Auth context
└── integrations/
    └── supabase/       # Generated types and client

supabase/
├── functions/          # Edge Functions
│   ├── slack-oauth/
│   ├── slack-webhook/
│   ├── analyze-slack-thread/
│   ├── process-incoming-item/
│   ├── generate-know-preview/
│   └── store-slack-credentials/
└── migrations/         # Database schema history
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project
- A Slack app with OAuth and webhook permissions configured

### Installation

```sh
# Clone the repo
git clone https://github.com/hshardik/Knowslope.git
cd Knowslope

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase credentials in .env

# Start the dev server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Supabase Setup

Push the migrations to your Supabase project:

```sh
npx supabase db push
```

Deploy the Edge Functions:

```sh
npx supabase functions deploy
```

---

## User Flow

```
Connect Slack workspace
        ↓
Incoming threads captured via webhook
        ↓
Items appear in the Incoming Queue
        ↓
AI drafts a Know using the matching Slope
        ↓
Reviewer edits and refines
        ↓
Publisher approves and publishes
        ↓
Know is searchable in the KnowSlope dashboard
```

---

## Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access — manage members, Slopes, settings, and publish |
| **Publisher** | Create, edit, and publish Knows |
| **Member** | Read and search published Knows |

Publishing is whitelist-controlled. Admins manage who holds Publisher access.

---

## Who It's For

KnowSlope is built for teams where knowledge gets lost in chat:

- **QA teams** — capture edge cases and regression context from Slack threads
- **Support teams** — turn recurring issue discussions into searchable runbooks
- **Product teams** — preserve decision rationale and tradeoff discussions
- **Engineering teams** — document architectural decisions and tribal knowledge before it walks out the door

---

## License

MIT
