# Olana - Orienteering Results Analysis

An application to analyze and compare orienteering competition results.

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **React.js** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

## Domain Model

### Competition
- name: string
- date: Date
- map: string
- categories: Category[]

### Category
- name: string
- numberOfControls: number
- distance: number
- elevation: number
- runners: Runner[]

### Runner
- fullName: string
- birthYear: number
- sex: 'M' | 'F'
- club: string
- city: string
- splits: Split[]

### Split
- code: string
- time: number (from start of the runner)

## Project Structure

```
src/
├── components/     # Reusable React components
├── pages/          # Page components
├── services/       # API service layer (Axios)
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── index.css       # Global styles (Tailwind imports)
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:3000/api
```
