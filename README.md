# CulinaryAI

This Next.js application helps you generate recipes from ingredients, get personalized health plans, and manage your daily meals and exercises.


![Screenshot 2025-06-27 014229](https://github.com/user-attachments/assets/19cfb160-4113-4d99-aafa-c9689039cedb)


![Screenshot 2025-06-27 014255](https://github.com/user-attachments/assets/f9aaab05-1e65-4095-86e6-4ef7ab7b5cdd)




![Screenshot 2025-06-27 014321](https://github.com/user-attachments/assets/ef948efa-7a60-401f-9c64-2a7ee73d6ef1)



![Screenshot 2025-06-27 014339](https://github.com/user-attachments/assets/93e03e3f-d8f5-4848-8016-9cfdcc3fd9e4)





![Screenshot 2025-06-27 014356 - Copy](https://github.com/user-attachments/assets/96d9b5cd-8b7f-40a9-977c-fe52ba5435e6)


![Screenshot 2025-06-27 014356](https://github.com/user-attachments/assets/e1a7f88c-fe1b-4e35-bdd1-de5b257b638b)























## Features

- **Recipe Generation**: Enter ingredients manually or upload a photo to get recipe suggestions.
- **Health Meter**: Calculate your BMI and get a personalized diet and health plan based on your age, weight, height, and an optional photo.
- **Diet Chat Assistant**: Chat with an AI assistant (Health Coach) to customize your diet plan in real-time.
- **Chef Chat Assistant**: Chat with an AI Chef about recipes, techniques, and more.
- **Voice Assistant**: Talk to the Health Coach or AI Chef using voice commands.
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
    - Add your Google Generative AI API key to the `.env` file. **The AI features (recipe generation, health plan, chat assistants, exercise recommendations) will not work without a valid API key.**
      ```dotenv
      # Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
      GOOGLE_GENAI_API_KEY="YOUR_API_KEY_HERE"
      ```
    - **Important:** Replace `"YOUR_API_KEY_HERE"` with your actual API key obtained from Google AI Studio. Make sure the key is active and has the necessary permissions. If you encounter errors related to API calls (like 400 Bad Request or API key invalid), double-check this step and ensure the development server (`npm run dev`) is restarted after adding or changing the key.

### Troubleshooting

If you encounter an error indicating that the Generative Language API has not been used in your project or is disabled, you need to enable it in the Google Cloud Console. Navigate to the API's overview page in the console and enable it for your project. If you have just enabled the API, please allow a few minutes for the changes to propagate through the system before retrying.


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

- **Home Page (`/`)**: Access main features like Manual Entry, Image Upload, the Health Meter, and Voice Assistant triggers.
- **Manual Entry (`/manual-entry`)**: Type in ingredients to generate a recipe.
- **Image Upload (`/image-upload`)**: Upload a photo of ingredients to extract them and generate a recipe.
- **Health Meter (on Home Page)**: Enter your health details to get a BMI calculation and a personalized health plan.
- **Coach Chat (`/diet-chat`)**: Interact with the AI Health Coach via text to modify your diet plan.
- **Daily Planner (`/daily-planner`)**: Manage your daily schedule and get exercise recommendations.
- **Voice Assistant (on Home Page)**: Click "Talk to Chef" or "Talk to Coach" to interact using voice.

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
- Web Speech API (for voice input/output)
