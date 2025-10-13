# Aceternity UI Components Guide

This guide explains the Aceternity UI components integrated into the ForumVerse landing page.

## 🎨 Components Added

### 1. **Spotlight Effect** (`spotlight.tsx`)
- **Location**: Hero section
- **Purpose**: Creates a dramatic spotlight effect that animates into view
- **Customization**:
  ```tsx
  <Spotlight
    className="-top-40 left-0 md:left-60 md:-top-20"
    fill="hsl(var(--primary))" // Change color here
  />
  ```

### 2. **Text Generate Effect** (`text-generate-effect.tsx`)
- **Location**: Hero heading
- **Purpose**: Animates text by revealing words one by one with a blur effect
- **Customization**:
  ```tsx
  <TextGenerateEffect
    words="Your Heading Text Here"
    className="text-5xl font-bold"
    duration={0.5} // Animation speed
    filter={true} // Enable/disable blur effect
  />
  ```

### 3. **Background Beams** (`background-beams.tsx`)
- **Location**: Hero section background
- **Purpose**: Animated SVG beams that create a futuristic effect
- **Customization**:
  ```tsx
  <BackgroundBeams className="opacity-40" />
  ```
  - Adjust opacity in className
  - Colors are defined in the gradient stops within the component

### 4. **Infinite Moving Cards** (`infinite-moving-cards.tsx`)
- **Location**: Testimonials section
- **Purpose**: Auto-scrolling testimonial cards
- **Customization**:
  ```tsx
  <InfiniteMovingCards
    items={testimonials}
    direction="right" // or "left"
    speed="slow" // "fast", "normal", or "slow"
    pauseOnHover={true}
  />
  ```

### 5. **Background Grid** (`background-grid.tsx`)
- **Location**: Features section
- **Purpose**: Subtle grid pattern background
- **Customization**:
  - Grid color is automatically based on your border color
  - Modify the gradient mask in the component for different fade effects

## 🎯 Where Each Component is Used

### Hero Section
- ✅ Spotlight Effect
- ✅ Background Beams
- ✅ Text Generate Effect
- ✅ Background Image with overlays

### Features Section
- ✅ Background Grid
- ✅ Animated feature cards

### Testimonials Section
- ✅ Infinite Moving Cards

## 🔧 Customization Tips

### Change Animation Speed
Edit the keyframes in `index.css`:
```css
.animate-scroll {
  animation: scroll var(--animation-duration, 40s) ...;
}
```

### Modify Spotlight Colors
The spotlight uses your primary color by default. Change it by:
```tsx
fill="hsl(217 91% 60%)" // Any HSL color
```

### Add More Testimonials
Simply add more items to the testimonials array:
```tsx
const testimonials = [
  {
    quote: "Your testimonial text",
    name: "Person Name",
    title: "Job Title"
  },
  // Add more...
];
```

### Change Background Image
In the hero section:
```tsx
style={{
  backgroundImage: `url('YOUR_IMAGE_URL_HERE')`,
}}
```

## 📚 More Aceternity UI Components

Visit [Aceternity UI](https://ui.aceternity.com/) for more components:
- Card Stack
- Hover Effect Cards
- Parallax Scroll
- Animated Tabs
- Lens Effect
- And 70+ more!

## 🚀 Performance Tips

1. **Lazy Load Components**: Import components only when needed
2. **Optimize Images**: Use optimized images for the hero background
3. **Reduce Motion**: Respect user's `prefers-reduced-motion` setting
4. **Bundle Size**: Aceternity UI components are lightweight since they use Framer Motion which is already in your dependencies

## 🎨 Color Scheme

Current theme uses a neutral blue:
- Primary: `hsl(217 91% 60%)`
- This automatically applies to all Aceternity UI components

To change the theme, update `index.css`:
```css
--primary: 217 91% 60%; /* Your new color */
```

## 📖 References

- [Aceternity UI Official Site](https://ui.aceternity.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

