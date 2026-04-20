# AI Integration Architecture

This document describes the flow for automatically capturing community travel reports from Telegram and surfacing them through an AI Chatbot.

## 1. Automated Data Capture Flow

This sequence shows how a casual message in the Telegram group becomes a structured data point in our database.

```mermaid
sequenceDiagram
    participant User as Community Member
    participant TG as Telegram Bot API
    participant App as Next.js API (Route Handler)
    participant AI as Gemini AI (Extraction)
    participant DB as Neon Database

    User->>TG: "Just got my Japan visa in 2 days from the NYC embassy! Used my RTD."
    TG-->>App: HTTP POST (Webhook Payload)
    App->>AI: analyzeMessage(text)
    Note over AI: AI extracts: { country: "Japan", embassy: "NYC", time: "2 days" }
    AI-->>App: Structured JSON Data
    App->>DB: INSERT INTO experiences (...)
    Note over DB: Data is now live on the site!
```

## 2. AI Chatbot Query Flow (RAG)

This shows how the chatbot uses the community data to answer user questions.

```mermaid
graph TD
    User((User)) -->|Ask Question| ChatUI[Chat Interface]
    ChatUI -->|Fetch Context| DB[(Neon Database)]
    DB -->|Latest Reports| Context[Context Payload]
    Context -->|Question + Context| Gemini[Gemini AI]
    Gemini -->|Natural Language Answer| ChatUI
    ChatUI -->|Display| User

    subgraph "The Prompt"
    P[System Prompt: 'Use ONLY the data provided below to answer...']
    end
    P -.-> Gemini
```

## Key Technologies
- **Gemini 1.5 Flash:** For lightning-fast data extraction and natural language answers.
- **Telegram Bot API:** To listen to group messages.
- **Neon PostgreSQL:** The persistent source of truth for community wisdom.
- **Next.js Route Handlers:** To handle the incoming webhooks from Telegram.
