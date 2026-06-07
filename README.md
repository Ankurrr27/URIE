# ResuBee

Production-grade AI Resume Builder and ATS Analyzer built as one deployable Next.js 15 application.

## Architecture

ResuBee is intentionally a single full-stack Next.js codebase:

- `app/` App Router pages, server components, server actions, and route handlers
- `app/api/` backend API routes for auth, resumes, ATS analysis, AI, and LaTeX compilation
- `components/` reusable UI, dashboard, resume, ATS, and LaTeX components
- `lib/` shared auth, Prisma, validation, rate limiting, and response utilities
- `services/` business logic for resumes, PDF parsing, ATS scoring, AI calls, and LaTeX
- `store/` Zustand client state
- `prisma/` MongoDB Prisma schema and seed data
- `infra/k8s/` optional Kubernetes manifests

## Data Model

The Prisma schema includes:

- `users`: Auth.js users with role, profile metadata, and password hash for credentials auth
- `resumes`: user-owned resume records with template, contact JSON, settings JSON, and optional LaTeX source
- `resume_sections`: dynamic ordered sections with typed section categories and JSON content
- `career_nodes`: reusable universal resume facts that can be selected into many targeted resumes
- `templates`: public resume templates grouped by ATS, modern, executive, technical, and LaTeX categories
- `job_descriptions`: saved target roles with extracted keyword arrays
- `ats_scores`: score history with matched keywords, missing keywords, strengths, suggestions, and extracted resume text

Auth.js support tables are also present: `accounts`, `sessions`, and `verification_tokens`.

## API Routes

- `POST /api/auth/signup`: create a credentials account
- `GET|POST /api/auth/[...nextauth]`: Auth.js handlers
- `GET|POST /api/resumes`: paginated resume list and resume creation
- `GET|PATCH|DELETE /api/resumes/:id`: resume detail, update, delete
- `POST|PATCH /api/resumes/:id/sections`: create section and reorder sections
- `GET|POST /api/career-nodes`: search/create universal resume nodes or compose a resume with `?action=compose`
- `PATCH|DELETE /api/career-nodes/:id`: update or remove a reusable career node
- `POST /api/ats/analyze`: upload PDF, parse text, compare to job description, persist score
- `POST /api/ai/summary`: generate professional summaries
- `POST /api/ai/bullets`: improve resume bullets
- `POST /api/ai/skills`: suggest relevant skills
- `POST /api/latex/compile`: compile LaTeX when enabled in the runtime

## ATS Scoring

The initial scoring engine is deterministic and production-friendly:

- Extracts normalized keywords from the job description
- Compares keyword coverage against extracted PDF text
- Adds format signals for expected resume sections
- Adds impact-language signals for metrics and action verbs
- Persists complete analysis history per user

The service boundary in `services/ats.ts` is designed to be upgraded with embeddings, taxonomy matching, or model-assisted scoring without changing the API contract.

## Recommended Libraries

- `next-auth` and `@auth/prisma-adapter` for authentication
- `prisma` and `@prisma/client` for MongoDB access
- `zod` for validation
- `zustand` for editor state
- `pdf-parse` for PDF text extraction
- `openai` for AI resume generation
- `@monaco-editor/react` for LaTeX editing
- `@radix-ui/*`, `class-variance-authority`, and Tailwind for shadcn-style UI

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start MongoDB:

```bash
docker compose up -d mongo
```

4. Push the Prisma schema and seed templates:

```bash
npm run db:push
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Docker Deployment

Build and run the single deployable application with MongoDB:

```bash
docker compose up --build
```

For production, replace `AUTH_SECRET`, configure `AUTH_URL`, and use MongoDB Atlas or another durable MongoDB deployment.

## Kubernetes

The optional manifests live in `infra/k8s/`:

```bash
kubectl apply -f infra/k8s/secret.example.yaml
kubectl apply -f infra/k8s/deployment.yaml
kubectl apply -f infra/k8s/service.yaml
kubectl apply -f infra/k8s/ingress.yaml
```

Push the Prisma schema as a release job or CI/CD step before rolling out a new image:

```bash
npx prisma db push
```

## Production Notes

- Use a 32-byte random `AUTH_SECRET`.
- Set `OPENAI_API_KEY` only in server-side deployment secrets.
- Keep `LATEX_COMPILE_ENABLED=false` unless the runtime includes a hardened TeX installation.
- Replace the in-memory rate limiter with Redis or another shared store for multi-replica production.
- Store uploaded PDFs in object storage if long-term retention is needed; the current analyzer parses uploads directly and persists extracted text plus scoring output.
