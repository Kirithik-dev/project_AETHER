# AETHER — CINEMATIC FIREBASE AUTHENTICATION EXPERIENCE

A cinematic, monochromatic authentication experience featuring a real-time procedural 3D particle-and-filament sculpture rendered in Three.js with custom GLSL shaders, integrated with real modular Firebase Authentication.

---

## 1. Features

- **Procedural 3D Particle & Filament Sculpture**:
  - Vertically elongated asymmetrical S-curve spine.
  - Over 48,000 pinpoint starlight particles with subtle spectral cyan and violet highlights in deep chiaroscuro folds.
  - Flowing moire filament contour loops and longitudinal streamlines.
  - Whispy upper radiating plume and organic cellular lattice root base.
  - Software WebGL detection (`SwiftShader` / `llvmpipe`) with GPU sync barrier (`gl.fenceSync`) frame pacing.
  - Sinuous real-time animation, organic wave propagation, and smooth pointer parallax.
- **Cinematic Authentication Interface**:
  - Monochromatic Swiss/cybernetic typography with high-contrast chiaroscuro.
  - Modular Firebase Authentication integration:
    - Email/password sign-in.
    - Account creation with optional display name.
    - Password recovery dispatch (`sendPasswordResetEmail`).
    - Google sign-in via `signInWithPopup` and `GoogleAuthProvider`.
    - Live authentication session management via `onAuthStateChanged`.
    - Real error message mapping (`formatAuthError`).
    - Password visibility toggle (show/hide).
- **Cinematic Transition & Authenticated Confirmation**:
  - Persistent Three.js canvas reused across login and authenticated views.
  - On authentication, the sculpture glides smoothly to the center of the viewport.
  - Displays "WELCOME BACK" with the authenticated user's real display name or email.
  - Displays session details and provides a functional Sign-Out control.
  - Zero mock logins, zero fake preview bypasses.

---

## 2. Firebase Configuration Instructions

To configure real Firebase Authentication:

1. **Open the Firebase Console**:
   Navigate to [https://console.firebase.google.com/](https://console.firebase.google.com/).
2. **Create or select a project**:
   Create a new Firebase project or select an existing project.
3. **Register a Web Application**:
   Go to **Project Settings** > **General** > **Your apps** > click the web icon (`</>`) to add a Web app.
4. **Copy Web Configuration into local environment file**:
   Create or edit your local `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY="AIzaSy..."
   VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
   VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
   ```
5. **Open Authentication in the Firebase Console**:
   In the left sidebar, click **Build** > **Authentication**, then click **Get Started**.
6. **Enable Email/Password**:
   Under the **Sign-in method** tab, click **Email/Password** and enable the toggle, then save.
7. **Enable Google as a sign-in provider**:
   Under the **Sign-in method** tab, click **Add new provider** > **Google**, select a project support email, and enable.
8. **Configure Authorized Domains**:
   Under **Authentication** > **Settings** > **Authorized domains**, ensure your application domain or host is listed.
9. **Restart the Vite development server**:
   ```bash
   npm run dev
   ```

If credentials are not yet supplied in `.env`, the application clearly displays a configuration notice and provides an interactive in-app setup guide modal rather than silently creating fake users.

---

## 3. Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
```
