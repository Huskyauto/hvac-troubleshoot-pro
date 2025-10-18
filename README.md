# HVAC Troubleshoot Pro

AI-powered HVAC diagnostic assistant with equipment troubleshooting, error code interpretation, step-by-step repair guides, and integrated parts locator for HVAC professionals and homeowners.

![HVAC Troubleshoot Pro](https://img.shields.io/badge/Status-Production-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

### AI-Powered Diagnostics
- **Model-Specific Solutions** - Equipment-specific diagnostic guidance for furnaces, A/C units, heat pumps, mini-splits, and more
- **Error Code Interpretation** - Comprehensive error code database with likely causes and severity ratings
- **Step-by-Step Troubleshooting** - Detailed repair procedures with safety warnings and required tools
- **Ranked Root Causes** - AI analyzes symptoms and provides probability-weighted diagnosis

### Parts Locator
- **Real-Time Inventory** - Live stock data from participating supply houses
- **Location-Based Search** - Find parts at nearby distributors with distance and pricing
- **Price Comparison** - Compare costs across multiple suppliers
- **OEM & Aftermarket** - Compatible parts with cross-references

### Professional Reports
- **PDF Export** - Generate detailed diagnostic reports
- **Session History** - Track all troubleshooting sessions
- **Parts Lists** - Automatic parts identification for repairs

## 🏗️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **tRPC** - End-to-end type safety

### Backend
- **Node.js + Express** - Server runtime
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Relational database

### AI & Services
- **OpenAI GPT-4** - Diagnostic analysis engine
- **Structured JSON Output** - Reliable AI responses
- **Manus OAuth** - Secure authentication
- **S3 Storage** - File and asset management

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL or TiDB database

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hvac-troubleshoot-pro.git
cd hvac-troubleshoot-pro
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
BUILT_IN_FORGE_API_URL=https://forge-api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

4. **Run database migrations**
```bash
pnpm db:push
```

5. **Seed sample data (optional)**
```bash
pnpm exec tsx scripts/seed-data.ts
```

6. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🗄️ Database Schema

The application uses 18 tables covering:
- **Equipment Models** - Device specifications and manuals
- **Error Codes** - Model-specific error code database
- **Diagnostics** - Session tracking and AI results
- **Parts** - OEM and aftermarket parts catalog
- **Suppliers** - Supply house locations and inventory
- **Users** - Authentication and role management

## 🎯 Usage

### For Homeowners
1. Click "Start Diagnosis"
2. Describe your HVAC issue
3. Optionally enter error codes
4. Review AI-generated causes and solutions
5. Follow step-by-step troubleshooting
6. Find required parts at nearby suppliers

### For HVAC Professionals
- Access detailed technical procedures
- Generate professional repair reports
- Track job history and parts usage
- Contractor pricing at supply houses

## 🔐 Security

- OAuth 2.1 authentication
- JWT session management
- Role-based access control (User, Pro, Admin)
- Secure API endpoints with tRPC
- Environment-based secrets management

## 📱 Supported Equipment Types

- Furnaces
- Boilers
- Air Conditioners
- Heat Pumps
- Geothermal Heat Pumps
- Mini-Split Systems (Ductless)
- Tankless Water Heaters
- Humidifiers & Dehumidifiers

## 🛠️ Development

### Project Structure
```
hvac-troubleshoot-pro/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable UI components
│   │   └── lib/        # tRPC client
├── server/             # Express backend
│   ├── routers.ts      # tRPC procedures
│   ├── db.ts           # Database queries
│   └── services/       # Business logic
├── drizzle/            # Database schema
└── scripts/            # Utility scripts
```

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm db:push` - Push schema changes to database
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript compiler

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with reference to HVAC industry best practices
- AI diagnostic engine powered by OpenAI
- Parts data integration with major distributors (Ferguson, Johnstone Supply, United Refrigeration)
- UI components from shadcn/ui

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**For HVAC professionals and homeowners** - Making HVAC troubleshooting faster, safer, and more accessible.

