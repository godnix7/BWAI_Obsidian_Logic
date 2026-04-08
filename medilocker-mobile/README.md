# MediLocker Mobile

Separate mobile application for the MediLocker project.

## Constraint respected

This app lives in its own folder:

- `C:\Nischay\PROJECTS\BWAI\medilocker\medilocker-mobile`

No changes were made to:

- `backend`
- `frontend`

## Stack

- Expo
- React Native
- React Navigation
- AsyncStorage
- Expo Document Picker

## Features wired to the existing backend

- Login
- Registration
- Patient profile view/update
- Family member list/add
- Medical record list/upload/delete
- Patient appointment list/book/cancel
- Prescription list
- Consent list/grant/revoke
- Insurance list/add/delete
- Emergency QR config/load/regenerate
- Doctor appointment list/update status
- Hospital profile fetch

## API base URL

Configured in `src/config.js`.

Default:

```js
http://127.0.0.1:8000/api/v1
```

For a real device, replace `127.0.0.1` with your machine's LAN IP.

## Run

```powershell
cd C:\Nischay\PROJECTS\BWAI\medilocker\medilocker-mobile
npm install
npm run start
```

Then open with Expo Go or an emulator.

## Notes

- Some backend areas are still work in progress on the server side, so the mobile app shows those responses as returned.
- Record upload uses the native document picker.
