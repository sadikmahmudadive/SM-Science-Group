<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1658bd94-5f24-4f60-abc4-1f0935ee1d21

## Run Locally

**Prerequisites:**  Node.js 18+

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in the required values:
     - **Firebase:** Set your Firebase project credentials (get from Firebase Console)
     - **Cloudinary:** Set your Cloudinary cloud name (optional, for image optimization)
     - **GEMINI_API_KEY:** Set your Gemini API key (optional, for AI features)
     - **APP_URL:** Set to `http://localhost:3000` for development
   
   ```bash
   # Example .env.local
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   APP_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Environment Variables

All environment configuration is managed through `.env.local`. See `.env.example` for a complete list of available variables:

- **Firebase:** Firestore, Authentication
- **Cloudinary:** Image optimization and CDN
- **Gemini AI:** AI-powered features
- **SMTP:** Email notifications
- **Authentication:** NextAuth configuration
- **Feature Flags:** Toggle features via environment

See [lib/config.ts](lib/config.ts) for the centralized configuration management.
"# SM-Science-Group" 
