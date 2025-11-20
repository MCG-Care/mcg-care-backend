I am doing a software project using nestjs backend, supabase+drizzle, nextjs frontend, shadcnui and more to be decided. There will be an iOS app, an admin dashboard website and a backend hosting website. I want to host both backend and frontend on vercel separately but they are currently both in the same repo as you can see. (May be later we’ll host backend on other platform like railway, still not sure)

here is what I am trying to achieve in summary.
A business app for an aircon sales and services company.
Customers and technicians will have an iOS app while admin has dashboard website. Customers and technicians will use the same app but log in into different interface based on roles, and will have different access and functionalities.

Customers will be able to open account, log in and register their purchased aircons (where an qr will be generated and saved in the database to be displayed at anytime a technician needs it), book for services for the chosen date and time (if available), post in the forum and comment and also browse products for purchase.
P.s. Forum is like a place for customers asking what they want to know and other customers or technicians who know the solution will help in the comments. 
Customers will need to register each aircon if they want to book service for that aircon. 

this is what customer can do:
1: register the aircon (here, users will have to manually type in a unique code from the purchased receipt(provided by company which is outside of our scope) to claim warranty, the warranty ending data is calculated using purchased data + product.warranty(year). If no unique code is provided, purchased date will be considered null so no warranty is issued)
2: registration goes like this -> choose the product they bought from the product table via a drop down or search -> give a nickname to the aircon(like bedroom aircon) -> type in unique purchase_code(if any) to claim warranty
3: book services for their registered aircons: first select the aircon that needs servicing -> select service types that are needed -> select date -> select time -> take/select photos to tell the situation(if any) -> write some description if needed
4: give a feedback after the service is done if they want to
5: post/ comment in the community forum


—xx—

—the following paragraph is just my opinion, you can change/imporve it —
Once a customer wants to make a booking, a technician from the same district who can fulfill all the requested services will automatically assigned at random. we'll have to make sure technician can do all the service types in the specific booking to get booked.to assign automatically, we can query the user table to get tech user ids with user.role == technician and shuffle the resulting array and find the first one matching.
to find the match, we can first get the list of requested service type using Get service_id Where booking_service.booking_id == the booking id we are assigning. then get the acquired services of the current technician using Get service_id Where technician_service.technician_id == current tech we are checking  now, loop the requested list and find whether each requested service is in current technician's acquired knowledge. if everything  including the district matched after finishing the loop, assign him. if not, move onto next technician.
Here is the refined version:
1. Get all technicians who are available for the selected date & time
2. Shuffle the array (or use random offset)
3. For each technician:
    * Get their service skills
    * Compare against requested booking services
    * Check district compatibility 
4. First fully matching technician gets assigned
5. If no technician available for a specific time slot -> cross out the time slot

—xx—


Technicians will be assigned automatically based on their availability, they can scan the qr from the customer’s (account)phone when they go servicing to get the service history/log of the aircon and to add new note to the record, change the status of the booking as it moves from ‘pending’ to ‘done’, they can also answer questions from the forum.

Admin oversees all data and manage them, they can add new merchandises for sales, they can moderate the forum, create accounts for technicians, manage the availability slots and basically do all the crud operations on every data.
P.s: there will always be a month’s(30days) worth of availability spots in the system, the slots are deleted if they are less than today and a new day is added to the system each day. So, the customers will always be able to book at most 30 days in advance.

