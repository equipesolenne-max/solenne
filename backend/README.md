# Solenne Django backend

This backend is the first migration increment. Firebase remains installed and untouched so the frontend can be migrated progressively and Firebase can remain a rollback source.

## Local development

The default configuration uses SQLite when `DATABASE_URL` is absent, which allows local API checks without PostgreSQL. Production should set `DATABASE_URL` and PostgreSQL variables from `.env`.

```powershell
cd backend
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

API base URL: `http://127.0.0.1:8000/api/`

Implemented endpoints:

```text
POST /auth/register/
POST /auth/login/
POST /auth/refresh/
GET|PATCH /auth/me/
GET /products/ and /products/{id}/
GET /collections/ and /collections/{id}/
GET /categories/
GET|POST|PATCH|DELETE /addresses/
GET /cart/
POST /cart/items/
GET|POST /orders/
POST /newsletter/subscribe/
```

Order creation is server-authoritative: product prices, variant/product stock, shipping and totals are calculated inside a database transaction. The idempotency key is scoped to the authenticated user.

## Firebase migration

A non-destructive migration command will use Firebase Admin credentials to import Firestore documents while retaining legacy IDs. It must be run against a backup and then verified by counts before any Firebase cleanup. Live Firebase counts cannot be produced from this repository alone.
