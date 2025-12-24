<div align="center">

# 🎓 BITS CS - Anie

### Your AI-Powered Academic Advisor for BITS Pilani Computer Science

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?logo=go&logoColor=white)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Functions-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Gemini](https://img.shields.io/badge/Gemini-Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Security Scan](https://github.com/AE-OSS/ai-grade-calculator/actions/workflows/weekly-scan.yml/badge.svg)](https://github.com/AE-OSS/ai-grade-calculator/actions/workflows/weekly-scan.yml)

<br/>

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Student.png" alt="Student" width="150"/>

**Calculate grades • Plan courses • Get career guidance**

[Use](https://cs.astralelite.org/chat) · [CONTRIBUTE](./CONTRIBUTING.md) ·  [Report Bug](../../issues) · [Request Feature](../../issues) · [Contact](./SUPPORT.md)

</div>

---

## 🐳 One-Click Docker Test for user 

Run locally with Docker in seconds:

<details>
<summary><b>🐧 Bash / Linux / Mac</b></summary>

```bash
# Download files
mkdir -p backend
wget -O docker-compose.yml https://raw.githubusercontent.com/AE-OSS/bits-cs/main/docker-compose.yml
wget -O backend/.env https://raw.githubusercontent.com/AE-OSS/bits-cs/main/backend/.env

# Add your API key
nano backend/.env

# Run
docker compose up -d

# Access: http://localhost:3000
```

</details>

<details>
<summary><b>🪟 PowerShell / Windows</b></summary>

```powershell
# Download files
New-Item -ItemType Directory -Force -Path "backend"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/AE-OSS/bits-cs/main/docker-compose.yml" -OutFile "docker-compose.yml"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/AE-OSS/bits-cs/main/backend/.env" -OutFile "backend/.env"

# Add your API key to backend/.env
notepad backend/.env

# Run
docker compose up -d

# Access: http://localhost:3000
```

</details>

> 📖 See [tester.md](./tester.md) for full Docker documentation

---

## 🛠️ One-Click Docker Test for Developers

Clone and build from source:

<details>
<summary><b>🐧 Bash / Linux / Mac</b></summary>

```bash
# Clone repo
git clone https://github.com/AE-OSS/ai-grade-calculator.git
cd ai-grade-calculator

# Add your API key
nano backend/.env

# Build & Run (full stack)
docker compose -f developer-test.yml up -d --build

# Access: http://localhost:3000
```

</details>

<details>
<summary><b>🪟 PowerShell / Windows</b></summary>

```powershell
# Clone repo
git clone https://github.com/AE-OSS/ai-grade-calculator.git
cd ai-grade-calculator

# Add your API key
notepad backend/.env

# Build & Run (full stack)
docker compose -f developer-test.yml up -d --build

# Access: http://localhost:3000
```

</details>

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
</table>

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client (Browser)"]
        UI["⚛️ React App<br/>TypeScript + Vite"]
        IDB[("💾 IndexedDB<br/>Chat History")]
        UI <--> IDB
    end
    
    subgraph Firebase["☁️ Firebase Hosting"]
        CDN["🌐 Global CDN"]
    end
    
    subgraph GCP["☁️ Google Cloud Platform"]
        CF["⚡ Cloud Function<br/>Go 1.23"]
        SM["🔐 Secret Manager<br/>API Keys"]
        CF --> SM
    end
    
    subgraph AI["🤖 AI Service"]
        Gemini["✨ Gemini Flash<br/>1M Token Context"]
        SP["📋 System Prompt<br/>BITS Curriculum Data"]
        Gemini --> SP
    end
    
    CDN --> UI
    UI -->|"HTTPS POST"| CF
    CF -->|"Generate"| Gemini
    Gemini -->|"Response"| CF
    CF -->|"JSON"| UI
```

### Data Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as ⚛️ Frontend
    participant DB as 💾 IndexedDB
    participant C as ⚡ Cloud Function
    participant G as ✨ Gemini AI
    
    U->>F: Send Message
    F->>DB: Load Chat History
    DB-->>F: Previous Messages
    F->>C: POST /bits-chat<br/>{history: [...]}
    C->>G: Generate with<br/>System Prompt
    G-->>C: AI Response
    C-->>F: {response: "..."}
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
```

---

## 🔐 Security

| Component | Security Measure |
|-----------|-----------------|
| **API Key** | Stored in GCP Secret Manager, never in code |
| **Frontend** | No secrets, only public API URL |
| **Backend** | Secrets injected at runtime via `--set-secrets` |
| **HTTPS** | Enforced on all endpoints |
| **CORS** | Configured for allowed origins |

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

## 🌸 Contributing

We'd love your help! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

**Quick Start:**

```bash
# Clone & run frontend
git clone https://github.com/AE-OSS/bits-cs.git
cd bits-cs/frontend
npm install && npm run dev
```

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

**Made with ❤️ for BITS Students**

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Waving%20Hand.png" alt="Wave" width="30"/> 

If this helped you, consider giving it a ⭐

</div>
