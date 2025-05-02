# FridgeRecipe

This Next.js application helps you generate recipes from ingredients, get personalized health plans, and manage your daily meals and exercises.

## Features

- **Recipe Generation**: Enter ingredients manually or upload a photo to get recipe suggestions.
- **Health Meter**: Calculate your BMI and get a personalized diet and health plan based on your age, weight, height, and an optional photo.
- **Diet Chat Assistant**: Chat with an AI assistant to customize your diet plan in real-time.
- **Daily Planner**: Organize your meals, exercises, and notes in a drag-and-drop daily schedule. Includes exercise recommendations based on your preferences.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    - **Crucial Step:** Create a `.env` file in the root directory of the project.
    - Add your Google Generative AI API key to the `.env` file. **The AI features (recipe generation, health plan, diet chat, exercise recommendations) will not work without a valid API key.**
      ```dotenv
      # Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
      GOOGLE_GENAI_API_KEY="YOUR_API_KEY_HERE"
      ```
    - **Important:** Replace `"YOUR_API_KEY_HERE"` with your actual API key obtained from Google AI Studio. Make sure the key is active and has the necessary permissions. If you encounter errors related to API calls (like 400 Bad Request or API key invalid), double-check this step.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002` (or the port specified in your `package.json`).

5.  **(Optional) Run Genkit development server:**
    If you need to test or debug the Genkit flows directly, you can start the Genkit development server in a separate terminal:
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```
    This will typically start a local UI for inspecting flows.

### Usage

- **Home Page (`/`)**: Access main features like Manual Entry, Image Upload, and the Health Meter.
- **Manual Entry (`/manual-entry`)**: Type in ingredients to generate a recipe.
- **Image Upload (`/image-upload`)**: Upload a photo of ingredients to extract them and generate a recipe.
- **Health Meter (on Home Page)**: Enter your health details to get a BMI calculation and a personalized health plan.
- **Diet Chat (`/diet-chat`)**: Interact with the AI assistant to modify your diet plan.
- **Daily Planner (`/daily-planner`)**: Manage your daily schedule and get exercise recommendations.

## Technologies Used

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- Genkit (for Generative AI features)
- Google Generative AI (Gemini models)
- Zod (for schema validation)
- React Hook Form
- dnd-kit (for drag and drop)
