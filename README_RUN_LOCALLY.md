# How to Run All Cellular & Repair Management Locally

Follow these steps to run this application on your computer.

## 1. Prerequisites
- **Node.js** installed (Version 18 or higher is recommended)
- **Terminal** (PowerShell, Command Prompt, or bash)

## 2. Setup Instructions
1. **Download the code**: Extract the ZIP file you downloaded from AI Studio.
2. **Open Terminal**: Navigate to the folder where you extracted the code.
   ```bash
   cd path/to/your/extracted/folder
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 3. Accessing the App
After running `npm run dev`, you will see output like this:
```
  VITE v6.x.x  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.0.x:3000/
```
- Open your browser and go to **http://localhost:3000**.

## 4. Troubleshooting
### Blank Page / White Screen
If the app shows a white screen, please try these steps in order:
1. **Use Localhost**: Instead of `http://192.168.0.x`, use **`http://localhost:3000`** in the browser.
2. **Incognito Mode**: Open a new **Incognito (Private)** window and try the link there. This ensures no old data is interfering.
3. **Clear Browser Data**: Press `F12` to open DevTools, go to the **Application** tab, select **Clear Site Data** or manually clear **Local Storage**.
4. **Browser Console**: Press `F12` and look at the **Console** tab. If there is a red error, please check the message. I have already added a fix that should show a detailed error on the screen if a crash happens.

### Security Warning (Not Secure)
- Since the app runs locally on `http`, your browser might show a "Not Secure" warning. This is normal for local development. You can safely ignore it or click "Advanced" and "Proceed".

### Port 3000 already in use
- If you get an error that port 3000 is taken, you can change the port in `package.json` under the `dev` script:
  `"dev": "vite --port=3001 --host=0.0.0.0"`

## 5. Security Credentials
- **User ID**: `Cellular01`
- **Passcode**: `123458`
