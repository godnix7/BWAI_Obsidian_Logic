# MediLocker Showcase

This is a standalone frontend placed outside the existing `backend` and `frontend` folders.

## What it does

- Uses the MediLocker visual theme from `frontend/theme.md`
- Connects to the existing FastAPI backend at `http://127.0.0.1:8000/api/v1`
- Supports:
  - backend health check
  - login
  - registration
  - current-user lookup
  - role-based data loading

## Files

- `index.html` - app shell
- `styles.css` - themed glassmorphism UI
- `app.js` - backend integration with `fetch`

## Run locally

Serve this folder with any static server after the backend is running.

Example with Python:

```powershell
cd C:\Nischay\PROJECTS\BWAI\medilocker\medilocker-showcase
python -m http.server 4174
```

Then open:

- `http://127.0.0.1:4174`

## Notes

- The app stores access token, refresh token, and user details in `localStorage`.
- For patient accounts, `Load my data` calls `/patient/profile`.
- For doctor accounts, `Load my data` calls `/doctor/appointments`.
- For hospital accounts, `Load my data` calls `/hospital/profile`.
