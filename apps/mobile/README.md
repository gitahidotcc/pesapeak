# PesaPeak Mobile

React Native mobile application built with Expo.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm
- Expo Go app (for testing on physical devices)
- iOS Simulator (Mac only) or Android Emulator

### Installation

From the monorepo root:

```bash
# Install all dependencies
pnpm install

# Start the development server
pnpm run mobile
# or
pnpm --filter @pesapeak/mobile run dev
```

### Development

```bash
# Start the development server
pnpm run start

# Run on iOS
pnpm run ios

# Run on Android
pnpm run android

# Run on web
pnpm run web
```

### Code Quality

```bash
# Lint the code
pnpm run lint

# Format the code
pnpm run format:fix

# Type check
pnpm run typecheck
```

## Tech Stack

- **Framework**: Expo ~54
- **React**: 19.1.0
- **React Native**: 0.81.5
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **TypeScript**: ~5.9.2
- **Linting**: Oxlint
- **Formatting**: Prettier

## Features

- 🎨 NativeWind for Tailwind CSS styling
- 📱 Expo Router for navigation (ready to be configured)
- 🔧 Shared TypeScript, linting, and formatting configs
- 🚀 Integrated with Turborepo monorepo

## Project Structure

```
mobile/
├── assets/          # Images, fonts, and other assets
├── App.tsx          # Main application component
├── index.ts         # Entry point
├── global.css       # Global styles (Tailwind)
├── tailwind.config.js   # Tailwind configuration
├── metro.config.js      # Metro bundler configuration
├── app.json             # Expo configuration
└── package.json         # Dependencies and scripts
```

## Building

For production builds, use Expo Application Services (EAS):

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)

