# Bolt.new (oTToDev) - AI-Powered Full-Stack Web Development

## Overview
This is a Replit deployment of **Bolt.new** (oTToDev fork), an AI-powered web development agent that allows you to prompt, run, edit, and deploy full-stack applications directly in your browser. 

The application uses:
- **Remix** (React framework) with Vite
- **WebContainer API** for in-browser development environments
- **Multiple LLM providers**: All using October 2025 latest models
  - Anthropic Claude 4.x (Sonnet 4.5, Haiku 4.5, Opus 4.1)
  - OpenAI GPT-5 (o1, o1-pro, o1-mini) and GPT-4.1
  - Google Gemini 2.0 (Flash, Experimental, Thinking)
  - Groq (Llama 3.3, DeepSeek R1 distills)
  - Cohere Command A, Mistral Large 24.11, DeepSeek V3.2
  - Plus: OpenRouter, xAI Grok, HuggingFace, Together, Ollama, LMStudio
- **Cloudflare Pages** for deployment target

## Project Structure
```
app/                 - Main application code
  ├── components/    - React components
  ├── lib/          - Core libraries and utilities
  ├── routes/       - Remix route handlers
  ├── styles/       - SCSS stylesheets
  ├── types/        - TypeScript type definitions
  └── utils/        - Utility functions
public/             - Static assets
docs/               - Documentation (MkDocs)
functions/          - Cloudflare Functions
```

## Recent Changes
- **2025-11-02**: Added Image Upload Support
  - **Users can now upload and send images to vision-enabled AI models**
  - **Features**:
    - Upload images directly in the chat interface
    - Support for JPEG, PNG, GIF, WebP, and SVG formats
    - Image preview before sending
    - Images converted to base64 and sent as multimodal content
    - Works with vision-capable models (GPT-4.1, Claude Sonnet 4.5, Gemini 2.0, etc.)
    - Multiple images can be sent in a single message
    - Images automatically included with text prompts
  - **UI Components**:
    - "Attach files/images" button with paperclip icon
    - Image preview cards with remove functionality
    - File size display for each uploaded image
    - Maximum file size: 10MB per image
  - **Files Created/Modified**:
    - `app/utils/fileUtils.ts`: File handling utilities and base64 conversion
    - `app/components/chat/FileUpload.tsx`: New file upload UI component
    - `app/components/chat/Chat.client.tsx`: File state management and multimodal message creation
    - `app/components/chat/BaseChat.tsx`: Integrated FileUpload component
    - `app/lib/.server/llm/stream-text.ts`: Updated message types to support multimodal content (text + images)

- **2025-10-31**: Added Tavily API Key Frontend UI
  - **Users can now enter their Tavily API key directly in the UI** (stored securely in browser cookies)
  - **Frontend API key management**: Added Tavily to the Model Settings section with:
    - APIKeyManager component for easy key entry/editing
    - "Get API Key" button linking to https://app.tavily.com/home
    - Helpful description: "Enable AI web search for real-time information (1,000 free searches/month)"
    - Magnifying glass icon for visual identification
  - **Cookie-based storage**: Tavily API key stored alongside other provider keys in encrypted cookies
  - **Priority fallback**: Cookie-stored key takes priority over environment variable
  - **Files Modified**:
    - `app/lib/.server/llm/stream-text.ts`: Accept Tavily API key from cookies with env fallback
    - `app/components/chat/BaseChat.tsx`: Added Tavily API key UI component in Model Settings

- **2025-10-31**: Integrated Tavily AI Web Search
  - **AI can now search the web** for real-time information, current events, trends, and up-to-date content
  - **Automatic web search**: AI automatically uses web search when it needs current information
  - **Use cases**: SEO insights, marketing strategies, news, real-time data, latest documentation
  - **Tool integration**: Tavily search API integrated with Vercel AI SDK tool calling
  - **Features**:
    - Multi-step reasoning with up to 5 search iterations
    - Structured search results with titles, URLs, content snippets, and relevance scores
    - AI-generated summaries with source citations
    - Graceful error handling and fallback messages
    - Works in both Build Mode and Chat Mode
  - **Files Created/Modified**:
    - `app/lib/.server/llm/tools.ts`: New web search tool implementation
    - `app/lib/.server/llm/stream-text.ts`: Integrated tools with AI streaming
    - `app/routes/api.chat.ts`: Enabled web search in chat API
    - `app/lib/.server/llm/prompts.ts`: Updated system prompts with web search instructions
  - **API Key Required**: `TAVILY_API_KEY` (free tier: 1,000 searches/month)

- **2025-10-30**: Implemented Chat Mode and Build Mode feature
  - **Build Mode** (Default): AI creates and updates code with full artifact execution
  - **Chat Mode**: Conversational mode for asking questions about your project without making code changes
  - **Mode Selector**: Dropdown in prompt box footer to switch between modes
  - **Features**:
    - Mode persists across sessions (localStorage + cookies)
    - Different system prompts for each mode
    - In Chat Mode: AI provides explanations, advice, and strategies without executing actions
    - In Build Mode: AI generates code, creates files, and executes shell commands
    - Works in both development (HTTP) and production (HTTPS) environments
  - **Files Modified/Created**:
    - `app/lib/stores/mode.ts`: New mode store for state management
    - `app/lib/.server/llm/prompts.ts`: Added chat mode system prompt
    - `app/lib/.server/llm/stream-text.ts`: Added mode parameter support
    - `app/routes/api.chat.ts`: Reads mode from cookie to select appropriate prompt
    - `app/components/chat/BaseChat.tsx`: Added mode selector dropdown UI

- **2025-10-30**: Set dark mode as default theme
  - Updated `DEFAULT_THEME` from 'light' to 'dark'
  - Application now loads with dark theme by default

- **2025-10-30**: Completed comprehensive black and white color scheme conversion
  - **Light Mode**: White backgrounds (#FFFFFF) with pure black (#000000) text and black accents
  - **Dark Mode**: Black backgrounds (#000000) with pure white (#FFFFFF) text and white accents
  - **Files Modified**:
    - `uno.config.ts`: Replaced all color primitives (accent, red, orange, green, alpha palettes) with grayscale values
    - `app/styles/variables.scss`: Converted all CSS custom properties to grayscale
    - `app/components/chat/BaseChat.module.scss`: Removed colored backgrounds and borders
    - `app/components/chat/Markdown.module.scss`: Updated code block and inline code colors to grayscale
    - `app/styles/components/editor.scss`: Converted editor colors to monochrome
    - `app/components/chat/BaseChat.tsx`: Fixed SVG gradient colors from blue (#1488fc, #8adaff) to gray (#888888, #AAAAAA)
  - Maintained full theme toggle functionality (sun/moon icon in sidebar)
  - Improved contrast and readability across all UI elements
  - All colored accents (blues, reds, greens, oranges) completely removed from entire codebase

- **2025-10-29**: Updated all AI models to latest versions (October 2025)
  - **Anthropic**: Added Claude Sonnet 4.5, Haiku 4.5, Opus 4.1, Sonnet 4
  - **OpenAI**: Added GPT-5 (o1), GPT-5 Pro, GPT-5 Mini, GPT-4.1 (gpt-4o)
  - **Google**: Updated to Gemini 2.0 models (2.0 Flash, 2.0 Flash Experimental)
  - **Groq**: Added Llama 3.3, DeepSeek R1 distills (reasoning models), tool-use models
  - **Cohere**: Added Command A (flagship), Command A Reasoning
  - **Mistral**: Added Large 24.11, Pixtral Large (multimodal), Medium 3, Small 3.1, Codestral 25.01
  - **DeepSeek**: Added Chat V3.2, Chat V3.1 (hybrid reasoning)
  - **OpenRouter**: Updated all models to latest versions
  - **Default model**: Changed to Claude Sonnet 4.5 (best coding model)
  - Fixed Google Gemini API errors (retired 1.5 models replaced with 2.0)
  
- **2025-10-28**: Configured for Replit environment
  - Updated Vite config to use `0.0.0.0:5000` for server
  - Configured HMR (Hot Module Replacement) for Replit proxy
  - Set up dev server workflow
  - Fixed critical parseCookies bug (null check)

## Configuration

### Environment Variables (API Keys Setup)

**IMPORTANT**: To use Bolt.new, you need at least one AI provider API key.

#### Setting up API Keys via Replit Secrets (Recommended - Secure):

1. Click "Tools" in left sidebar → Select "Secrets"
2. Add API keys for the providers you want to use (you only need ONE to get started)
3. Restart the server after adding secrets

#### Common API Keys:

**Recommended for beginners** (has free tier):
- `GROQ_API_KEY` - Fast and free tier available
  - Get key: https://console.groq.com/keys
  - Models: Llama 3.3 70B, DeepSeek R1 distills (reasoning), fastest inference
  - **Best for**: Free tier, ultra-fast responses, coding tasks

**Popular paid options** (best quality):
- `ANTHROPIC_API_KEY` - Claude models (best coding model available)
  - Get key: https://console.anthropic.com/settings/keys
  - Models: Claude Sonnet 4.5 (best coding), Haiku 4.5 (fast), Opus 4.1 (deep reasoning)
  - **Best for**: Complex coding, agentic workflows, computer use
  
- `OPENAI_API_KEY` - GPT models (latest reasoning)
  - Get key: https://platform.openai.com/api-keys
  - Models: GPT-5 (o1), GPT-5 Pro, GPT-5 Mini, GPT-4.1
  - **Best for**: Math, science, multimodal tasks
  
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini models (free tier available)
  - Get key: https://aistudio.google.com/app/apikey
  - Models: Gemini 2.0 Flash, 2.0 Flash Experimental, Thinking mode
  - **Best for**: Multimodal, free tier, fast iteration

**Additional providers**:
- `MISTRAL_API_KEY` - https://console.mistral.ai/
- `COHERE_API_KEY` - https://dashboard.cohere.com/api-keys
- `DEEPSEEK_API_KEY` - https://platform.deepseek.com/
- `OPEN_ROUTER_API_KEY` - https://openrouter.ai/keys (access to multiple models)
- `XAI_API_KEY` - xAI Grok API
- `HuggingFace_API_KEY` - HuggingFace API

**Web Search** (enable AI to search the web):
- `TAVILY_API_KEY` - Tavily AI Search API
  - Get key: https://app.tavily.com/home
  - Free tier: 1,000 searches/month
  - **Best for**: Real-time information, news, SEO insights, marketing strategies, current events
  - **Features**: AI can automatically search the web when it needs up-to-date information

**For local models** (no API key needed):
- `OLLAMA_API_BASE_URL` - If running Ollama locally (default: http://localhost:11434)
- `LMSTUDIO_API_BASE_URL` - If running LM Studio locally

#### Alternative: Add API Keys via UI
You can also add API keys directly in the Bolt.new interface (stored in browser cookies):
1. Click "Model Settings" in the chat interface
2. Select your provider and click "Get API Key"
3. Enter your API key and save

### Vite Configuration
The Vite dev server is configured to:
- Listen on `0.0.0.0:5000`
- Support Replit's proxy with WebSocket HMR on port 443
- Use strict port enforcement

## Development

The dev server is configured to run automatically on port 5000.

### Manual Commands
```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run typecheck    # Run TypeScript type checking
pnpm run lint         # Lint code
pnpm run lint:fix     # Lint and fix issues
pnpm test             # Run tests
```

## Features
- **AI-Powered Development**: Use natural language to create full-stack applications
- **In-Browser Environment**: WebContainer technology allows running Node.js, npm, and servers in the browser
- **Multiple LLM Support**: Choose from various AI providers for each prompt
- **Live Preview**: See changes in real-time as the AI generates code
- **Full-Stack Support**: Backend APIs, frontend frameworks, database integration
- **Export Projects**: Download or publish to GitHub

## Architecture Notes
- Uses Remix for server-side rendering and routing
- Cloudflare Workers runtime for serverless execution
- WebContainer API provides isolated browser-based development environments
- Code editor powered by CodeMirror
- Terminal emulation with xterm.js

## User Preferences
None set yet.

## Known Issues
- Ollama connection errors in logs are expected if not running Ollama locally - this is optional
- Chrome 129 has module loading issues (plugin automatically detects and shows warning)

## Documentation
- [Official oTToDev Docs](https://coleam00.github.io/bolt.new-any-llm/)
- [Contributing Guide](CONTRIBUTING.md)
- [FAQ](FAQ.md)
- [Community](https://thinktank.ottomator.ai)

## Deployment
This application is configured for deployment to Cloudflare Pages. The deployment uses:
- Build command: `pnpm run build`
- Output directory: `build/client`
- Cloudflare Workers runtime

## Latest AI Models (October 2025)

All models have been updated to the latest versions as of October 29, 2025:

### Top Recommendations by Use Case:
- **Best for Coding**: Claude Sonnet 4.5, GPT-5, DeepSeek R1 Qwen 32B
- **Fastest**: Groq (Llama 3.3), Claude Haiku 4.5, GPT-5 Mini
- **Best Free Options**: Groq, Google Gemini 2.0 Flash
- **Best Reasoning**: Claude Opus 4.1, GPT-5 Pro, DeepSeek R1 distills
- **Best Multimodal**: GPT-4.1, Pixtral Large, Gemini 2.0

### Model Highlights:
- **Claude Sonnet 4.5**: World's best coding model, strongest for complex agents
- **GPT-5**: Latest reasoning model with configurable thinking depth
- **Llama 3.3 70B**: State-of-the-art open model on Groq (3000+ tokens/sec)
- **DeepSeek R1**: Advanced reasoning models with hybrid thinking modes
- **Gemini 2.0**: Latest Google models with thinking mode capabilities

---
Last Updated: October 29, 2025
