# HandyMan Portfolio

HandyMan Portfolio is a Next.js 16 marketplace for local service providers, requesters, and admins. It uses Prisma with PostgreSQL and Auth.js for authentication.

## Local development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

The production build can be verified with:

```bash
npm run build
```

## Deploy on Vercel

This project is compatible with Vercel, but it requires environment variables before the deployment will work correctly.

### 1. Import the GitHub repository into Vercel

1. Open https://vercel.com/new
2. Import `MnrSanele/SG-Pro-Hustler`
3. Keep the default framework preset as **Next.js**

### 2. Configure environment variables

Add the following variables in the Vercel project settings:

| Variable | Required value |
| --- | --- |
| `DATABASE_URL` | Your production Postgres connection string |
| `AUTH_SECRET` | A secure random secret, e.g. `openssl rand -base64 32` |
| `AUTH_URL` | Your Vercel production URL, e.g. `https://your-project.vercel.app` |
| `STORAGE_PROVIDER` | `local` |
| `STORAGE_BUCKET` | `handyman-uploads` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel production URL |
| `NEXT_PUBLIC_APP_NAME` | `HandyMan Portfolio` |

You can use `/home/runner/work/SG-Pro-Hustler/SG-Pro-Hustler/.env.example` as the reference for the required variable names.

### 3. Database setup

This app uses Prisma and PostgreSQL. Before using the deployed app:

1. Provision a hosted Postgres database
2. Set `DATABASE_URL` in Vercel
3. Run the Prisma schema against that database:

```bash
npx prisma db push
```

If you also want sample data:

```bash
npm run prisma:seed
```

### 4. Redeploy

After setting the environment variables, trigger a Vercel redeploy from the Vercel dashboard.

## Notes

- The app currently builds successfully with `npm run build`
- This repository uses Next.js 16 app routing with `src/proxy.ts`
- For production auth, `AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match your deployed Vercel URL
