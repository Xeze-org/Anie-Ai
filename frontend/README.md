# BITS BSC CS Grade Calculator AI

A beautiful, modern AI chat interface built with React, TypeScript, and Vite. Features LaTeX rendering for mathematical expressions and a stunning dark/light theme.



## Features

- 🎨 **Beautiful UI** - Modern dark theme with ambient lighting effects
- 🌓 **Theme Toggle** - Switch between dark and light modes
- 📐 **LaTeX Support** - Render mathematical equations using KaTeX
- 📝 **Markdown Support** - Full markdown rendering in responses
- ⚡ **Fast & Responsive** - Built with Vite for optimal performance
- 💬 **Conversation History** - Messages persist during session

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit the `.env` file and add your API key:

```env
VITE_API_URL=https://krfmatqs5ww3zqkchcwqww4u.agents.do-ai.run
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## LaTeX Examples

You can use LaTeX in your messages:

- **Inline math**: `$E = mc^2$`
- **Block math**: `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$`

## Tech Stack

- React 18
- TypeScript
- Vite
- react-markdown
- KaTeX (via rehype-katex & remark-math)
- Lucide React Icons

## License

MIT

