# VendorBridge API Documentation

This document describes the HTTP endpoints for VendorBridge, a Procurement & Vendor Management ERP.

## Base URL
`http://localhost:5000`

## Headers
All authenticated requests must include the following header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication

### Login
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "officer@vb.com",
    "password": "password123"
  }
  ```
- **Responses**:
  - **200 OK** (Success):
    ```json
    {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "name": "Priya Sharma",
        "email": "officer@vb.com",
        "role": "PROCUREMENT_OFFICER",
        "createdAt": "2026-06-06T05:00:00.000Z"
      }
    }
    ```
  - **401 Unauthorized** (Failed):
    ```json
    {
      "message": "Invalid credentials"
    }
    ```

---

## 2. Vendors

### List Vendors
- **Method**: `GET`
- **URL**: `/api/vendors`
- **Query Parameters**:
  - `search` (Optional): Matches vendor name, contact name, or email.
  - `category` (Optional): Matches specific vendor category.
  - `isActive` (Optional): `true` or `false` to filter by active status.
- **Role Gating**: Authenticated user
- **Responses**:
  - **200 OK** (Success):
    ```json
    {
      "vendors": [
        {
          "id": 1,
          "name": "Acme Hardware Pvt. Ltd.",
          "contactName": "Arjun Patel",
          "email": "acme@vendor.com",
          "phone": "+91-9876543210",
          "gstNumber": "27AABCT1234A1Z5",
          "category": "Hardware",
          "address": "42, MG Road, Bengaluru, Karnataka 560001",
          "rating": 4.5,
          "isActive": true,
          "createdAt": "2026-06-06T05:00:00.000Z",
          "userId": 4
        }
      ]
    }
    ```

### Get Vendor by ID
- **Method**: `GET`
- **URL**: `/api/vendors/:id`
- **Role Gating**: Authenticated user
- **Responses**:
  - **200 OK** (Success):
    ```json
    {
      "vendor": {
        "id": 1,
        "name": "Acme Hardware Pvt. Ltd.",
        "contactName": "Arjun Patel",
        "email": "acme@vendor.com",
        "phone": "+91-9876543210",
        "gstNumber": "27AABCT1234A1Z5",
        "category": "Hardware",
        "address": "42, MG Road, Bengaluru, Karnataka 560001",
        "rating": 4.5,
        "isActive": true,
        "createdAt": "2026-06-06T05:00:00.000Z",
        "userId": 4
      }
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "Vendor not found"
    }
    ```

### Create Vendor
- **Method**: `POST`
- **URL**: `/api/vendors`
- **Role Gating**: `PROCUREMENT_OFFICER` or `ADMIN`
- **Request Body**:
  ```json
  {
    "name": "Global Solutions Ltd.",
    "contactName": "Rajiv Kumar",
    "email": "rajiv@globalsolutions.com",
    "phone": "+91-9998887776",
    "gstNumber": "27AABCG5555C1Z1",
    "category": "Consulting",
    "address": "101, Maker Chambers, Mumbai, Maharashtra 400021"
  }
  ```
- **Responses**:
  - **201 Created** (Success):
    ```json
    {
      "vendor": {
        "id": 4,
        "name": "Global Solutions Ltd.",
        "contactName": "Rajiv Kumar",
        "email": "rajiv@globalsolutions.com",
        "phone": "+91-9998887776",
        "gstNumber": "27AABCG5555C1Z1",
        "category": "Consulting",
        "address": "101, Maker Chambers, Mumbai, Maharashtra 400021",
        "rating": 0.0,
        "isActive": true,
        "createdAt": "2026-06-06T05:40:00.000Z",
        "userId": null
      }
    }
    ```
  - **409 Conflict** (Email already exists):
    ```json
    {
      "message": "Vendor with this email already exists"
    }
    ```

### Update Vendor
- **Method**: `PUT`
- **URL**: `/api/vendors/:id`
- **Role Gating**: `PROCUREMENT_OFFICER` or `ADMIN`
- **Request Body**:
  ```json
  {
    "name": "Global Solutions Inc.",
    "contactName": "Rajiv Kumar",
    "phone": "+91-9998887770"
  }
  ```
- **Responses**:
  - **200 OK** (Success): Returns updated vendor object.
  - **404 Not Found**:
    ```json
    {
      "message": "Vendor not found"
    }
    ```

### Delete Vendor (Soft Delete)
- **Method**: `DELETE`
- **URL**: `/api/vendors/:id`
- **Role Gating**: `ADMIN`
- **Responses**:
  - **200 OK** (Success): Sets `isActive: false` and returns the vendor object.
  - **404 Not Found**:
    ```json
    {
      "message": "Vendor not found"
    }
    ```

---

## 3. RFQs

### List RFQs
- **Method**: `GET`
- **URL**: `/api/rfqs`
- **Query Parameters**:
  - `status` (Optional): Filter by `DRAFT`, `PUBLISHED`, `CLOSED`, or `CANCELLED`.
- **Role Gating**: Authenticated user. Vendors only see RFQs they are invited to.
- **Responses**:
  - **200 OK**: Returns list of RFQs `{ rfqs: [...] }`.

### Get RFQ
- **Method**: `GET`
- **URL**: `/api/rfqs/:id`
- **Role Gating**: Authenticated user.
- **Responses**:
  - **200 OK**: Returns RFQ with items, invited vendors, and quotations.
  - **404 Not Found**: `{ "message": "RFQ not found" }`

### Create RFQ
- **Method**: `POST`
- **URL**: `/api/rfqs`
- **Role Gating**: `PROCUREMENT_OFFICER`
- **Request Body**:
  ```json
  {
    "title": "Office Stationery Supplies Q3",
    "description": "Quarterly office supplies procurement",
    "deadline": "2026-08-01T00:00:00.000Z",
    "items": [
      { "productName": "A4 Paper Reams", "description": "80GSM Premium A4 Paper", "quantity": 100, "unit": "reams" }
    ],
    "vendorIds": [1, 2]
  }
  ```
- **Responses**:
  - **201 Created**: Returns created RFQ `{ rfq }`.

### Publish RFQ
- **Method**: `PUT`
- **URL**: `/api/rfqs/:id/publish`
- **Role Gating**: `PROCUREMENT_OFFICER`
- **Responses**:
  - **200 OK**: Moves status to `PUBLISHED` and returns RFQ.

### Close RFQ
- **Method**: `PUT`
- **URL**: `/api/rfqs/:id/close`
- **Role Gating**: `PROCUREMENT_OFFICER`, `MANAGER`, or `ADMIN`
- **Responses**:
  - **200 OK**: Moves status to `CLOSED` and returns RFQ.

---

## 4. Quotations

### List Quotations
- **Method**: `GET`
- **URL**: `/api/quotations`
- **Query Parameters**:
  - `rfqId` (Optional): Filter by RFQ.
  - `status` (Optional): Filter by status.
- **Role Gating**: Authenticated user. Vendors only see their own quotations.
- **Responses**:
  - **200 OK**: Returns `{ quotations: [...] }`.

### Get Quotations for RFQ (Comparison View)
- **Method**: `GET`
- **URL**: `/api/rfqs/:rfqId/quotations`
- **Role Gating**: `PROCUREMENT_OFFICER`, `MANAGER`, or `ADMIN`
- **Responses**:
  - **200 OK**: Returns list of quotations sorted by price ascending.

### Create Quotation
- **Method**: `POST`
- **URL**: `/api/quotations`
- **Role Gating**: `VENDOR`
- **Request Body**:
  ```json
  {
    "rfqId": 1,
    "deliveryDays": 7,
    "notes": "Fast shipping.",
    "items": [
      { "productName": "A4 Paper Reams", "quantity": 100, "unitPrice": 250.00 }
    ]
  }
  ```
- **Responses**:
  - **201 Created**: Computes prices/totals and returns created quotation `{ quotation }`.
  - **403 Forbidden**: If vendor was not invited to this RFQ.
  - **409 Conflict**: If vendor has already submitted a quotation for this RFQ.

### Update Quotation
- **Method**: `PUT`
- **URL**: `/api/quotations/:id`
- **Role Gating**: `VENDOR` (Must own the quotation and status must be `SUBMITTED`)
- **Responses**:
  - **200 OK**: Returns updated quotation.

---

## 5. Approvals

### List Pending Approvals
- **Method**: `GET`
- **URL**: `/api/approvals/pending`
- **Role Gating**: `MANAGER`
- **Responses**:
  - **200 OK**: Returns `{ approvals: [...] }`.

### Submit for Approval
- **Method**: `POST`
- **URL**: `/api/approvals`
- **Role Gating**: `PROCUREMENT_OFFICER`
- **Request Body**:
  ```json
  {
    "quotationId": 1,
    "approverId": 2
  }
  ```
- **Responses**:
  - **201 Created**: Creates approval record, sets quotation status to `UNDER_REVIEW`, returns `{ approval }`.

### Decide Approval
- **Method**: `POST`
- **URL**: `/api/approvals/:id/decide`
- **Role Gating**: `MANAGER`
- **Request Body**:
  ```json
  {
    "status": "APPROVED",
    "remarks": "Price is competitive and within budget."
  }
  ```
- **Responses**:
  - **200 OK**: Updates approval, updates quotation status accordingly, sets decidedAt, returns `{ approval }`.

---

## 6. Purchase Orders (PO)

### List Purchase Orders
- **Method**: `GET`
- **URL**: `/api/pos`
- **Role Gating**: Authenticated user. Vendors only see POs from their quotations.
- **Responses**:
  - **200 OK**: Returns `{ pos: [...] }`.

### Get Purchase Order
- **Method**: `GET`
- **URL**: `/api/pos/:id`
- **Role Gating**: Authenticated user.
- **Responses**:
  - **200 OK**: Returns `{ po }`.

### Create PO from Quotation
- **Method**: `POST`
- **URL**: `/api/pos/from-quotation/:quotationId`
- **Role Gating**: `PROCUREMENT_OFFICER`
- **Responses**:
  - **201 Created**: Creates PO, copies totalAmount, returns `{ po }`.

---

## 7. Invoices

### List Invoices
- **Method**: `GET`
- **URL**: `/api/invoices`
- **Role Gating**: Authenticated user. Vendors only see their own invoices.
- **Responses**:
  - **200 OK**: Returns `{ invoices: [...] }`.

### Get Invoice
- **Method**: `GET`
- **URL**: `/api/invoices/:id`
- **Role Gating**: Authenticated user.
- **Responses**:
  - **200 OK**: Returns `{ invoice }`.

### Create Invoice from PO
- **Method**: `POST`
- **URL**: `/api/invoices/from-po/:poId`
- **Role Gating**: `PROCUREMENT_OFFICER`
- **Responses**:
  - **201 Created**: Generates invoice, computes 18% tax, returns `{ invoice }`.

### Get Invoice PDF
- **Method**: `GET`
- **URL**: `/api/invoices/:id/pdf`
- **Role Gating**: Authenticated user.
- **Responses**:
  - **200 OK**: Streams the generated PDF binary with headers `Content-Type: application/pdf` and `Content-Disposition: inline; filename="<invoiceNumber>.pdf"`.

### Send Invoice via Email
- **Method**: `POST`
- **URL**: `/api/invoices/:id/email`
- **Role Gating**: Authenticated user.
- **Responses**:
  - **200 OK**: Generates PDF, connects to SMTP/test-transporter, sends email with attachment, marks invoice as sent (`emailSentAt = now`), and returns details:
    ```json
    {
      "success": true,
      "message": "Email sent",
      "previewUrl": "https://ethereal.email/message/..."
    }
    ```

---

## 8. Dashboard Summary

### Get Dashboard Summary
- **Method**: `GET`
- **URL**: `/api/dashboard/summary`
- **Role Gating**: Authenticated user. Role-aware counts.
- **Responses**:
  - **200 OK**:
    ```json
    {
      "pendingApprovals": 1,
      "activeRFQs": 2,
      "recentPOs": 5,
      "recentInvoices": 3,
      "totalVendors": 12
    }
    ```

---

## 9. Activity Log

### List Activity Logs
- **Method**: `GET`
- **URL**: `/api/activity`
- **Query Parameters**:
  - `entityType` (Optional): Filter by entity (e.g., `RFQ`, `Quotation`, `Vendor`, `Approval`, `PurchaseOrder`, `Invoice`).
  - `entityId` (Optional): Filter by specific entity ID.
  - `limit` (Optional): Limit size of results (default 50).
- **Role Gating**: Authenticated user. Vendors see only their own logs.
- **Responses**:
  - **200 OK**: Returns `{ logs: [...] }`.
