# DealFlow360 — Complete API Reference (cURL)

> **Base URL:** `http://10.217.113.128:5050`
>
> Replace the following placeholders with real values before running:
>
> | Placeholder | Description |
> |---|---|
> | `YOUR_ACCESS_TOKEN` | JWT token from signin response |
> | `YOUR_COMPANY_ID` | UUID of a company |
> | `YOUR_USER_ID` | UUID of a user |
> | `YOUR_ROLE_ID` | UUID of a role |
> | `YOUR_PERMISSION_ID` | UUID of a permission |
> | `YOUR_LEAD_ID` | UUID of a lead |
> | `YOUR_INTERACTION_ID` | UUID of a lead interaction |

---

## 1. Authentication

### Signup
```bash
curl -X POST http://10.217.113.128:5050/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```
**Expected:** `201 Created`

---

### Signin
```bash
curl -X POST http://10.217.113.128:5050/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```
**Expected:** `200 OK` → copy `data.token` as `YOUR_ACCESS_TOKEN`

---

### Get Current User (Me)
```bash
curl -X GET http://10.217.113.128:5050/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

## 2. Companies

### Create Company
```bash
curl -X POST http://10.217.113.128:5050/api/v1/companies \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "legal_name": "Acme Corporation Pvt Ltd",
    "code": "ACME",
    "email": "contact@acme.com",
    "phone": "+91-9876543210",
    "country": "IN",
    "timezone": "Asia/Kolkata",
    "default_currency_id": "INR"
  }'
```
**Expected:** `201 Created`

---

### List All Companies
```bash
curl -X GET http://10.217.113.128:5050/api/v1/companies \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Get Company by ID
```bash
curl -X GET http://10.217.113.128:5050/api/v1/companies/YOUR_COMPANY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Update Company
```bash
curl -X PUT http://10.217.113.128:5050/api/v1/companies/YOUR_COMPANY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp Updated",
    "phone": "+91-9000000001"
  }'
```
**Expected:** `200 OK`

---

### Update Company Status
```bash
curl -X PATCH http://10.217.113.128:5050/api/v1/companies/YOUR_COMPANY_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INACTIVE"
  }'
```
**Expected:** `200 OK` | Valid values: `ACTIVE`, `INACTIVE`, `SUSPENDED`

---

## 3. Users

### Create User
```bash
curl -X POST http://10.217.113.128:5050/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "password": "password123",
    "phone": "+91-9123456789",
    "role": "SALES_REP"
  }'
```
**Expected:** `201 Created` | `password_hash` is never returned

---

### List Users
```bash
curl -X GET http://10.217.113.128:5050/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK` — only returns users from your company

---

### Get User by ID
```bash
curl -X GET http://10.217.113.128:5050/api/v1/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Update User
```bash
curl -X PUT http://10.217.113.128:5050/api/v1/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "phone": "+91-9000000002"
  }'
```
**Expected:** `200 OK`

---

### Update User Status
```bash
curl -X PATCH http://10.217.113.128:5050/api/v1/users/YOUR_USER_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INACTIVE"
  }'
```
**Expected:** `200 OK` | Valid values: `ACTIVE`, `INACTIVE`

---

## 4. Roles

### Create Role
```bash
curl -X POST http://10.217.113.128:5050/api/v1/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Manager",
    "code": "SALES_MANAGER",
    "description": "Manages the sales team"
  }'
```
**Expected:** `201 Created`

---

### List Roles
```bash
curl -X GET http://10.217.113.128:5050/api/v1/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK` — only returns roles from your company

---

### Get Role by ID
```bash
curl -X GET http://10.217.113.128:5050/api/v1/roles/YOUR_ROLE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Update Role
```bash
curl -X PUT http://10.217.113.128:5050/api/v1/roles/YOUR_ROLE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```
**Expected:** `200 OK`

---

### Delete Role
```bash
curl -X DELETE http://10.217.113.128:5050/api/v1/roles/YOUR_ROLE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK` | `409 ROLE_IN_USE` if users are assigned

---

## 5. Permissions

### Create Permission
```bash
curl -X POST http://10.217.113.128:5050/api/v1/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "leads",
    "action": "create",
    "resource": "lead",
    "description": "Can create leads"
  }'
```
**Expected:** `201 Created`

---

### List All Permissions
```bash
curl -X GET http://10.217.113.128:5050/api/v1/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Get Permission by ID
```bash
curl -X GET http://10.217.113.128:5050/api/v1/permissions/YOUR_PERMISSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Update Permission
```bash
curl -X PUT http://10.217.113.128:5050/api/v1/permissions/YOUR_PERMISSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```
**Expected:** `200 OK`

---

### Delete Permission
```bash
curl -X DELETE http://10.217.113.128:5050/api/v1/permissions/YOUR_PERMISSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

## 6. User Roles

### Assign Role to User
```bash
curl -X POST http://10.217.113.128:5050/api/v1/users/YOUR_USER_ID/roles/YOUR_ROLE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `201 Created`

---

### List User's Roles
```bash
curl -X GET http://10.217.113.128:5050/api/v1/users/YOUR_USER_ID/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Remove Role from User
```bash
curl -X DELETE http://10.217.113.128:5050/api/v1/users/YOUR_USER_ID/roles/YOUR_ROLE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

## 7. Leads

### Create Lead
```bash
curl -X POST http://10.217.113.128:5050/api/v1/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ravi",
    "last_name": "Kumar",
    "company_name": "Tech Innovations Ltd",
    "email": "ravi@techinno.com",
    "phone": "+91-9988776655",
    "source": "WEBSITE",
    "industry": "Technology",
    "country": "IN",
    "city": "Bengaluru",
    "estimated_budget": 250000,
    "requirement": "CRM integration for sales team",
    "priority": "HIGH"
  }'
```
**Expected:** `201 Created` — `lead_number` auto-generated

---

### List Leads
```bash
curl -X GET http://10.217.113.128:5050/api/v1/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

#### With Filters
```bash
# Filter by status
curl -X GET "http://10.217.113.128:5050/api/v1/leads?status=NEW" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by assigned user
curl -X GET "http://10.217.113.128:5050/api/v1/leads?assigned_user_id=YOUR_USER_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by date range
curl -X GET "http://10.217.113.128:5050/api/v1/leads?from_date=2026-01-01&to_date=2026-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Get Lead by ID
```bash
curl -X GET http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Update Lead
```bash
curl -X PUT http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Mumbai",
    "lead_score": 80,
    "score_band": "HOT",
    "assigned_user_id": "YOUR_USER_ID"
  }'
```
**Expected:** `200 OK`

---

### Update Lead Status
```bash
curl -X PATCH http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "QUALIFIED"
  }'
```
**Expected:** `200 OK` | Valid: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`, `INACTIVE`

---

### Delete Lead
```bash
curl -X DELETE http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

## 8. Lead Interactions

### Create Interaction
```bash
curl -X POST http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID/interactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interaction_type": "CALL",
    "direction": "OUTBOUND",
    "subject": "Initial discovery call",
    "notes": "Prospect is interested in the CRM module. Budget confirmed.",
    "outcome": "Positive",
    "next_followup_at": "2026-09-15T10:00:00.000Z"
  }'
```
**Expected:** `201 Created` | Valid types: `CALL`, `EMAIL`, `MEETING`, `NOTE`, `DEMO`, `FOLLOW_UP`, `OTHER`

---

### List Lead Interactions
```bash
curl -X GET http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID/interactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Get Interaction by ID
```bash
curl -X GET http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID/interactions/YOUR_INTERACTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

### Update Interaction
```bash
curl -X PUT http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID/interactions/YOUR_INTERACTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "Very Positive",
    "notes": "Updated notes after follow-up",
    "next_followup_at": "2026-09-20T14:00:00.000Z"
  }'
```
**Expected:** `200 OK`

---

### Delete Interaction
```bash
curl -X DELETE http://10.217.113.128:5050/api/v1/leads/YOUR_LEAD_ID/interactions/YOUR_INTERACTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Expected:** `200 OK`

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "code": "MACHINE_READABLE_CODE",
  "message": "Human readable description"
}
```

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `INVALID_ID` | Malformed UUID in path |
| 400 | `INVALID_REQUEST` | Missing or invalid field |
| 401 | `UNAUTHORIZED` | Missing or expired token |
| 403 | `CROSS_COMPANY_ACCESS_DENIED` | Cross-tenant access attempt |
| 404 | `COMPANY_NOT_FOUND` | Company not found |
| 404 | `USER_NOT_FOUND` | User not found |
| 404 | `ROLE_NOT_FOUND` | Role not found |
| 404 | `PERMISSION_NOT_FOUND` | Permission not found |
| 404 | `LEAD_NOT_FOUND` | Lead not found |
| 404 | `LEAD_INTERACTION_NOT_FOUND` | Interaction not found |
| 404 | `ASSIGNED_USER_NOT_FOUND` | Assigned user not found |
| 409 | `COMPANY_ALREADY_EXISTS` | Duplicate company code |
| 409 | `USER_ALREADY_EXISTS` | Duplicate email |
| 409 | `ROLE_ALREADY_EXISTS` | Duplicate role code in company |
| 409 | `ROLE_IN_USE` | Role has active user assignments |
| 409 | `PERMISSION_ALREADY_EXISTS` | Duplicate module+action+resource |
| 409 | `USER_ROLE_ALREADY_EXISTS` | Role already assigned to user |
| 409 | `USER_ROLE_NOT_FOUND` | Assignment does not exist |
| 422 | `VALIDATION_ERROR` | Joi validation failure |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |
