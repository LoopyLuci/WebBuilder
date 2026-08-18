# Example: Landing Page

A simple landing page built with WebBuilder.

## Structure

```
landing-page/
├── webbuilder.config.json
├── spec.json
├── components/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   └── Footer.tsx
├── pages/
│   └── index.tsx
├── public/
│   └── images/
└── package.json
```

## Config

```json
{
  "name": "landing-page",
  "version": "1.0.0",
  "framework": "react",
  "styling": "tailwind",
  "deployment": "vercel"
}
```

## Generate

```bash
webbuilder create landing-page --template landing
```

## Develop

```bash
cd landing-page
webbuilder dev
```
