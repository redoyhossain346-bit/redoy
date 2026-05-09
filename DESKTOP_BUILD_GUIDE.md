# How to Build Windows 11 (.exe) App

I have configured the project to support building a Windows Desktop Application. Since I cannot generate the `.exe` file here in the cloud, you must follow these steps on your **Windows 11 computer**.

## 1. Prerequisites
Make sure you have the following installed on your computer:
- **Node.js** (Download from [nodejs.org](https://nodejs.org/))
- **Git** (Download from [git-scm.com](https://git-scm.com/))

## 2. Download the Code
1. Click the **Export/Settings** menu in this AI Studio app.
2. Select **Export to ZIP** or **Export to GitHub**.
3. Extract the ZIP file to a folder on your computer (e.g., `C:\ManagementApp`).

## 3. Configuration (Optional: for AI Assistant)
If you want the AI assistant to work on your local computer:
1. Create a file named **`.env`** in the main folder.
2. Add your Gemini API key (you can get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey)):
   ```text
   GEMINI_API_KEY=your_key_here
   ```

## 4. Install Dependencies
Open a terminal (PowerShell or CMD) in that folder and run:
```powershell
npm install
```

## 5. Run the App as a Desktop Window
To test it before building:
```powershell
npm run desktop
```

## 6. Build the Windows Executable (.exe)
To generate the final `.exe` file for Windows:
```powershell
npm run build:exe
```
**Note**: The first time you run this, it will download about 150MB of Electron data (as seen in your screenshot). Please **do not close the terminal** until it finishes—it might take a few minutes depending on your internet speed.

### Where is the file?
After the command finishes, look in the new folder named `release`.
You will find **`Management Portal Setup.exe`** inside. Double-click it to install the app on your computer!

---

### Tips for Windows 11
- **Icons**: You can replace the `public/favicon.ico` with your own logo before building to change the app's icon.
- **Offline Mode**: The app stores data in your local browser storage. The desktop version uses its own separate local storage on your computer.
- **Security**: Windows might show a "Protected your PC" warning because the app is not signed with a paid developer certificate. Just click **"More info"** and **"Run anyway"**.
