Got it! Here’s your `README.md` rewritten **fully in Markdown** using the format you started with, keeping the numbered sections and clean headings:

````markdown
# Mutual Tasking - Next.js App Deployment Guide

This guide explains how to set up and deploy the **Mutual Tasking Next.js app** locally or on a server using the provided environment variables example (`.env.local.example`) and the Supabase schema SQL file (`supabase_schema.sql`).

---

## **Prerequisites**

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) v17+ (to match Supabase)
- [Git](https://git-scm.com/)
- (Optional) [Docker](https://www.docker.com/) if you want to run PostgreSQL in a container

---

## **1. Clone the Repository**

```bash
git clone https://github.com/kaloyyyy/mutual-tasking.git
cd mutual-tasking
````

---

## **2. Install Dependencies**

```bash
npm install
# or
yarn
```

---

## **3. Configure Environment Variables**

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and update the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Make sure the credentials match your Supabase project.

---

## **4. Set Up Local PostgreSQL Database**

### **Option 1: Local PostgreSQL**

```bash
# Create database
createdb mutual_tasking_db

# Restore schema
psql -d mutual_tasking_db -f mutual-tasking/supabase_schema.sql
```

### **Option 2: Dockerized PostgreSQL**

```bash
docker run --name mutual-tasking-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:17
docker exec -i mutual-tasking-db psql -U postgres -d postgres < mutual-tasking/supabase_schema.sql
```

> Replace `yourpassword` with a secure password.

---

## **5. Run the Application Locally**

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## **6. Build and Start for Production**

```bash
npm run build
npm start
# or
yarn build
yarn start
```

---

## **7. Deploy to Vercel**

1. Push your code to GitHub:

```bash
git push origin main
```

2. Import the repository into [Vercel](https://vercel.com/).

3. Add the same environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

4. Deploy and access your app via the Vercel URL.

---

## **8. Seed the Database with Sample Data (Optional)**

```bash
psql -d mutual_tasking_db -f path/to/seed.sql
```

---

## **9. Notes**

* `.env.local` **should not** be committed; use `.env.local.example` as a template.
* `supabase_schema.sql` contains **schema only** (no data).
* PostgreSQL version **must match or exceed** Supabase version (17.4+ recommended).

---

## **10. References**

* [Next.js Documentation](https://nextjs.org/docs)
* [Supabase Documentation](https://supabase.com/docs)
* [PostgreSQL Documentation](https://www.postgresql.org/docs/)

```

---

If you want, I can also **add a section at the end for Docker Compose** that sets up both PostgreSQL and Next.js in one command for instant local deployment.  

Do you want me to add that?
```
