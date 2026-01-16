# Mobile Optimization Guide

This document outlines mobile optimizations and best practices for the Onchain World Cup application.

## Overview

The application is optimized for mobile devices with responsive design, touch-friendly interactions, and performance considerations.

## Key Mobile Features

### 1. Responsive Breakpoints

**Tailwind Breakpoints Used:**
- `sm`: 640px (small mobile)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop) - **Primary breakpoint for sidebar**
- `xl`: 1280px (large desktop)
- `2xl`: 1536px (extra large desktop)

**Mobile-First Approach:**
- Default styles target mobile devices
- `lg:` prefix adds desktop-specific styles
- Sidebar hidden on mobile, shown on `lg:` and above

### 2. Touch Targets

**Minimum Sizes (WCAG 2.1 AAA - 2.5.5):**
- **All buttons**: 44x44px minimum
- **Navigation items**: 48px minimum height
- **Form inputs**: 44px minimum height

**Implementation:**
```css
@media (max-width: 1024px) {
  button,
  a,
  input[type="checkbox"],
  input[type="radio"],
  select {
    min-height: 44px;
    min-width: 44px;
  }
}
```

**Exception:**
- Inline text links (paragraphs, lists) exempt from minimum size

### 3. Mobile Navigation

**Bottom Navigation Bar:**
- Fixed position at screen bottom
- 4 primary navigation items
- Clear icons with labels
- Safe area insets for notched devices
- Active state highlighting

**Implementation:**
```tsx
<nav
  className="lg:hidden fixed bottom-0 left-0 right-0 z-50 cm-sidebar border-t border-border mobile-nav-safe"
  role="navigation"
  aria-label="Main navigation"
>
  {/* nav items */}
</nav>
```

### 4. Safe Area Insets

**Notched Device Support:**
- Handles iPhone X and later notches
- Respects safe area insets
- Bottom navigation includes padding for home indicator

**CSS Implementation:**
```css
@supports (padding: env(safe-area-inset-bottom)) {
  .mobile-nav-safe {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }
}
```

### 5. Prevent Horizontal Scroll

**Overflow Prevention:**
```css
@media (max-width: 1024px) {
  body, html {
    overflow-x: hidden;
  }
}
```

**Usage:**
- Set `max-w-full` on containers
- Use `overflow-hidden` on main elements
- Avoid fixed widths in favor of percentages/flex

### 6. Touch Feedback

**Visual Feedback on Tap:**
```css
button:active,
a:active {
  transform: scale(0.98);
  opacity: 0.9;
}
```

**Tap Highlight Removal:**
```css
* {
  -webkit-tap-highlight-color: transparent;
}
```

**Custom Highlight:**
- Uses transform and opacity for smooth feedback
- Consistent across all interactive elements

### 7. Responsive Typography

**Font Size Scaling:**
```css
/* Desktop */
@media (min-width: 1024px) {
  html {
    font-size: clamp(14px, 1vw, 16px);
  }
}

/* Mobile */
@media (max-width: 1023px) {
  html {
    font-size: clamp(15px, 4vw, 17px);
  }
}
```

**Benefits:**
- Respects user's font size preferences
- Scales smoothly across viewport sizes
- Maintains readability on all devices

### 8. Mobile-Specific Components

**Tables:**
- Horizontal scroll on overflow
- `scrollbar-hide` class for cleaner UI
- Essential columns shown on mobile
- Optional columns hidden with `hidden lg:table-cell`

**Cards:**
- Stack vertically on mobile
- Grid layout on desktop
- Touch-friendly spacing

**Modals:**
- Full-screen on mobile
- Centered on desktop
- Proper z-index management
- Escape key and backdrop click to close

## Implementation Patterns

### Responsive Container

```tsx
<div className="container mx-auto px-4 lg:px-8">
  {/* content scales with viewport */}
</div>
```

### Mobile/Desktop Conditional Rendering

```tsx
{/* Mobile only */}
<div className="lg:hidden">
  <MobileNav />
</div>

{/* Desktop only */}
<div className="hidden lg:flex">
  <Sidebar />
</div>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

### Touch-Friendly Buttons

```tsx
<button className="
  cm-nav-tab
  px-4 py-3                    // Desktop padding
  lg:px-6 lg:py-4              // Larger desktop padding
  min-h-[44px]                 // Mobile touch target
  text-sm lg:text-base         // Responsive text
">
  Button Text
</button>
```

### Responsive Images

```tsx
<img
  src="/image.jpg"
  alt="Description"
  className="
    w-full                      // Full width on mobile
    lg:w-1/2                    // Half width on desktop
    object-cover                // Maintain aspect ratio
  "
/>
```

## Performance Optimizations

### 1. Image Optimization

**Next.js Image Component:**
```tsx
import Image from "next/image"

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority                      // For above-the-fold images
  loading="lazy"                // For below-the-fold
/>
```

**Benefits:**
- Automatic format optimization (WebP, AVIF)
- Responsive sizes
- Lazy loading
- Blur placeholder

### 2. Code Splitting

**Dynamic Imports:**
```tsx
import dynamic from "next/dynamic"

const HeavyComponent = dynamic(() => import("@/components/heavy-component"), {
  loading: () => <InlineLoader text="Loading..." />,
  ssr: false                    // Client-side only if needed
})
```

### 3. Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
```

**Settings:**
- `width=device-width`: Responsive width
- `initial-scale=1`: No initial zoom
- `maximum-scale=5`: Allow zoom up to 5x
- `user-scalable=yes`: Enable pinch zoom (accessibility requirement)

### 4. Minimize Rerenders

**Use React.memo for expensive components:**
```tsx
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
})
```

**Use useMemo for expensive calculations:**
```tsx
const filteredData = useMemo(() => {
  return data.filter(item => item.visible)
}, [data])
```

## Testing Guidelines

### Device Testing

**iOS:**
- iPhone SE (small screen)
- iPhone 12/13 (standard size)
- iPhone 14 Pro Max (large screen)
- iPad (tablet)

**Android:**
- Pixel 5 (standard Android)
- Samsung Galaxy (large screen)
- Tablet (7-10 inch)

### Browser Testing

**Mobile Browsers:**
- Safari (iOS)
- Chrome (iOS)
- Chrome (Android)
- Firefox (Android)
- Samsung Internet

### Testing Checklist

#### Layout
- [ ] No horizontal scrolling
- [ ] Content fits viewport without zooming
- [ ] Navigation is accessible
- [ ] Modals work correctly
- [ ] Tables scroll properly

#### Touch Interactions
- [ ] All buttons are 44x44px minimum
- [ ] Adequate spacing between touch targets
- [ ] Tap feedback is visible
- [ ] Swipe gestures work (if implemented)
- [ ] Long press doesn't interfere (if used)

#### Typography
- [ ] Text is readable without zooming
- [ ] Font sizes scale properly
- [ ] Line heights prevent text crowding
- [ ] Text doesn't overflow containers

#### Performance
- [ ] Page loads in <3 seconds on 3G
- [ ] Images load progressively
- [ ] No layout shifts (CLS)
- [ ] Smooth scrolling (60fps)
- [ ] Animations are smooth

#### Forms
- [ ] Inputs have proper keyboard types
- [ ] Labels are visible
- [ ] Error messages are clear
- [ ] Submit buttons are accessible
- [ ] Auto-focus works correctly

#### Safe Areas
- [ ] Content visible on notched devices
- [ ] Bottom nav above home indicator
- [ ] No content in status bar area
- [ ] Landscape orientation handled

## Common Issues and Fixes

### Issue: Horizontal scroll on mobile
**Fix:**
```tsx
<div className="max-w-full overflow-hidden">
  {/* content */}
</div>
```

### Issue: Touch targets too small
**Fix:**
```tsx
<button className="min-h-[44px] min-w-[44px]">
  Button
</button>
```

### Issue: Text too small on mobile
**Fix:**
```tsx
<p className="text-sm lg:text-base">
  Responsive text
</p>
```

### Issue: Modal not full-screen on mobile
**Fix:**
```tsx
<div className="
  fixed inset-0                 // Mobile: full screen
  lg:relative lg:inset-auto    // Desktop: positioned
  lg:max-w-2xl                  // Desktop: max width
">
  {/* modal content */}
</div>
```

### Issue: Safe area not respected
**Fix:**
```tsx
<nav className="
  fixed bottom-0 left-0 right-0
  pb-safe                       // Add safe area padding
  mobile-nav-safe               // Or use custom class
">
  {/* navigation */}
</nav>
```

## Tools and Resources

### Testing Tools
- **Chrome DevTools**: Device emulation
- **Responsively App**: Multi-device preview
- **BrowserStack**: Real device testing
- **WebPageTest**: Mobile performance testing

### Performance Tools
- **Lighthouse**: Mobile performance audit
- **GTmetrix**: Performance analysis
- **PageSpeed Insights**: Mobile optimization score

### Design Tools
- **Figma**: Responsive design
- **Mobile viewport sizes**: deviceframes.com

## Best Practices

1. **Mobile-First**: Design for mobile first, then enhance for desktop
2. **Touch-Friendly**: 44px minimum touch targets
3. **Performance**: Optimize images, lazy load, code split
4. **Accessibility**: Screen reader support, keyboard navigation
5. **Testing**: Test on real devices, not just emulators
6. **Safe Areas**: Handle notched devices properly
7. **Typography**: Scale fonts responsively
8. **Navigation**: Bottom nav for mobile, sidebar for desktop

## Resources

- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-typography)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
