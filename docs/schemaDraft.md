📌 Table: addresses
PK:
* id
Columns:
* address (text)
* township (text NOT NULL)
* city (text NOT NULL)
* district (text NOT NULL)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())

📌 Table: users
PK:
* id
Columns:
* name (text NOT NULL)
* email (text NOT NULL UNIQUE)
* password (text NOT NULL)
* phone_no (text, NOT NULL)
* address_id (FK → addresses.id ON DELETE SET NULL)
* role (enum: customer | technician | admin NOT NULL)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())

Users will log in using email and password. 
When customer creating a new account via their iOS app, they will have to provide a name, email, password, phone number and address.
Technician accounts are created by admin, admin put in name, email, password and phone and district to create it.
Admin accounts are manually put into database.

📌 Table: products
PK:
* id
Columns:
* name (text NOT NULL)
* product_model (text NOT NULL UNIQUE)
* brand (text, NOT NULL)
* price (decimal(10,2))
* description (text)
* capacity (numeric)
* type (enum: split | window | cassette | portable | central, NOT NULL)
* energy_rating (integer)
* cooling_power (integer)
* refrigerant (text)
* warranty (integer)
* tagline (text)
* voltage_average (integer)
* voltage_count (integer)
* release_date (date)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())

Products can be manually added by admin. admin can also edit, update, delete them. Customers can browse them.

📌 Table: product_images
PK:
* id
Columns:
* product_id (FK → products.id ON DELETE CASCADE, NOT NULL)
* url (text NOT NULL)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())

A product can have multiple images attached. Images will be stored in supabase storage or some other object storage and the return url is stored in database.

📌 Table: customer_products
A customer-registered aircon.
PK:
* id
Columns:
* customer_id (FK → users.id ON DELETE CASCADE, NOT NULL)
* product_id (FK → products.id ON DELETE RESTRICT, NOT NULL)
* name (text NOT NULL)
* purchase_date (date)
* qr_url (text UNIQUE)
* purchase_code (text UNIQUE)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())

Customers will have to register their purchased aircons to claim wrranty or book for servicing. registration goes like this -> choose the product they bought from the product table via a drop down or search -> give a nickname to the aircon(like bedroom aircon) -> type in unique purchase_code(if any) to claim warranty
Customer will have to manually type in a purchased_code from the purchased receipt(provided by company which is outside of our scope, as long as they are unique strings, we are fine) to claim warranty, the warranty ending data is calculated using purchased date + products.warranty(int year). If purchased_code is not provided, purchased date will be considered null so no warranty is issued)

📌 Table: timeslots
Technician's availability, always 30 days rolling.
PK:
* id
Columns:
* technician_id (FK → users.id ON DELETE CASCADE NOT NULL)
* date (date NOT NULL)
* slots (int[] NOT NULL)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())

Timeslots stores the timeslots each technician have available in each day.
past timeslots will be deleted(one row per one technician will be deleted) and a new row for each technician will be added each day. so, there will only be (30* total num of technicians) in the table at all times.


📌 Table: service_types
PK:
* id
Columns:
* name (text NOT NULL UNIQUE)
* description (text)
* service_fee (decimal(10,2) NOT NULL)
* duration (int NOT NULL)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())

Service types table is for saving all service types the company offers, each’s duration and price.

📌 Table: technician_services
Which services a technician can perform.
PK:
* (technician_id, service_id) composite
Columns:
* technician_id (FK → users.id ON DELETE CASCADE NOT NULL)
* service_id (FK → service_types.id ON DELETE CASCADE NOT NULL)
* created_at (timestamp NOT NULL default now())

📌 Table: bookings
PK:
* id
Columns:
* technician_id (FK → users.id ON DELETE CASCADE NOT NULL)
* aircon_id (FK → customer_products.id ON DELETE CASCADE NOT NULL)
* booking_on_date (date NOT NULL)
* booking_for_date (date NOT NULL)
* booking_time (time NOT NULL)
* duration (int NOT NULL)
* fees (decimal(10,2) NOT NULL)
* status (enum: pending(default) | inprogress | done | unsuccessful NOT NULL)
* description (text)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())


📌 Table: booking_services
Service types requested in a booking.
PK:
* (booking_id, service_id) composite
Columns:
* booking_id (FK → bookings.id ON DELETE CASCADE NOT NULL)
* service_id (FK → service_types.id ON DELETE RESTRICT NOT NULL)
* created_at (timestamp NOT NULL default now())

📌 Table: booking_images
Image(s) customer provides for each specific booking (if any)
PK:
* id
Columns:
* booking_id (FK → bookings.id ON DELETE CASCADE NOT NULL)
* url (text NOT NULL)
* created_at (timestamp NOT NULL default now())
There can be multiple images for each booking. Once user take/select image(s) and put them in, the images will be uploaded to an online storage like supabase storage or S3 and the returned url is saved.

📌 Table: service_logs
Notes written by technician after working.
PK:
* id
Columns:
* booking_id (FK → bookings.id ON DELETE CASCADE UNIQUE NOT NULL)
* note (text NOT NULL)
* created_at (timestamp NOT NULL default now())

📌 Table: feedbacks
Exactly one feedback per booking.
PK:
* id
Columns:
* booking_id (FK → bookings.id ON DELETE CASCADE UNIQUE NOT NULL)
* rating (integer NOT NULL)
* satisfaction (integer)
* issue_resolved (boolean)
* note (text)
* created_at (timestamp NOT NULL default now())

📌 Table: forum_posts
PK:
* id
Columns:
* user_id (FK → users.id ON DELETE CASCADE NOT NULL)
* title (text NOT NULL)
* content (text NOT NULL)
* like_count(integer NOT NULL default 0)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp  default now())


📌 Table: forum_comments
PK:
* id
Columns:
* post_id (FK → forum_posts.id ON DELETE CASCADE NOT NULL)
* user_id (FK → users.id ON DELETE CASCADE NOT NULL)
* content (text NOT NULL)
* like_count(integer NOT NULL default 0)
* created_at (timestamp NOT NULL default now())
* updated_at (timestamp NOT NULL default now())


✅ Indexes to Create (Recommended)
User & auth
* users(email) UNIQUE
* users(role)
Technician work
* timeslots(technician_id, date) UNIQUE
* technician_services(technician_id)
* technician_services(service_id)
Bookings
* bookings(aircon_id)
* bookings(technician_id)
* bookings(status)
* bookings(booking_for_date, booking_time)
Forum
* forum_posts(user_id)
* forum_comments(post_id)
Customer products
* customer_products(customer_id)
* customer_products(product_id)
* customer_products(qr_url) UNIQUE
* customer_products(purchase_code) UNIQUE
* bookings(booking_for_date, technician_id)
* service_logs(booking_id)
* feedbacks(booking_id) UNIQUE
* addresses(district)
* timeslots(date)

