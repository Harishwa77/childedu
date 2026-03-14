
# EduSense AI - Autonomous Early Childhood Intelligence

EduSense AI is a Next.js 15 platform designed for early childhood education. It leverages Genkit AI to provide teachers and parents with structured insights, lesson plans, and interactive learning tools.

## Key Features

- **Multi-Role Portals**: Dedicated experiences for Teachers, Parents, and Administrators.
- **AI Resource Analysis**: Automatically extract summaries, curriculum objectives, and flashcards from uploaded videos, audio, and documents.
- **Teacher Hub**: Generate structured lesson plans and track student developmental milestones.
- **Parent Center**: View personalized learning insights, generate custom bedtime stories for children, and access adaptive study plans.
- **Kinder Learning Hub**: Interactive, voice-enabled ABCs and 123s for young learners.
- **Multilingual Support**: Insights can be translated into 12+ Indian languages (Hindi, Tamil, Telugu, etc.).

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **AI Orchestration**: [Genkit](https://github.com/firebase/genkit)
- **Model**: Gemini 2.5 Flash
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud Project with Gemini API access.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd edusense-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root and add your Gemini API Key:
   ```env
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:9002](http://localhost:9002) in your browser.

## Deployment

This app is optimized for **Firebase App Hosting**. 

1. Connect your GitHub repository to Firebase App Hosting in the Firebase Console.
2. The `apphosting.yaml` file is already configured for deployment.

## License

This project is licensed under the MIT License.
