# MCG Care Admin Dashboard

A modern, responsive admin dashboard built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🌓 **Dark/Light Mode**: Seamless theme switching with system preference detection
- 🌍 **Multi-language Support**: English and Burmese (မြန်မာ) translations
- 🎨 **Modern UI**: Beautiful gradient designs with red-orange theme
- 📱 **Responsive Design**: Works perfectly on all devices
- 🔐 **Authentication**: Secure login system
- 📊 **Dashboard**: Real-time statistics and data visualization
- 🎯 **Navigation**: Intuitive sidebar and navbar

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React
- **Theme**: next-themes
- **Internationalization**: i18next, react-i18next

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Add your logo:
   - Place your `logo.png` file in `/public/images/logo.png`
   - Recommended size: 200x200px (will be displayed at 60x60px)
   - Format: PNG with transparent background

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
apps/web/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── bookings/       # Bookings management
│   │   ├── customers/      # Customer management
│   │   ├── forum/          # Forum management
│   │   ├── products/       # Product management
│   │   ├── profile/        # User profile
│   │   ├── settings/       # Settings page
│   │   ├── technicians/    # Technician management
│   │   ├── layout.tsx      # Dashboard layout
│   │   └── page.tsx        # Dashboard home
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects to login)
│   └── globals.css         # Global styles
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── navbar.tsx      # Top navigation bar
│   │   ├── sidebar.tsx     # Side navigation
│   │   └── stats-card.tsx  # Statistics card component
│   ├── providers/          # Context providers
│   │   ├── i18n-provider.tsx
│   │   └── theme-provider.tsx
│   └── ui/                 # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/
│   ├── i18n.ts            # Internationalization config
│   └── utils.ts           # Utility functions
└── public/
    └── images/            # Static images (place logo here)
```

## Features Overview

### Authentication
- Login page with email/password
- Remember me functionality
- Password visibility toggle
- Mock authentication (stores token in localStorage)

### Dashboard
- **Statistics Cards**: Display pending, in-progress, today, and upcoming bookings
- **Latest Bookings**: View recent booking entries with status indicators
- **Latest Forum Posts**: Monitor recent forum activity
- **Quick Actions**: View details with one click

### Navigation
- **Sidebar**: Collapsible navigation with icons
  - Dashboard
  - Bookings
  - Forum
  - Products
  - Technicians
  - Customers
- **Navbar**: Top bar with:
  - Search functionality
  - Theme toggle (light/dark)
  - Language selector (English/Burmese)
  - Notifications
  - Profile menu with logout

### Theme System
- Light mode with clean white backgrounds
- Dark mode with elegant dark grays
- System preference detection
- Smooth transitions between themes
- Custom scrollbar styling

### Internationalization
- English (en)
- Burmese (my - မြန်မာ)
- Easy to add more languages
- Persists language preference

## Customization

### Colors
The main theme uses red-orange gradients. To customize:
- Primary gradient: `from-red-500 to-orange-500`
- Hover states: `from-red-600 to-orange-600`
- Accent colors defined in Tailwind classes

### Adding New Pages
1. Create a new folder in `app/dashboard/[page-name]/`
2. Add a `page.tsx` file
3. Add the route to sidebar in `components/dashboard/sidebar.tsx`
4. Add translations in `lib/i18n.ts`

### Adding Translations
Edit `lib/i18n.ts` and add keys to both `en` and `my` translation objects.

## Mock Data
Currently, the application uses mock data for:
- Bookings list
- Forum posts
- User authentication

Replace these with actual API calls when backend is ready.

## Logo Setup

**IMPORTANT**: Place your company logo at:
```
/public/images/logo.png
```

- Recommended size: 200x200px
- Format: PNG with transparent background
- The logo will be displayed at 60x60px in the login page
- A fallback "MC" text will display if the logo is not found

## Development

### Running the App
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License
Private - MCG Care

## Support
For issues or questions, contact the development team.
