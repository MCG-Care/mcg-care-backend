# MCG Care Admin Dashboard

A modern, responsive admin dashboard for MCG Care built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🌓 **Dark/Light Mode** - Toggle between dark and light themes
- 🌍 **Multi-language** - Support for English and Burmese (Myanmar)
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 🔐 **Authentication** - Secure admin login
- 📊 **Dashboard** - Real-time stats and latest bookings/forum posts
- 🎨 **Red/Orange Theme** - Custom color scheme matching brand identity

## Pages

- **Login** (`/login`) - Admin authentication
- **Dashboard** (`/dashboard`) - Main overview with stats and recent activity
- **Bookings** (`/dashboard/bookings`) - Manage bookings (placeholder)
- **Forum** (`/dashboard/forum`) - Manage forum posts (placeholder)
- **Products** (`/dashboard/products`) - Manage products (placeholder)
- **Technicians** (`/dashboard/technicians`) - Manage technicians (placeholder)
- **Customers** (`/dashboard/customers`) - Manage customers (placeholder)
- **Profile** (`/dashboard/profile`) - Admin profile and logout

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Logo

Place your company logo file as `logo.png` in the following directory:

```
apps/web/public/logo.png
```

The logo should be:
- PNG format with transparent background (recommended)
- Approximately 200x200px or similar square dimensions
- Will be used in the login page and sidebar

### 3. Configure API Endpoint (Optional)

The app is currently configured to use:
```
https://mcg-care-backend.onrender.com
```

To change this, edit `apps/web/lib/api.ts`:

```typescript
const API_BASE_URL = "your-api-url-here";
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 5. Create Admin Accounts

Admin accounts need to be added directly to the database. The login page expects the following API endpoint:

```
POST /auth/login
Body: { email: string, password: string }
Response: { token: string, user: { id, email, name, role } }
```

## Project Structure

```
apps/web/
├── app/                      # Next.js app directory
│   ├── dashboard/           # Dashboard pages
│   │   ├── bookings/       # Bookings management
│   │   ├── customers/      # Customers management
│   │   ├── forum/          # Forum management
│   │   ├── products/       # Products management
│   │   ├── profile/        # Admin profile
│   │   ├── technicians/    # Technicians management
│   │   ├── layout.tsx      # Dashboard layout with sidebar & navbar
│   │   └── page.tsx        # Main dashboard page
│   ├── login/              # Login page
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── Navbar.tsx         # Top navigation bar
│   ├── Sidebar.tsx        # Side navigation menu
│   └── theme-provider.tsx # Theme provider
├── contexts/              # React contexts
│   └── LanguageContext.tsx # Multi-language support
├── lib/                   # Utility libraries
│   ├── api.ts            # API client (axios)
│   └── utils.ts          # Helper functions
├── types/                # TypeScript types
│   └── index.ts          # Type definitions
└── public/               # Static assets
    └── logo.png          # ← Place your logo here
```

## Theme Customization

The app uses a red/orange color scheme. To customize colors, edit `apps/web/app/globals.css`:

```css
:root {
  --primary: 0 72.2% 50.6%; /* Red-orange primary color */
  /* ... other variables */
}
```

## Languages

The app supports English and Burmese. To add more translations, edit `apps/web/contexts/LanguageContext.tsx`:

```typescript
const translations = {
  en: { ... },
  my: { ... },
  // Add more languages here
};
```

## Dashboard Stats

The dashboard displays real-time statistics:
- **Pending Bookings** - Bookings with status "pending"
- **In Progress** - Bookings with status "in_progress"
- **Today's Bookings** - Bookings scheduled for today
- **Upcoming Bookings** - Future bookings (not cancelled)

## API Integration

The dashboard fetches data from:
- `GET /bookings` - List of all bookings
- `GET /forum-posts` - List of forum posts (optional)

Each booking should have this structure:
```typescript
{
  id: string;
  customerId: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  scheduledDate: string;
  createdAt: string;
  customer?: { name, email, phone };
  technician?: { name, email };
  serviceType?: { name };
}
```

## Building for Production

```bash
npm run build
npm run start
```

## Support

For issues or questions, please contact the development team.

---

Built with ❤️ for MCG Care
