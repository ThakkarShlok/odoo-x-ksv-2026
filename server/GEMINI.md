You are building the backend HTTP layer for VendorBridge — a Procurement & Vendor Management ERP. The Prisma schema is already done and migrated. You are adding controllers and routes ON TOP of the existing boilerplate, NOT replacing anything.

First, read these files to understand the codebase:

- server/server.js
- server/prisma/schema.prisma (READ CAREFULLY — 11 models with relations)
- server/prisma/seed.js (to understand seed data and credentials)
- server/controllers/authController.js (follow this pattern exactly)
- server/middleware/authMiddleware.js
- server/middleware/roleMiddleware.js
- server/routes/authRoutes.js
- server/utils/prismaClient.js

EXISTING PATTERNS TO FOLLOW (do not deviate):

- Controllers use async/await with try/catch + next(err) for errors
- Responses return JSON: for create, return { entity }; for list, return { entities } or an array
- Auth via authMiddleware (already exists), role gating via requireRole(...roles)
- Prisma client imported from ../utils/prismaClient
- Routes mounted in server.js with app.use('/api/...', routes)
- 2-space indent, no semicolons at line ends, single quotes — match existing files exactly

CRITICAL SCHEMA DETAIL — read this twice:

- A User with role=VENDOR is linked to a Vendor record via Vendor.userId
- ALWAYS look up vendor records by userId, NEVER by email:
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } })

ROLES (Prisma enum): PROCUREMENT_OFFICER, VENDOR, MANAGER, ADMIN

SEEDED LOGIN CREDENTIALS (for testing):

- officer@vb.com / password123 (PROCUREMENT_OFFICER)
- manager@vb.com / password123 (MANAGER)
- admin@vb.com / password123 (ADMIN)
- acme@vendor.com / password123 (VENDOR, linked to Acme Hardware)
- techsupplies@vendor.com / password123 (VENDOR, linked to TechSupplies India)
- officemart@vendor.com / password123 (VENDOR, linked to OfficeMart Solutions)

TASK: Build the backend HTTP layer. Both controllers AND route files.

Create these new files:

1. server/utils/activityLogger.js
   - Export async function logActivity(userId, action, entityType, entityId, metadata = null)
   - Inserts a row into ActivityLog via Prisma
   - Wrap in try/catch but NEVER throw — log failures should never break the parent action; just console.error

2. server/utils/numberGenerator.js
   - Export: generateRFQNumber(), generateQuotationNumber(), generatePONumber(), generateInvoiceNumber()
   - Format: "RFQ-2026-0001", "QUO-2026-0001", "PO-2026-0001", "INV-2026-0001"
   - Implementation: count existing rows in the relevant Prisma model + 1, then padStart(4, '0')
   - Race-acceptable for hackathon scope (no transaction needed)

3. server/controllers/vendorController.js
   - listVendors: GET — supports ?search= ?category= ?isActive= query params, returns { vendors }
   - getVendor: GET by id
   - createVendor: POST, role PROCUREMENT_OFFICER or ADMIN — body { name, contactName, email, phone, gstNumber?, category, address }; logs activity
   - updateVendor: PUT by id, same roles
   - deleteVendor: DELETE by id, role ADMIN only — soft delete: set isActive=false

4. server/controllers/rfqController.js
   - listRFQs: GET — vendor sees ONLY RFQs they're invited to (join via RFQVendor → Vendor by userId); officer/manager/admin see all; filter ?status=
   - getRFQ: GET by id, includes items + assigned vendors + quotations
   - createRFQ: POST, role PROCUREMENT_OFFICER — body { title, description, deadline, items: [{productName, description, quantity, unit}], vendorIds: [number] }; status starts DRAFT; uses generateRFQNumber; logs activity
   - publishRFQ: PUT /:id/publish, role PROCUREMENT_OFFICER — moves DRAFT → PUBLISHED; logs activity
   - closeRFQ: PUT /:id/close — moves to CLOSED

5. server/controllers/quotationController.js
   - listQuotations: GET — vendor sees only their own (via Vendor.userId); others see all; filters ?rfqId= ?status=
   - getQuotationsForRFQ: GET /api/rfqs/:rfqId/quotations — for comparison view; includes vendor details + items
   - createQuotation: POST, role VENDOR — body { rfqId, items: [{productName, quantity, unitPrice}], deliveryDays, notes? }
     - Compute each item totalPrice = quantity \* unitPrice
     - Compute totalAmount = sum of all item totalPrices
     - Look up vendor via prisma.vendor.findUnique({ where: { userId: req.user.id } })
     - Verify vendor is invited to that RFQ (check RFQVendor table)
     - Uses generateQuotationNumber; logs activity
   - updateQuotation: PUT by id, role VENDOR — only if status=SUBMITTED and vendor owns it

6. server/controllers/approvalController.js
   - listPendingApprovals: GET /api/approvals/pending, role MANAGER — returns approvals with status=PENDING including quotation + RFQ + vendor info
   - submitForApproval: POST /api/approvals, role PROCUREMENT_OFFICER — body { quotationId, approverId } — creates Approval (status=PENDING), updates quotation to status=UNDER_REVIEW; logs activity
   - decideApproval: POST /api/approvals/:id/decide, role MANAGER — body { status: 'APPROVED'|'REJECTED', remarks }; updates approval, updates quotation status to APPROVED or REJECTED accordingly, sets decidedAt = now; logs activity

7. server/controllers/purchaseOrderController.js
   - listPOs: GET — vendor sees POs from their quotations only (via Vendor.userId); others see all
   - getPO: GET by id, includes quotation + vendor + items
   - createPOFromQuotation: POST /api/pos/from-quotation/:quotationId, role PROCUREMENT_OFFICER — only if quotation.status='APPROVED' and no PO exists yet; uses generatePONumber; copies totalAmount from quotation; logs activity

8. server/controllers/invoiceController.js
   - listInvoices: GET — vendor-scoped for VENDOR role
   - getInvoice: GET by id, includes PO + quotation + items
   - createInvoiceFromPO: POST /api/invoices/from-po/:poId, role PROCUREMENT_OFFICER — uses generateInvoiceNumber; subtotal = PO totalAmount; taxRate default 18.00; taxAmount = subtotal \* 0.18; totalAmount = subtotal + taxAmount; logs activity
   - getInvoicePDF: GET /api/invoices/:id/pdf — STUB: return res.status(501).json({ message: "PDF generation endpoint — coming in next iteration" })
   - sendInvoiceEmail: POST /api/invoices/:id/email — STUB: set emailSentAt = now, log activity "Sent invoice via email to <vendor email>", return { success: true, message: "Email sent" }. Do NOT wire real SMTP.

9. server/controllers/dashboardController.js
   - getSummary: GET /api/dashboard/summary, any authenticated user — returns role-aware counts:
     { pendingApprovals, activeRFQs, recentPOs, recentInvoices, totalVendors }
     For VENDOR role, scope counts to that vendor only (via Vendor.userId)

10. server/controllers/activityLogController.js
    - listActivity: GET /api/activity, supports ?entityType= &entityId= &limit= (default 50)
    - VENDOR sees only logs where userId matches their User.id
    - Others see all
    - Order by createdAt desc, include user name in response

11. Create route files matching each controller:
    server/routes/vendorRoutes.js
    server/routes/rfqRoutes.js
    server/routes/quotationRoutes.js
    server/routes/approvalRoutes.js
    server/routes/purchaseOrderRoutes.js
    server/routes/invoiceRoutes.js
    server/routes/dashboardRoutes.js
    server/routes/activityLogRoutes.js
    Each uses express Router(), applies authMiddleware globally, applies requireRole as needed per route.

12. Mount all new routes in server.js (APPEND to existing file, do not rewrite the whole thing):
    app.use('/api/vendors', vendorRoutes)
    app.use('/api/rfqs', rfqRoutes)
    app.use('/api/quotations', quotationRoutes)
    app.use('/api/approvals', approvalRoutes)
    app.use('/api/pos', purchaseOrderRoutes)
    app.use('/api/invoices', invoiceRoutes)
    app.use('/api/dashboard', dashboardRoutes)
    app.use('/api/activity', activityLogRoutes)

13. Verification — run npm run dev, server should start without errors. Then in a second terminal:
    a. POST /api/auth/login with officer@vb.com / password123 → save the token
    b. GET /api/vendors with that Bearer token → should return 3 seeded vendors
    c. GET /api/dashboard/summary with that token → should return counts
    d. POST /api/auth/login with acme@vendor.com / password123 → save vendor token
    e. GET /api/rfqs with vendor token → should return ONLY the seeded RFQ-2026-001 (because acme is invited)
    f. GET /api/dashboard/summary with vendor token → should return vendor-scoped counts

    Report the JSON responses for each test.

HARD RULES:

- DO NOT install any new npm packages. Use only what's in package.json.
- DO NOT modify schema, seed, frontend files, .env, authController, authMiddleware, or roleMiddleware.
- DO NOT add validation libraries, swagger, or tests.
- DO NOT rewrite server.js — only APPEND the new route mounts to the existing file.
- Match the existing code style exactly (2-space indent, no semicolons at line ends, single quotes).

Stop after step 13 and report:

- Which controllers compiled without errors
- Server startup status
- The JSON responses from all 6 verification tests
- Any deviations from these instructions you needed to make and why

IMPORTANT:
Create a json/md file for documenting the expected request, method, format, and expected outputs (success and failed ones too)
