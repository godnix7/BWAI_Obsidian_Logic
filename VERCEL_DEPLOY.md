# MediLocker Vercel Deploy

Deploy this repo as two Vercel projects from the same Git repository:

1. `backend` as a Python project
2. `frontend` as a Vite project

## Backend Project

- Import the same Git repo into Vercel
- Set **Root Directory** to `backend`
- Framework preset: `Other`
- Entry file: Vercel will use `app.py`

### Backend Environment Variables

Required:

- `DATABASE_URL`
- `SECRET_KEY`
- `QR_ENCRYPTION_KEY`
- `BASE_URL`
- `ALLOWED_ORIGINS`

Recommended for production uploads:

- `FILE_STORAGE_BACKEND=s3`
- `S3_BUCKET_NAME`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_REGION`
- `S3_ENDPOINT_URL`
- `S3_PUBLIC_BASE_URL`
- `S3_USE_SSL`

Optional:

- `REDIS_URL`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `MAIL_PORT`
- `MAIL_SERVER`
- `MAIL_FROM_NAME`

### Important Backend Notes

- Set `BASE_URL` to your deployed backend URL, for example `https://your-backend.vercel.app`
- Set `ALLOWED_ORIGINS` to include your frontend URL, for example `https://your-frontend.vercel.app`
- For persistent file uploads on Vercel, use `FILE_STORAGE_BACKEND=s3`

## Frontend Project

- Import the same Git repo into Vercel again
- Set **Root Directory** to `frontend`
- Framework preset: `Vite`

### Frontend Environment Variables

- `VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1`

## Deploy Order

1. Deploy the backend project first
2. Copy the backend production URL
3. Add that URL to frontend `VITE_API_BASE_URL`
4. Deploy the frontend project
5. Update backend `ALLOWED_ORIGINS` to include the frontend production URL
6. Redeploy backend if you changed backend environment variables

## Smoke Test

After deploy:

- Open `https://your-backend.vercel.app/health`
- Open `https://your-backend.vercel.app/docs`
- Open the frontend URL
- Login and test patient, doctor, and hospital flows
