# Acadena - Motoko + React DApp

**Acadena** is a decentralized academic document management system built using the Internet Computer's **Motoko** language for the backend and **React** for the frontend.

This guide provides step-by-step instructions to clone, set up, and run this project on **Windows** using **WSL (Ubuntu)**.

---

## 🛠️ Requirements

- Windows 10/11
- WSL (Windows Subsystem for Linux)
- Git
- Visual Studio Code (optional but recommended)

---

## 🚀 Step-by-Step Installation Guide

### 1. Enable WSL and Install Ubuntu

Open **PowerShell as Administrator**, then run:

```powershell
wsl --install
wsl --install -d Ubuntu
```

> 🔄 Your system may restart after installation.

---

### 2. Set Up Ubuntu

Once installed, open **PowerShell** and run:

```powershell
wsl
```

Follow the prompts to create your **Linux username** and **password**.

---

### 3. Install DFINITY SDK (dfx)

Inside the Ubuntu terminal:

```bash
cd ~
curl -fsSL https://smartcontracts.org/install.sh -o install.sh
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
dfx --version
```

---

### 4. Install Node.js 18 (Required for React)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### 5. Clone the Repository

```bash
cd ~
git clone https://github.com/cbsdan/Acadena.git
cd Acadena
```

---

### 6. Activate the DFINITY Environment

```bash
. "$HOME/.local/share/dfx/env"
```

---

### 7. Install Frontend Dependencies

```bash
cd src/Acadena_frontend
npm install
cd ../..  # Go back to the project root
```

---

### 8. Start and Deploy the Application

```bash
dfx start --background
dfx deploy
```

After deployment, copy the frontend URL printed in the terminal and open it in your browser. It looks like:

```
http://127.0.0.1:4943/?canisterId=...
```

---

### 9. Stop the Application

```bash
dfx stop
```

---

### 10. Open Project in VS Code

If you have VS Code installed, you can open the project by running:

```bash
code .
```

---

### 11. Use WSL Terminal from VS Code

- In VS Code, open a terminal.
- Click the **+** icon and select **Ubuntu (WSL)**.
- Use two terminals:
  - Terminal 1: `dfx start`
  - Terminal 2: `dfx deploy`

---

### 📥 Optional: Import CHED Registered Institutions

To import the list of CHED-registered institutions into the backend:

```bash
# Set the canister ID of the deployed backend
export CANISTER_ID_ACADENA_BACKEND=uxrrr-q7777-77774-qaaaq-cai

# Navigate to the script location
cd src/Acadena_frontend/src/utils

# Run the upload script
node uploadCHEDInstitutions.cjs
```

> ✅ Ensure `dfx start` is running and that the backend canister ID is correct.

---

## 📂 Project Structure

```
Acadena/
├── src/
│   ├── Acadena_backend/     # Motoko backend
│   └── Acadena_frontend/    # React frontend
├── dfx.json                 # DFX configuration
└── README.md                # Project setup instructions
```
