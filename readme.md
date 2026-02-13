<div align="center">

# 🎓 Anie - Grade calculator & Job Docs Analyzer

### Your AI-Powered Academic Advisor & Career Assistant

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?logo=go&logoColor=white)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Gemini](https://img.shields.io/badge/Gemini-Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Security Scan](https://github.com/Xeze-org/Anie-Ai/actions/workflows/security.yml/badge.svg)](https://github.com/Xeze-org/Anie-Ai/actions/workflows/security.yml)

<br/>

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Student.png" alt="Student" width="150"/>

**Calculate grades • Plan courses • Analyze Job Contracts • Resume Review**

[cs.xeze.org](https://cs.xeze.org) · [CONTRIBUTE](./CONTRIBUTING.md) · [Discussions](../../discussions) · [Contact](./SUPPORT.md)


---

## 🔒 Privacy First

> **Your data stays with you.** All chat history is stored **locally in your browser** using IndexedDB. No conversation data is sent to any server for storage - only for generating responses. We don't track, store, or analyze your conversations.


---


## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 Grade Calculator
- SGPA/CGPA computations with step-by-step breakdowns
- Automatic component weighting (Quizzes 30%, Assignments 20%, Compre 50%)
- Beautiful KaTeX math rendering

</td>
<td width="50%">

### 📚 Course Planning
- Complete 6-semester curriculum guide
- Prerequisites tracking
- Elective recommendations

</td>
</tr>
<tr>
<td width="50%">

### 🎯 Specialization Guidance
- Full-Stack Development path
- Cloud Computing track
- AI/ML specialization

</td>
<td width="50%">

### 💬 Conversational AI
- Natural language interactions
- Context-aware responses
- Persistent chat history (stored locally)

</td>
</tr>
<tr>
<td width="50%">

### 🔍 Job Document Analyzer
- **Contract Scanner**: Detect scams and risky clauses in employment agreements. Risk scoring included.
- **Resume Optimizer**: AI-powered resume review for ATS optimization.
- **Dedicated Backend**: Secure analysis pipeline.

</td>
<td width="50%">

### 🔑 Bring Your Own API Key (Optional)
- Use your own Gemini API key for direct access
- API key stored securely in your browser (localStorage)
- Choose from multiple Gemini models
- Green checkmark indicates custom API active

</td>
</tr>
</table>

---

## 🏗️ Architecture

### Dual Mode Operation

Users can choose between **Server API** (default) or **Custom API** (bring your own key):

```mermaid
flowchart TB
    subgraph Client["🖥️ Client (Browser)"]
        UI["⚛️ React App<br/>TypeScript + Vite"]
        IDB[("💾 IndexedDB<br/>Chat History")]
        LS[("🔑 localStorage<br/>API Key + Settings")]
        UI <--> IDB
        UI <--> LS
    end
    
    subgraph Mode1["Option 1: Server API"]
        BE["🐳 Backend Container<br/>Go + Gemini"]
        JA["🕵️ Job Analyzer API<br/>Dedicated Service"]
    end
    
    subgraph Mode2["Option 2: Custom API"]
        DirectAPI["✨ Gemini API<br/>User's Own Key"]
    end
    
    UI -->|"Chat & Grade"| BE
    UI -->|"Job Analysis"| JA
    UI -.->|"BYOK Mode"| DirectAPI
```

### Data Flow (Server Mode)

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as ⚛️ Frontend
    participant DB as 💾 IndexedDB
    participant B as 🐳 Backend
    participant G as ✨ Gemini AI
    
    U->>F: Send Message
    F->>DB: Load Chat History
    DB-->>F: Previous Messages
    F->>B: POST /api/chat
    B->>G: Generate Response
    G-->>B: AI Response
    B-->>F: JSON Response
    F->>DB: Save Message
    F-->>U: Display Response
```

### Data Flow (Custom API Mode)

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as ⚛️ Frontend
    participant LS as 🔑 localStorage
    participant DB as 💾 IndexedDB
    participant G as ✨ Gemini API
    
    U->>F: Send Message
    F->>LS: Get API Key
    LS-->>F: User's API Key
    F->>DB: Load Chat History
    DB-->>F: Previous Messages
    F->>G: Direct API Call
    G-->>F: AI Response
    F->>DB: Save Message
    F-->>U: Display Response
```

### Local Data Storage

```mermaid
erDiagram
    INDEXEDDB {
        string id PK "Message ID"
        string role "user | assistant"
        string content "Message text"
        datetime timestamp "Created at"
    }
    LOCALSTORAGE {
        boolean useCustomApi "Enable custom API"
        string apiKey "User's Gemini key"
        string model "Selected model"
    }
```

---

## 🔐 Security

| Component | Security Measure |
|-----------|-----------------|
| **API Key** | Environment variables, never in code |
| **Backend** | Non-root container, read-only filesystem |
| **Frontend** | No secrets, static files only |
| **HTTPS** | Enforced on all endpoints |
| **Scanning** | CodeQL, TruffleHog, Dependabot |

> 📖 See [SECURITY.md](./SECURITY.md) for full security policy

---

## 🎨 Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://techstack-generator.vercel.app/react-icon.svg" alt="React" width="48" height="48" />
<br>React
</td>
<td align="center" width="96">
<img src="https://techstack-generator.vercel.app/ts-icon.svg" alt="TypeScript" width="48" height="48" />
<br>TypeScript
</td>
<td align="center" width="96">
<img src="https://raw.githubusercontent.com/vitejs/vite/main/docs/public/logo.svg" alt="Vite" width="48" height="48" />
<br>Vite
</td>
<td align="center" width="96">
<img src="https://techstack-generator.vercel.app/github-icon.svg" alt="Go" width="48" height="48" />
<br>Go
</td>
<td align="center" width="96">
<img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" alt="GCP" width="48" height="48" />
<br>GCP
</td>
<td align="center" width="96">
<img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" alt="Firebase" width="48" height="48" />
<br>Firebase
</td>
</tr>
</table>

---

## 📊 BITS CS Curriculum Overview

The system contains complete curriculum data for:

| Program | Duration | Units |
|---------|----------|-------|
| B.Sc. CS (Online) | 3 years | 107 |
| B.Sc. Honours CS | 4 years | 144 |

### Specializations Available (Honours)

| Track | Focus Areas |
|-------|-------------|
| 🖥️ **Full-Stack** | React, Node.js, APIs, DevOps |
| ☁️ **Cloud** | AWS/GCP, Kubernetes, Microservices |
| 🤖 **AI/ML** | Machine Learning, Deep Learning, NLP |

---

## 📚 Documentation & Guides

For detailed setup and administration instructions, check our Wiki:

- [🚀 Deployment Guide](https://github.com/Xeze-org/Anie-Ai/wiki/Deployment-Guide): Step-by-step instructions for deploying to Docker, Firebase, and Cloud Run.
- [🛠️ Admin Guide](https://github.com/Xeze-org/Anie-Ai/wiki/Admin-guide): Managing secrets, environment variables, and backend configuration.

---

## 🌸 Contributing

We'd love your help! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

---

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

This means you can freely use, modify, and distribute this software, but any derivative work must also be released under GPL 3.0.

---

## 🙏 Acknowledgments

- [BITS Pilani](https://online-programs.bits-pilani.ac.in/) for the curriculum data
- [Google Gemini](https://ai.google.dev/) for the AI capabilities
- [Firebase](https://firebase.google.com/) for hosting

---

<div align="center">

**Made with ❤️ for BITS Students by Xeze**

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Waving%20Hand.png" alt="Wave" width="30"/> 

If this helped you, consider giving it a ⭐

</div>
