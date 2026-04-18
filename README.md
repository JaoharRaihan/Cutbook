# CutBook - Professional Salon Management System

A modern, cross-platform salon management application built with React Native, Firebase, and TypeScript.

## 🎯 Features

- **👨‍💼 Owner Dashboard**: Manage employees, services, bookings, and revenue analytics
- **⏱️ Employee Tracking**: Work entries, commission tracking, and performance analytics
- **📱 Cross-Platform**: iOS, Android, and Web support
- **🔐 Secure Authentication**: Firebase authentication with OTP support
- **💾 Offline Support**: Complete offline functionality with automatic sync
- **📊 Real-time Analytics**: Performance statistics and revenue reports
- **🌐 Multi-language**: Support for Bengali and English

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn
- iOS: Xcode 14+ (for iOS development)
- Android: Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# or with yarn
yarn install
```

### Running the App

#### iOS
```bash
npm run ios
# or
yarn ios
```

#### Android
```bash
npm run android
# or
yarn android
```

#### Web
```bash
npm run web
# or
yarn web
```

#### Development Server
```bash
npm start
# or
yarn start
```

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── UI/           # Base UI components (Button, Input, Card, etc.)
│   └── shared/       # Business logic components
├── screens/          # App screens/pages
│   ├── auth/         # Authentication screens
│   ├── owner/        # Owner-specific screens
│   ├── employee/     # Employee-specific screens
│   └── onboarding/   # Onboarding screens
├── navigation/       # Navigation configuration
├── context/          # React Context for state management
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── constants/        # App constants and theme
└── assets/           # Static assets
```

## 🔧 Available Scripts

- `npm start` - Start Metro dev server
- `npm run android` - Build & run Android app
- `npm run ios` - Build & run iOS app
- `npm run web` - Run web version
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types
- `npm run clean` - Clean native build files
- `npm run clean:cache` - Clean cache and reinstall

## 🔐 Firebase Setup

The app uses Firebase for:
- Authentication
- Firestore Database
- Real-time Data Sync
- Offline Persistence

Firebase configuration is pre-configured in `firebase.json` and `firestore.rules`.

## 📱 User Roles

### Owner
- Create and manage salon organization
- Add/remove employees
- Manage services and pricing
- View revenue analytics
- Track work entries
- Generate reports

### Employee
- View assigned work
- Log work entries
- Track commission
- View performance metrics
- Manage profile

## 🎨 Styling & Theme

The app uses a custom theme system with:
- Consistent color palette
- Typography guidelines
- Spacing standards
- Component library

See `src/constants/theme.ts` for theme configuration.

## 🧪 Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 🛠️ Development

### Code Style
- ESLint for code quality
- Prettier for code formatting
- TypeScript for type safety

### Best Practices
- Component-based architecture
- Context API for state management
- Custom hooks for reusable logic
- Proper error handling and loading states
- Accessibility considerations

## 📦 Dependencies

### Core
- React Native 0.83.0
- React 19.2.0
- TypeScript 5.8.3

### Navigation & UI
- React Navigation 7.x
- React Native Safe Area Context
- React Native Gesture Handler

### State & Data
- Firebase Admin SDK 23.8.3
- Async Storage 2.2.0
- date-fns 4.1.0

### Development
- Babel 7.25.x
- Webpack 5.104.x
- Jest 29.6.3

## 📄 License

Proprietary - CutBook Project

## 👥 Support

For issues or questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: April 18, 2026
