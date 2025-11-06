# Bolt.new (oTToDev) - AI-Powered Full-Stack Web Development

## Overview
Bolt.new (oTToDev fork) is an AI-powered web development agent enabling users to prompt, run, edit, and deploy full-stack applications directly in the browser. It leverages Remix (React), WebContainer API for in-browser environments, and integrates with multiple leading LLM providers and Cloudflare Pages for deployment. The project aims to provide a seamless, AI-driven development experience.

## User Preferences
None set yet.

## System Architecture
The application uses Remix for server-side rendering and routing. It operates within isolated browser-based development environments powered by the WebContainer API, allowing Node.js, npm, and servers to run directly in the browser. Cloudflare Workers runtime is used for serverless execution. The code editor is powered by CodeMirror, and terminal emulation uses xterm.js.

Key features include:
- **AI-Powered Development**: Natural language prompts to create full-stack applications.
- **In-Browser Environment**: Real-time development and execution within the browser.
- **Multiple LLM Support**: Integration with various AI providers (Anthropic, OpenAI, Google, Groq, Cohere, Mistral, DeepSeek, OpenRouter, xAI, HuggingFace, Together, Ollama, LMStudio) using their latest October 2025 models.
- **Live Preview**: Real-time visualization of code changes.
- **Full-Stack Support**: Capabilities for backend APIs, frontend frameworks, and database integration.
- **Project Export**: Options to download or publish projects to GitHub.
- **UI/UX**: Default dark mode with a comprehensive black and white color scheme, ensuring high contrast and readability. All color primitives have been replaced with grayscale values.
- **Development Modes**:
    - **Build Mode (Default)**: AI generates, updates, and executes code.
    - **Chat Mode**: Conversational interaction for project queries without making code changes.
- **Image Upload Support**: Users can upload and send images to vision-enabled AI models, with support for multiple formats, previews, and automatic inclusion with text prompts.

## External Dependencies
- **Cloudflare Pages**: Deployment target.
- **LLM Providers**:
    - Anthropic (Claude 4.x: Sonnet 4.5, Haiku 4.5, Opus 4.1)
    - OpenAI (GPT-5: o1, o1-pro, o1-mini; GPT-4.1)
    - Google Gemini (2.0: Flash, Experimental, Thinking)
    - Groq (Llama 3.3, DeepSeek R1 distills)
    - Cohere (Command A, Command A Reasoning)
    - Mistral (Large 24.11, Pixtral Large, Medium 3, Small 3.1, Codestral 25.01)
    - DeepSeek (Chat V3.2, Chat V3.1)
    - OpenRouter (various models)
    - xAI Grok
    - HuggingFace
    - Together
    - Ollama
    - LMStudio
- **Tavily API**: For AI web search capabilities, enabling real-time information retrieval (e.g., SEO insights, marketing strategies, news).