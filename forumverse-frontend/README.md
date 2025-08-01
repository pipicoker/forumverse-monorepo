
# ForumVerse - Modern Community Platform

A responsive, modern forum/community platform built with React, TypeScript, and Tailwind CSS. ForumVerse provides a clean, intuitive interface for community discussions with features like nested comments, user profiles, post creation, and moderation tools.

## 🌟 Features

### Core Features
- **Landing Page**: Beautiful hero section with features, testimonials, and CTAs
- **Community Feed**: Browse posts with search, filtering, and sorting
- **Post Details**: Full post view with nested comments and voting
- **User Profiles**: Detailed profiles with activity tabs and achievements
- **Post Creation**: Rich text editor with tag system and preview
- **Authentication**: Login/register with role-based access (User, Moderator, Admin)
- **Reporting System**: Modal-based reporting for posts and comments

### UI/UX Features
- **Responsive Design**: Mobile-first approach with smooth animations
- **Dark Theme**: Modern dark theme with purple accents
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Elements**: Voting, bookmarking, and real-time feedback
- **Role-Based UI**: Different interfaces based on user roles

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Demo Accounts
Use these accounts to test different user roles:

- **Admin**: `tech@example.com` / `demo123`
- **Moderator**: `design@example.com` / `demo123`
- **User**: `code@example.com` / `demo123`

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion (ready for implementation)
- **Routing**: React Router v6
- **State Management**: React Context + useState
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 📱 Pages & Components

### Pages
- **Landing** (`/`): Public homepage with hero and features
- **Feed** (`/feed`): Main community feed with posts
- **Login/Register** (`/login`, `/register`): Authentication pages
- **Create Post** (`/create`): Post creation form
- **Post Detail** (`/post/:id`): Individual post with comments
- **Profile** (`/profile/:id`): User profile with activity tabs

### Key Components
- **Navbar**: Responsive navigation with user menu
- **PostCard**: Reusable post preview component
- **ReportModal**: Content reporting system
- **AuthProvider**: Authentication context


