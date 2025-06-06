# Patient Token System

## Live Demo

🚀 **Experience the application live here:** [Link to live demo here - replace with your deployed Vercel frontend URL once available] 🚀

(Note: For the full functionality including token generation, the backend server must also be running and accessible online. The demo link above will show the frontend UI, including the Google Sign-In feature which works client-side.)

---

## Project Description

This project is a web application designed to manage patient check-ins and token generation in a healthcare or service setting. It utilizes a modern architecture with a React frontend for a dynamic user interface and a Node.js/Express backend responsible for handling API requests, data storage (MongoDB), and the core token generation logic. Secure access for staff or authorized users is implemented using Google Sign-In via Firebase Authentication.

## Features

*   **Patient Check-In Form:** A user-friendly form where patients can easily input their essential information:
    *   Name
    *   Age
    *   Gender
    *   Department (selection from available departments)
    *   Symptoms (multiple selection from a predefined list)
    *   Preferred Doctor (optional selection)
*   **Intelligent Token Generation:** The backend processes the patient's submitted information to:
    *   Generate a unique token number.
    *   Assign a triage level based on the selected symptoms (this logic is handled server-side).
    *   Calculate and provide an estimated wait time.
*   **Conditional Doctor Preference:** The "Preferred Doctor" dropdown in the check-in form is dynamically populated. **Only doctors currently marked as 'available' in the backend system are displayed as options.** This ensures patients can only select a doctor who is potentially available to see them, although selecting a preferred doctor may still affect wait times based on their individual queue.
*   **Secure Google Sign-In (Firebase Authentication):** Implements a robust authentication flow allowing users (e.g., clinic staff) to log in securely using their existing Google accounts.
*   **User Authentication State Management:** A dedicated React Context (`AuthContext`) is used on the frontend to manage the user's authentication state (`user` object, loading status, sign-in/sign-out functions) across the application, ensuring protected routes and personalized experiences.
*   **Visible User Profile:** Once signed in, the user's profile picture and name are displayed prominently in the application's navigation bar, providing clear feedback on the logged-in status.
*   **Seamless Sign-Out:** Users can easily sign out from their Google account, clearing their session and returning them to a non-authenticated state.
*   **Decoupled Frontend and Backend:** The project is structured with separate `client` (React) and `server` (Node.js) directories, promoting modularity and allowing for independent development and flexible deployment strategies.

## Technologies Used

**Frontend:**

*   React
*   React Router DOM
*   Axios (for API calls)
*   Firebase (for Authentication)
*   (Any other libraries you specifically added to the frontend)

**Backend:**

*   Node.js
*   Express
*   Mongoose (for MongoDB interaction)
*   Cors
*   Socket.IO (for potential real-time updates)
*   dotenv (for environment variables)
*   (Any other libraries you specifically added to the backend)

**Database:**

*   MongoDB

## Setup and Installation

Follow these steps to set up the project locally:

**1. Clone the repository:**

```bash
git clone [Your Repository URL]
cd patient-token-system
```

**2. Set up Frontend:**

Navigate to the `client` directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

**3. Set up Backend:**

Navigate to the `server` directory:

```bash
cd ../server
```

Install dependencies:

```bash
npm install
```

**4. Database Setup (MongoDB):**

*   You need a running MongoDB instance. For local development, you can install MongoDB locally, or use a cloud provider like MongoDB Atlas (which offers a free tier).
*   If using MongoDB Atlas, create a free cluster (M0 tier) and get your connection string.
*   Create a `.env` file in your **`server`** directory.
*   Add your MongoDB connection string to this file:

    ```env
    MONGO_URI=your_mongodb_connection_string
    PORT=5001 # Or any other port you prefer
    ```
    **Replace `your_mongodb_connection_string` with your actual MongoDB connection string.**

**5. Firebase Authentication Setup:**

*   Go to the Firebase Console (https://console.firebase.google.com/).
*   Create a new project or select your existing project.
*   Register a web app (`</>`).
*   Go to Authentication -> Get Started and enable the **Google** sign-in provider.
*   Add `http://localhost:3000` (or wherever your frontend runs) to the authorized domains in Firebase Authentication settings.
*   Get your Firebase configuration object from Project Settings -> Your apps.
*   Create a `.env` file in your **`client`** directory (if you haven't already).
*   Add your Firebase configuration details as environment variables in the `client/.env` file. **Make sure they start with `REACT_APP_`**:

    ```env
    REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
    REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
    ```
    **Replace `YOUR_API_KEY`, etc., with your actual Firebase values.**

    **IMPORTANT SECURITY NOTE:** The `.env` files in both your `client` and `server` directories are included in their respective `.gitignore` files (`client/.gitignore` and `server/.gitignore`). **Never commit these files containing your sensitive credentials to Git.** They are for local use or for pasting into your hosting provider's environment variable settings.

**6. Run the application:**

*   Start the backend server (from the `server` directory):
    ```bash
    npm start # Or node index.js depending on your package.json script
    ```
*   Start the frontend development server (from the `client` directory):
    ```bash
    npm start
    ```

The frontend should now be running at `http://localhost:3000` and the backend at `http://localhost:5001` (or your chosen port).

## Deployment

This project uses a decoupled architecture:

*   **Frontend:** Can be deployed to hosting platforms like **Vercel**, Netlify, GitHub Pages, etc., which specialize in static site hosting.
*   **Backend:** Needs to be deployed to a platform capable of running Node.js applications, such as **Render**, cyclic.sh, Heroku, AWS EC2, etc.
*   **Database:** Hosted separately, e.g., on **MongoDB Atlas**.

When deploying, you will need to configure environment variables on your hosting platforms with the sensitive keys from your local `.env` files (Firebase config for the frontend platform, MongoDB URI and other backend variables for the backend platform). You will also need to update the API base URL in your frontend code to point to your deployed backend URL instead of `http://localhost:5001`.

## Contributing

(Optional section - add guidelines if you welcome contributions)

## License

(Optional section - add your project's license information)
