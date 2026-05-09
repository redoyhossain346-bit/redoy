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
### Terminal Warnings (`npm warn deprecated`)
Messages starting with `npm warn deprecated` are **normal** information about the libraries used by the app. 
- You can safely ignore them.
- They do **not** stop the app from working.
- As long as you see "found 0 vulnerabilities", your setup is perfect.

### Blank Page / White Screen
If the app shows a white screen:
1. **Restart the Server**: In your terminal, stop the current process (press `Ctrl + C`) and run **`npm run dev`** again.
2. **Use Port 3000**: Type **`http://localhost:3000`** directly into your browser.
3. **Connection Refused**: If you see "This site can't be reached", it means the terminal command `npm run dev` is NOT running. Make sure that terminal window stays open!
4. **Incognito Mode**: Use a new **Incognito** window to test.
5. **Try Chrome**: Ensure you are using a modern browser like Google Chrome.

### Security Warning (Not Secure)
- Since the app runs locally on `http`, your browser might show a "Not Secure" warning. This is normal for local development. You can safely ignore it or click "Advanced" and "Proceed".

### Port 3000 already in use
- If you get an error that port 3000 is taken, you can change the port in `package.json` under the `dev` script:
  `"dev": "vite --port=3001 --host=0.0.0.0"`

## 5. Security Credentials
- **User ID**: `Cellular01`
- **Passcode**: `123458`
