# Deploying conorhinchee.com on Google Cloud

The site is a static build (`npm run build` writes `dist/`). Two targets:

| Target | Serves | Why |
| --- | --- | --- |
| **Firebase Hosting** | `www.conorhinchee.com` | Free custom domain + SSL + global CDN, atomic deploys, one-click rollback |
| **Cloud Run** | a playground subdomain | Containerized version of the same `dist/`, somewhere to grow an API into |
| GitHub Pages | nothing (kept warm) | Rollback target. Still deployed on every push so a revert is DNS-only. |

Replace `PROJECT_ID` below with your actual GCP project id everywhere it appears.

---

## 0. Pick the project

You can reuse the project Odin lives in, or make a clean one. A separate project
is easier to reason about for billing and IAM, and costs nothing extra.

```bash
gcloud projects create PROJECT_ID --name="conorhinchee.com"
gcloud config set project PROJECT_ID
gcloud billing projects link PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID
```

Billing has to be linked (Blaze) for Cloud Run. Firebase Hosting alone would work
on the free Spark plan, but you want both, so link it.

Then point the repo at it:

```bash
sed -i '' 's/REPLACE_WITH_GCP_PROJECT_ID/PROJECT_ID/' .firebaserc
```

---

## 1. Firebase Hosting

### Enable and deploy

```bash
npm install -g firebase-tools
firebase login
firebase projects:addfirebase PROJECT_ID   # skip if it is already a Firebase project
```

Dry run to a preview channel first so nothing touches the live domain:

```bash
npm run build
firebase hosting:channel:deploy staging --expires 7d
```

That prints a `*.web.app` URL. Open it. Check:

- `/` renders, dark mode toggle works
- `/blog` loads a post, and `/blog/?post=exponential-backoff-gtm` loads that one
- `/now` renders
- the resume PDFs under `/Conor-Hinchee/` download
- `curl -L <preview-url> | head -n 60` still gives the curl view

When it looks right:

```bash
firebase deploy --only hosting
```

### Wire up GitHub Actions

Easiest path, it creates the service account and repo secret for you:

```bash
firebase init hosting:github
```

It writes its own workflow files. You already have hand-tuned ones, so when it
asks about overwriting, say no and just let it create the
`FIREBASE_SERVICE_ACCOUNT` secret. Then add the project id as a repo variable:

```bash
gh variable set GCP_PROJECT_ID --body "PROJECT_ID"
```

`.github/workflows/Deploy.yml` deploys `channelId: live` on every push to `2026`.
`.github/workflows/preview.yml` spins up a 7-day preview channel per PR and
comments the URL.

### Attach the domain

Firebase console → Hosting → Add custom domain → `www.conorhinchee.com`.

It will ask for a TXT record to prove ownership, then give you two A records
(or a CNAME, if you prefer). Add them at your registrar, **replacing** the
records currently pointing `www` at GitHub Pages.

Cert provisioning usually takes minutes but Google says up to 24h. The old
GitHub Pages cert keeps working until DNS actually moves, so there is no gap.

Do the apex (`conorhinchee.com`) the same way and let Firebase redirect it to
`www`, or leave the apex on its current registrar-level redirect.

---

## 2. Cloud Run (the playground)

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  cloudbuild.googleapis.com --project PROJECT_ID

gcloud artifacts repositories create web \
  --repository-format=docker \
  --location=us-central1 \
  --description="conorhinchee.com containers" \
  --project PROJECT_ID
```

Build and ship it once by hand:

```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/PROJECT_ID/web/conorhinchee-web:manual \
  --project PROJECT_ID

gcloud run deploy conorhinchee-web \
  --image us-central1-docker.pkg.dev/PROJECT_ID/web/conorhinchee-web:manual \
  --region us-central1 \
  --project PROJECT_ID \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 3 \
  --cpu 1 --memory 512Mi --port 8080
```

`--min-instances 0` is the whole reason this is cheap. Leave it there.

There is a `/healthz` endpoint in the nginx config if you want a uptime check
pointed at it later.

### Test it locally first

```bash
docker build -t conorhinchee-web .
docker run --rm -p 8080:8080 -e PORT=8080 conorhinchee-web
open http://localhost:8080
```

### Automate it

`.github/workflows/cloud-run.yml` is `workflow_dispatch` plus a push trigger
scoped to `Dockerfile` / `nginx/**`, so it does not fire on every content change
and race the Firebase deploy. It needs a `GCP_SERVICE_ACCOUNT` secret holding a
JSON key with `roles/run.admin`, `roles/artifactregistry.writer`, and
`roles/iam.serviceAccountUser`.

Workload Identity Federation is the better answer than a JSON key here. Worth
doing as a follow-up, not worth blocking the migration on.

### Give it a subdomain

```bash
gcloud beta run domain-mappings create \
  --service conorhinchee-web \
  --domain app.conorhinchee.com \
  --region us-central1 \
  --project PROJECT_ID
```

This prints the DNS records to add. Cloud Run domain mapping is free and handles
the cert. It is region-limited and a bit slower than a load balancer, which is
exactly the tradeoff you want for a playground. Do **not** stand up a global
external ALB for this; that is ~$18/month of pure overhead.

---

## 3. Rollback

GitHub Pages keeps receiving every build, so rolling back is one DNS change:
point `www` back at the GitHub Pages records. Content will be current.

For a bad Firebase deploy specifically, you do not need DNS at all:

```bash
firebase hosting:versions:list
firebase hosting:rollback
```

or use the Hosting console's release history, which is instant.

Once you have lived on Firebase for a couple of weeks, delete the
"Deploy to GitHub Pages (rollback target)" step from `Deploy.yml`.

---

## 4. What this actually costs

- **Firebase Hosting**: free tier is 10 GB stored and 360 MB/day transferred.
  This site is a few MB. Custom domain and SSL are free. Realistically $0.
- **Cloud Run**: free tier is 2M requests, 180k vCPU-seconds and 360k GiB-seconds
  per month. Scaled to zero between visits. Realistically $0.
- **Artifact Registry**: 0.5 GB free, then $0.10/GB/month. The image is ~50 MB,
  so pennies, and only if you keep a lot of old tags. Set a cleanup policy if it
  bugs you.
- **Google Workspace**: unrelated. It does not discount any of the above.

Expect a bill somewhere between $0 and $1/month, and set a budget alert anyway:

```bash
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT_ID \
  --display-name="conorhinchee.com" \
  --budget-amount=5USD \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=1.0
```

---

## 5. Known wrinkles

- **The JS/CSS bundles are not content-hashed.** `index.bundle.js` and
  `main.css` keep the same filename across deploys, so they cannot be cached
  aggressively. Both configs cap them at 10 minutes with revalidation. If you
  ever add `[contenthash]` to the webpack output, bump these to a year.
- **`CNAME` at the repo root** is GitHub Pages' custom-domain marker. It is not
  copied into `dist/`, so it does not affect Firebase. Leave it alone until you
  delete the Pages step.
- **nginx drops inherited `add_header`.** The moment a `location` sets one
  header, every `add_header` from the enclosing `server` block stops applying.
  That is why the security headers live in `nginx/security-headers.conf` and get
  `include`d into each location instead of being set once at the top. If you add
  a new `location`, include that file in it too.
- **The image build needs Docker Hub**, so run `docker build` locally rather
  than expecting it to work from a locked-down CI or sandbox.
- **`.DS_Store` files land in `dist/`.** `firebase.json` ignores `**/.*`, and
  `.dockerignore` drops them too, so they will not ship either way.
