# KnowledgeFlow AI - Backend API

KnowledgeFlow AI is an intelligent document management system featuring Retrieval-Augmented Generation (RAG). It enables organizations to upload documents and query them using natural language via an integrated LLM.

## Architecture & Tech Stack

This backend follows an N-Tier architecture pattern (`Controller` -> `Service` -> `Repository`) to cleanly separate routing/validation, business logic, and database operations.

- **Framework**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Vector Database**: Qdrant (Local)
- **Validation**: Yup schemas + Express middleware
- **Authentication**: JWT & OTP-based verification
- **LLM / Embeddings**: Ollama (`qwen3:4b` for chat, `nomic-embed-text` for embeddings)

---

## Directory Structure

```text
src/
├── config/           # Centralized configuration (env variables, DB, Qdrant, Mail)
├── middlewares/      # Express middlewares (Validation, Auth, RBAC, Error Handling)
├── modules/          # Feature modules (Auth, Collections, Documents, Chat)
│   └── [module]/
│       ├── [module].routes.ts       # Route definitions
│       ├── [module].controller.ts   # Request/Response handlers
│       ├── [module].service.ts      # Core business logic
│       └── [module].repository.ts   # Database interaction (Prisma)
├── services/         # Shared, standalone services (PDF parsing, chunking, AI, Embeddings)
├── templates/        # Email templates
├── types/            # Shared TypeScript interfaces
└── validations/      # Yup validation schemas
```

---

## Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Local Qdrant Instance (`docker run -p 6333:6333 qdrant/qdrant`)
- Local Ollama Instance with models installed:
  ```bash
  ollama pull nomic-embed-text
  ollama pull qwen3:4b
  ```

---

## Installation & Setup

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Run Prisma Migrations:**

   ```bash
   npx prisma migrate dev
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Development Patterns

- **Validation:** All incoming requests must be validated using `validateRequest` middleware along with a Yup schema from `src/validations/`.
- **Error Handling:** Avoid generic `try/catch` in controllers. Wrap controller functions with `express-async-handler` and throw an `ApiError`. The global `errorHandler.middleware.ts` will format and send the response.
- **Environment Variables:** All environment variables are strictly typed and validated in `src/config/env.ts`. Import `env` from this file instead of using `process.env`.
