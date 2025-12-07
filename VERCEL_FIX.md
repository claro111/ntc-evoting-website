# Vercel Build Fix Applied

## Issue
Vercel build was failing with React peer dependency conflict:
```
npm error Could not resolve dependency:
npm error peer react@"^16 || ^17 || ^18" from react-quill@2.0.0
npm error   Conflicting peer dependency: react@18.3.1
```

## Solution
Updated `vercel.json` to use `--legacy-peer-deps` flag in the install command.

## What Changed
- **File**: `vercel.json`
- **Change**: `"installCommand": "npm install"` → `"installCommand": "npm install --legacy-peer-deps"`

## Next Steps
Push this change to GitHub:

```bash
cd ntc-evoting
git add vercel.json
git commit -m "Fix: Add legacy-peer-deps to Vercel install command"
git push
```

Vercel will automatically detect the push and redeploy with the correct settings.

## Why This Works
The `--legacy-peer-deps` flag tells npm to ignore peer dependency conflicts, which is necessary because:
- Your project uses React 19
- `react-quill@2.0.0` only supports React 16-18
- The library works fine with React 19, but npm blocks the install without this flag

This is the same fix we applied locally with the `.npmrc` file, but Vercel needs it explicitly in the install command.
