# AdGenie 🧞‍♂️

AdGenie is an AI-powered browser extension and web tool designed for e-commerce sellers. It instantly generates engaging, persuasive, and SEO-friendly product descriptions, and includes an **LLM Judge** to evaluate the quality and safety of the generated content.


## Architecture

The system consists of a browser extension frontend that communicates with a local Python/Flask backend, which in turn leverages OpenAI's models for content generation and evaluation.

```mermaid
graph TD
    subgraph "Client Side"
        A[Browser Extension] -->|POST /api/generate| B(Flask Backend)
        A -->|POST /api/judge| B
    end

    subgraph "Server Side (Local)"
        B[Flask App (app.py)]
    end

    subgraph "External Services"
        B -->|ChatCompletion| C[OpenAI API / Azure OpenAI]
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
```

## Features

- **Generate Descriptions**: Create multiple options based on product title, features, tone, and keywords.
- **Image Support**: Upload product images to enhance generation (multimodal).
- **LLM Judge**: Automatically evaluate generated descriptions for relevance, tone, safety, and SEO, giving a score out of 10.



## Setup

### Prerequisites

- Python 3.12+
- `uv` (for dependency management)
- OpenAI API Key

### Backend Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd ad-genie
    ```

2.  **Install dependencies**:
    ```bash
    uv sync
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    OPENAI_API_KEY=your_api_key_here
    # Optional: Azure/Ollama config
    # OPENAI_API_TYPE=azure
    # OPENAI_API_BASE=...
    # OPENAI_API_VERSION=...
    # OPENAI_DEPLOYMENT=...
    ```

4.  **Run the Server**:
    ```bash
    uv run app.py
    ```
    The server will start at `http://localhost:5000`.

### Extension Setup

1.  Open Chrome/Edge and navigate to `chrome://extensions`.
2.  Enable **Developer mode** (top right).
3.  Click **Load unpacked**.
4.  Select the `extension` folder in this repository.

## Usage

1.  Click the AdGenie icon in your browser toolbar.
2.  Enter product details (Title, Features, Tone, Keywords).
3.  Click **Generate**.
4.  Once descriptions appear, click **Judge this Option** to get an AI evaluation.

## Testing

Run the automated test suite:

```bash
uv run pytest
```

# Frontend README
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
