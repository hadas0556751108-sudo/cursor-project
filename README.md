# HubOffice - Medical Center ERP System

A premium, futuristic internal ERP/Operations management system for multi-disciplinary medical centers. Built with Next.js 14, React, TypeScript, and modern UI technologies.

## 🚀 Features

- **Dashboard**: Role-based views with KPI cards, notifications, and quick actions
- **My Calendar**: Personal shift scheduling with FullCalendar integration
- **Shift Manager**: Department-level shift management for managers
- **Request Center**: Unified request system for vacations, sick leave, and expenses
- **Finance Hub**: Financial oversight with Recharts visualizations
- **Notification Center**: Real-time alerts and notifications management
- **Admin Settings**: System configuration and organizational management
- **Role-Based Access**: Employee, Manager, Finance, and Admin roles with appropriate permissions

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Calendar**: FullCalendar
- **Icons**: Lucide React
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## 🎯 Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 User Roles & Demo

The application includes a mock authentication system with role switching for demo purposes. Access different roles by clicking on your avatar in the top-right corner:

- **Employee**: Can view personal calendar, submit requests
- **Manager**: Can manage department shifts, approve department requests
- **Finance**: Can approve expense requests, view financial reports
- **Admin**: Full access to all features including system settings

### Demo Users

1. **Dr. Sarah Cohen** (Employee)
   - Email: sarah.cohen@huboffice.com
   - Department: Cardiology

2. **Dr. Michael Levi** (Manager)
   - Email: michael.levi@huboffice.com
   - Department: Cardiology

3. **Nurse Rachel Green** (Employee)
   - Email: rachel.green@huboffice.com
   - Department: Emergency

4. **David Katz** (Finance)
   - Email: david.katz@huboffice.com
   - Department: Finance

5. **Admin User** (Admin)
   - Email: admin@huboffice.com
   - Department: Administration

## 📁 Project Structure

```
HubOffice/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── calendar/          # My Calendar module
│   │   ├── dashboard/         # Dashboard (home)
│   │   ├── finance/           # Finance Hub
│   │   ├── notifications/     # Notification Center
│   │   ├── requests/          # Request Center
│   │   ├── settings/          # Admin Settings
│   │   ├── shifts/            # Shift Manager
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── layout/            # Layout components (Sidebar, Topbar)
│   │   └── ui/                # shadcn/ui components
│   ├── contexts/
│   │   └── auth-context.tsx   # Authentication context
│   └── lib/
│       ├── mock-data.ts       # Mock data for all tables
│       └── utils.ts           # Utility functions
├── public/                    # Static assets
├── .cursorrules               # Project guidelines
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── next.config.js             # Next.js configuration
```

## 🎨 Design System

The application follows a premium, futuristic medical-enterprise design language:

- **Color Palette**: Professional medical aesthetic with crisp whites, subtle grays, deep dark sidebar, and soft accent colors
- **Glassmorphism**: Soft shadows and transparency effects on cards and modals
- **Animations**: Subtle, fast, and smooth transitions using Framer Motion
- **Consistency**: Uniform padding, border-radius, and font-weight across all components
- **Typography**: Clean, readable fonts with proper hierarchy

## 🔐 Authentication

This is a demo application using mock authentication. No real backend or database connection is required. The authentication system simulates:
- User login/logout
- Role-based access control
- Session management
- User switching for demo purposes

## 📊 Mock Data

All data is mocked and stored in `src/lib/mock-data.ts`:
- Users (5 demo users across different roles)
- Departments (5 medical departments)
- Branches (2 hospital locations)
- Shifts (12 scheduled shifts)
- Requests (8 various requests)
- Notifications (12 notifications)
- Settings (system configuration)

## 🚀 Deployment

The application is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy automatically

## 📝 Environment Variables

Create a `.env.local` file (see `.env.example` for reference):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Note: This demo uses mock data and doesn't require actual Supabase credentials.

## 🤝 Contributing

This is a demo project for educational purposes. Feel free to explore and modify the code to learn about:
- Next.js App Router architecture
- shadcn/ui component library
- Framer Motion animations
- Role-based access control
- Modern React patterns

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Calendar by [FullCalendar](https://fullcalendar.io/)
- Charts by [Recharts](https://recharts.org/)
