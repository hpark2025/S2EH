# S2EH Backend ERD (Mermaid)

This file contains an ERD for the `s2eh_db` database in Mermaid `erDiagram` format. Save it and open with a Mermaid preview extension in VS Code or paste into the Mermaid Live Editor (https://mermaid.live/) to render.

```mermaid
classDiagram
    class USERS {
        int id
        string email
        string password
        string first_name
        string last_name
        string phone
        string role
        string status
        bool email_verified
        timestamp created_at
    }

    class ADMINS {
        int id
        string email
        string password
        string full_name
        string role
        longtext permissions
        string status
        timestamp created_at
    }

    class SELLERS {
        int id
        string email
        string password
        string business_name
        string owner_name
        string phone
        string business_type
        text business_description
        string verification_status
        string status
        bool is_lgu_verified
        string tax_id
        string business_permit
        timestamp created_at
    }

    class SESSIONS {
        int id
        int user_id
        int seller_id
        int admin_id
        string token
        string user_type
        string ip_address
        text user_agent
        timestamp expires_at
    }

    class ADDRESSES {
        int id
        int user_id
        int seller_id
        string address_type
        string first_name
        string last_name
        string phone
        string address_line_1
        string address_line_2
        string barangay
        string municipality
        string city
        string province
        string postal_code
        bool is_default
        timestamp created_at
    }

    class CATEGORIES {
        int id
        string name
        string slug
        text description
        int parent_id
        string image_url
        bool is_active
        int display_order
        timestamp created_at
    }

    class PRODUCTS {
        int id
        int seller_id
        int category_id
        string title
        string slug
        text description
        decimal price
        string sku
        string unit
        int stock_quantity
        string status
        string thumbnail
        longtext images
        timestamp created_at
    }

    class CARTS {
        int id
        int user_id
        string session_id
        timestamp created_at
    }

    class CART_ITEMS {
        int id
        int cart_id
        int product_id
        int quantity
        decimal price
        timestamp created_at
    }

    class ORDERS {
        int id
        string order_number
        int user_id
        int seller_id
        string status
        string payment_status
        string payment_method
        decimal subtotal
        decimal shipping_fee
        decimal total
        int shipping_address_id
        int billing_address_id
        timestamp created_at
    }

    class ORDER_ITEMS {
        int id
        int order_id
        int product_id
        string product_title
        int quantity
        decimal unit_price
        decimal subtotal
        timestamp created_at
    }

    class MESSAGES {
        int id
        int sender_id
        string sender_type
        int receiver_id
        string receiver_type
        string subject
        text message
        bool is_read
        int parent_message_id
        timestamp created_at
    }

    %% Relationships (use multiplicity notation to avoid curly-brace arrows)
    USERS "1" --> "*" ADDRESSES : has
    SELLERS "1" --> "*" ADDRESSES : has

    USERS "1" --> "*" SESSIONS : has
    SELLERS "1" --> "*" SESSIONS : has
    ADMINS "1" --> "*" SESSIONS : has

    USERS "1" --> "*" CARTS : owns
    CARTS "1" --> "*" CART_ITEMS : contains
    PRODUCTS "1" --> "*" CART_ITEMS : referenced_in

    SELLERS "1" --> "*" PRODUCTS : lists
    CATEGORIES "1" --> "*" PRODUCTS : categorizes

    USERS "1" --> "*" ORDERS : places
    SELLERS "1" --> "*" ORDERS : receives
    ORDERS "1" --> "*" ORDER_ITEMS : contains
    PRODUCTS "1" --> "*" ORDER_ITEMS : referenced_in

    ORDERS "1" --> "1" ADDRESSES : shipping_address
    ORDERS "1" --> "1" ADDRESSES : billing_address

    MESSAGES "1" --> "*" MESSAGES : replies_to

    %% Optional: parent category
    CATEGORIES "1" --> "*" CATEGORIES : parent_of

``` 

Notes:
- PK = primary key; FK = foreign key.
- Some tables (e.g., `sessions`, `addresses`) have nullable foreign keys for multiple user types; the diagram shows relationships for clarity but runtime logic uses `user_type` to determine which FK is active.
- `messages` uses polymorphic sender/receiver (`sender_type`, `receiver_type`) — modeled in schema as fields rather than strict FKs.

How to render:
- In VS Code install the "Markdown Preview Mermaid Support" or the official "Mermaid Markdown Syntax Highlighting" extension, then open `ERD.md` and preview the Mermaid block.
- Or paste the Mermaid block into https://mermaid.live/ to generate PNG/SVG.

If you'd like, I can also:
- Produce a PlantUML `.puml` file.
- Export a PNG (requires a mermaid CLI or using the Mermaid Live Editor to export).
- Simplify the diagram to only core entities for a quick printable ERD.
