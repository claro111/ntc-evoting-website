@echo off
echo Starting Firebase Emulators...
echo.
echo This will start:
echo - Functions Emulator (port 5001)
echo - Firestore Emulator (port 8080)
echo.
echo After emulators start, run 'npm run dev' in another terminal
echo.
firebase emulators:start --only functions,firestore