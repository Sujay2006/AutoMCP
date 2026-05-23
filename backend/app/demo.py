"""Akaunting demo data — port of automcp/lib/demo.ts (now archived).

Used by the /api/scan/akaunting-demo path and by /api/generate-mcp when the
project's source_type is 'akaunting_demo' (the generated Worker embeds the
mock responses so the demo MCP returns realistic data without a backend).
"""

from __future__ import annotations

from typing import Any

from app.models import (
    ActionInput,
    Classification,
    DetectedAction,
    JsonSchema,
    JsonSchemaProperty,
    ProposedTool,
)

AKAUNTING_SOURCE_URL = "https://github.com/akaunting/akaunting"

AKAUNTING_CLASSIFICATION = Classification(
    type="laravel",
    confidence=1.0,
    signals=[
        "composer.json present",
        "Laravel structure detected",
        "Akaunting accounting platform",
    ],
)

AKAUNTING_DETECTED_ACTIONS: list[DetectedAction] = [
    DetectedAction(
        name="list_invoices",
        description="List invoices, optionally filtered by status.",
        http_method="GET",
        path="/api/documents",
        inputs=[ActionInput(name="status", type="string", description="Invoice status filter")],
        output_description="An array of invoices.",
        is_write=False,
        requires_auth=True,
        content_type="application/json",
        source_file="app/Http/Controllers/Api/Document/Documents.php",
        confidence=0.95,
    ),
    DetectedAction(
        name="show_invoice",
        description="Show a single invoice with its line items.",
        http_method="GET",
        path="/api/documents/{id}",
        inputs=[ActionInput(name="id", type="string", description="Invoice ID")],
        output_description="A single invoice with line items.",
        is_write=False,
        requires_auth=True,
        content_type="application/json",
        source_file="app/Http/Controllers/Api/Document/Documents.php",
        confidence=0.95,
    ),
    DetectedAction(
        name="create_invoice",
        description="Create a new invoice.",
        http_method="POST",
        path="/api/documents",
        inputs=[
            ActionInput(name="customer_id", type="string", description="Customer the invoice is for"),
            ActionInput(name="items", type="array", description="Line items"),
        ],
        output_description="The created invoice.",
        is_write=True,
        requires_auth=True,
        content_type="application/json",
        source_file="app/Http/Controllers/Api/Document/Documents.php",
        confidence=0.9,
    ),
    DetectedAction(
        name="mark_invoice_paid",
        description="Record a payment against an invoice.",
        http_method="POST",
        path="/api/documents/{id}/transactions",
        inputs=[
            ActionInput(name="id", type="string", description="Invoice ID"),
            ActionInput(name="amount", type="number", description="Payment amount"),
        ],
        output_description="Confirmation of the recorded payment.",
        is_write=True,
        requires_auth=True,
        content_type="application/json",
        source_file="app/Http/Controllers/Api/Document/Transactions.php",
        confidence=0.9,
    ),
    DetectedAction(
        name="list_contacts",
        description="List customers and vendors.",
        http_method="GET",
        path="/api/contacts",
        inputs=[ActionInput(name="search", type="string", description="Name search")],
        output_description="An array of contacts.",
        is_write=False,
        requires_auth=True,
        content_type="application/json",
        source_file="app/Http/Controllers/Api/Common/Contacts.php",
        confidence=0.95,
    ),
    DetectedAction(
        name="get_reports",
        description="Generate financial reports.",
        http_method="GET",
        path="/api/reports",
        inputs=[ActionInput(name="period", type="string", description="Reporting period")],
        output_description="Report data.",
        is_write=False,
        requires_auth=True,
        content_type="application/json",
        source_file="app/Http/Controllers/Api/Report/Reports.php",
        confidence=0.85,
    ),
    DetectedAction(
        name="send_invoice_email",
        description="Email an invoice to the customer.",
        http_method="POST",
        path="/api/documents/{id}/emails",
        inputs=[ActionInput(name="invoice_id", type="string", description="Invoice ID")],
        output_description="Confirmation the email was sent.",
        is_write=True,
        requires_auth=True,
        content_type="application/json",
        source_file="app/Http/Controllers/Api/Document/Emails.php",
        confidence=0.85,
    ),
]


def _prop(type_: str, description: str, enum: list[str] | None = None) -> JsonSchemaProperty:
    return JsonSchemaProperty(type=type_, description=description, enum=enum)


AKAUNTING_TOOLS: list[ProposedTool] = [
    ProposedTool(
        name="list_invoices",
        description=(
            "List all invoices, optionally filtered by status (draft, sent, paid, overdue). "
            "Use this when the user wants an overview of invoices or to find invoices in a particular state."
        ),
        inputSchema=JsonSchema(
            type="object",
            properties={
                "status": _prop(
                    "string",
                    "Filter by invoice status",
                    enum=["draft", "sent", "paid", "overdue"],
                ),
            },
            required=[],
        ),
        is_write=False,
        source_action=["list_invoices"],
    ),
    ProposedTool(
        name="get_invoice",
        description=(
            "Retrieve a specific invoice by ID, including line items, customer details, and payment status. "
            "Use this when the user asks about a particular invoice."
        ),
        inputSchema=JsonSchema(
            type="object",
            properties={"id": _prop("string", "The invoice ID")},
            required=["id"],
        ),
        is_write=False,
        source_action=["show_invoice"],
    ),
    ProposedTool(
        name="create_invoice",
        description=(
            "Create a new invoice for a customer. Provide the customer ID and a list of line items. "
            "Use this when the user wants to bill a customer."
        ),
        inputSchema=JsonSchema(
            type="object",
            properties={
                "customer_id": _prop("string", "The customer to bill"),
                "items": _prop(
                    "array", "Line items, each with a name, quantity, and price"
                ),
            },
            required=["customer_id", "items"],
        ),
        is_write=True,
        source_action=["create_invoice"],
    ),
    ProposedTool(
        name="mark_paid",
        description=(
            "Mark an invoice as paid. Use this when a customer has confirmed payment for an invoice."
        ),
        inputSchema=JsonSchema(
            type="object",
            properties={
                "id": _prop("string", "The invoice ID"),
                "amount": _prop("number", "The amount paid"),
            },
            required=["id", "amount"],
        ),
        is_write=True,
        source_action=["mark_invoice_paid"],
    ),
    ProposedTool(
        name="list_customers",
        description=(
            "List all customers, optionally filtered by name. "
            "Use this to look up a customer's ID before creating an invoice or to review the customer base."
        ),
        inputSchema=JsonSchema(
            type="object",
            properties={"search": _prop("string", "Filter customers by name")},
            required=[],
        ),
        is_write=False,
        source_action=["list_contacts"],
    ),
    ProposedTool(
        name="get_balance_sheet",
        description=(
            "Get the current balance sheet for a given period. "
            "Use this when the user asks about the company's financial position, assets, or liabilities."
        ),
        inputSchema=JsonSchema(
            type="object",
            properties={"period": _prop("string", "Reporting period, e.g. '2026-Q1'")},
            required=[],
        ),
        is_write=False,
        source_action=["get_reports"],
    ),
    ProposedTool(
        name="send_payment_reminder",
        description=(
            "Send a payment reminder email to a customer for an overdue invoice. "
            "Use this when the user wants to chase an unpaid invoice."
        ),
        inputSchema=JsonSchema(
            type="object",
            properties={"invoice_id": _prop("string", "The overdue invoice ID")},
            required=["invoice_id"],
        ),
        is_write=True,
        source_action=["send_invoice_email"],
    ),
]


AKAUNTING_MOCK: dict[str, Any] = {
    "list_invoices": {
        "invoices": [
            {"id": "INV-1001", "customer": "Northwind Traders",   "amount": 2400.0,  "status": "paid",    "due_date": "2026-04-15"},
            {"id": "INV-1002", "customer": "Globex Corporation",  "amount": 5180.5,  "status": "overdue", "due_date": "2026-04-30"},
            {"id": "INV-1003", "customer": "Initech LLC",         "amount": 980.0,   "status": "sent",    "due_date": "2026-06-01"},
            {"id": "INV-1004", "customer": "Soylent Industries",  "amount": 12750.0, "status": "overdue", "due_date": "2026-04-10"},
            {"id": "INV-1005", "customer": "Umbrella Health",     "amount": 3300.0,  "status": "draft",   "due_date": "2026-06-20"},
        ],
        "count": 5,
    },
    "get_invoice": {
        "id": "INV-1002",
        "customer": {"id": "CUST-02", "name": "Globex Corporation", "email": "ap@globex.com"},
        "status": "overdue",
        "issue_date": "2026-03-30",
        "due_date": "2026-04-30",
        "line_items": [
            {"name": "Consulting — March", "quantity": 40, "unit_price": 120.0, "total": 4800.0},
            {"name": "Cloud hosting", "quantity": 1, "unit_price": 380.5, "total": 380.5},
        ],
        "subtotal": 5180.5,
        "tax": 0,
        "total": 5180.5,
        "amount_paid": 0,
        "balance_due": 5180.5,
    },
    "create_invoice": {
        "id": "INV-1006",
        "status": "draft",
        "customer_id": "CUST-01",
        "created": True,
        "message": "Invoice INV-1006 created as a draft. Review and send it from Akaunting.",
    },
    "mark_paid": {
        "id": "INV-1002",
        "status": "paid",
        "amount_recorded": 5180.5,
        "message": "Payment recorded. Invoice INV-1002 is now marked as paid.",
    },
    "list_customers": {
        "customers": [
            {"id": "CUST-01", "name": "Northwind Traders",  "email": "billing@northwind.com",  "outstanding": 0},
            {"id": "CUST-02", "name": "Globex Corporation", "email": "ap@globex.com",          "outstanding": 5180.5},
            {"id": "CUST-03", "name": "Initech LLC",        "email": "accounts@initech.com",   "outstanding": 980.0},
            {"id": "CUST-04", "name": "Soylent Industries", "email": "finance@soylent.com",    "outstanding": 12750.0},
            {"id": "CUST-05", "name": "Umbrella Health",    "email": "ap@umbrella.health",     "outstanding": 0},
        ],
        "count": 5,
    },
    "get_balance_sheet": {
        "period": "2026-Q2",
        "assets":      {"cash": 84200.0, "accounts_receivable": 18910.5, "total": 103110.5},
        "liabilities": {"accounts_payable": 9400.0, "total": 9400.0},
        "equity":      {"retained_earnings": 93710.5, "total": 93710.5},
    },
    "send_payment_reminder": {
        "invoice_id": "INV-1002",
        "sent": True,
        "to": "ap@globex.com",
        "message": "Payment reminder for INV-1002 ($5,180.50) emailed to Globex Corporation.",
    },
}
