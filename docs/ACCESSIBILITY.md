# Accessibility Guide

This document outlines the accessibility features and guidelines for the Onchain World Cup application.

## WCAG 2.1 Compliance

This application aims to meet WCAG 2.1 Level AA standards.

## Key Accessibility Features

### 1. Keyboard Navigation

**Skip to Content Link**
- A "Skip to Content" link appears at the top of every page when keyboard navigating
- Allows users to bypass navigation and jump directly to main content
- Meets WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks)

**Focus Indicators**
- All interactive elements have visible focus indicators
- Yellow highlight (`--highlight-yellow`) with 3px outline and 2px offset
- Additional box-shadow for enhanced visibility
- Meets WCAG 2.1 Level AA requirement (2.4.7 Focus Visible)

**Tab Order**
- Logical tab order following visual layout
- Skip link → Logo → Navigation → Main content → Footer

### 2. ARIA Labels and Semantic HTML

**Navigation**
- `role="navigation"` on sidebar and mobile nav
- `aria-label` for navigation regions
- `aria-current="page"` for active navigation items
- `aria-hidden="true"` on decorative icons

**Buttons and Links**
- Descriptive `aria-label` attributes
- Clear button text
- Icon-only buttons have labels

**Dynamic Content**
- `aria-live="polite"` for loading states
- `role="status"` for status updates

### 3. Color Contrast

**Text Contrast Ratios**
- Primary text on dark background: 14:1 (AAA level)
- Muted text: Improved to `oklch(0.75 0 0)` for better readability
- Yellow highlights on dark background: 10:1 (AA level)
- Link underlines for additional visual cue

**Interactive Elements**
- Buttons have minimum 3:1 contrast ratio
- Focus states have enhanced contrast

### 4. Touch Targets (Mobile)

**Minimum Size**
- All touch targets are minimum 44x44px on mobile (WCAG 2.1 Level AAA - 2.5.5)
- Navigation buttons: 48px minimum height
- Exception for inline text links

**Spacing**
- Adequate spacing between touch targets to prevent mis-taps
- Mobile nav items properly spaced

### 5. Motion and Animation

**Reduced Motion Support**
- Respects `prefers-reduced-motion` media query
- Animations reduced to 0.01ms when user prefers reduced motion
- Scroll behavior changed to `auto`

**Example:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 6. Responsive Design

**Font Scaling**
- Respects user's font size preferences
- Uses `clamp()` for responsive font sizing
- Mobile: `clamp(15px, 4vw, 17px)`
- Desktop: `clamp(14px, 1vw, 16px)`

**Safe Area Insets**
- Respects notched device safe areas
- Mobile nav uses `mobile-nav-safe` class
- Properly handles iOS safe area insets

### 7. High Contrast Mode

**Support for `prefers-contrast: high`**
- Increases border width on panels
- Adds explicit borders to interactive elements
- Ensures visibility in high contrast mode

## Implementation Guidelines

### Adding a New Page

1. **Add Main Content ID**
```tsx
<main id="main-content" className="...">
  {/* page content */}
</main>
```

2. **Use Semantic HTML**
```tsx
<nav aria-label="...">
<section aria-labelledby="...">
<h1 id="page-title">
```

3. **Add ARIA Labels**
```tsx
<button aria-label="Close modal">
  <X aria-hidden="true" />
</button>
```

### Adding Interactive Elements

1. **Buttons**
```tsx
<button
  onClick={handleClick}
  aria-label="Descriptive action"
  className="min-h-[44px] min-w-[44px]" // Mobile touch target
>
  <Icon aria-hidden="true" />
  <span>Button Text</span>
</button>
```

2. **Links**
```tsx
<Link
  href="/page"
  aria-current={isActive ? "page" : undefined}
  aria-label="Navigate to Page"
>
  <Icon aria-hidden="true" />
  <span>Link Text</span>
</Link>
```

3. **Forms**
```tsx
<label htmlFor="input-id">
  Field Label
</label>
<input
  id="input-id"
  type="text"
  aria-describedby="help-text"
  aria-invalid={hasError}
/>
<span id="help-text">Help text</span>
```

### Loading and Error States

1. **Loading States**
```tsx
<div role="status" aria-live="polite">
  <InlineLoader text="Loading..." />
  <span className="sr-only">Loading content...</span>
</div>
```

2. **Error States**
```tsx
<div role="alert" aria-live="assertive">
  <ErrorState message="Error occurred" />
</div>
```

## Testing Checklist

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Skip link works and is visible on focus
- [ ] Focus indicators are visible on all elements
- [ ] No keyboard traps
- [ ] Logical tab order

### Screen Reader
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text or aria-label
- [ ] Dynamic content changes are announced
- [ ] Navigation structure is clear

### Mobile
- [ ] All touch targets are at least 44x44px
- [ ] Pinch zoom is enabled
- [ ] Content reflows at 200% zoom
- [ ] Safe area insets respected on notched devices
- [ ] No horizontal scrolling

### Visual
- [ ] Text contrast meets WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] Focus indicators are visible
- [ ] Works in high contrast mode
- [ ] Text is readable at 200% zoom

### Motion
- [ ] Animations can be disabled
- [ ] No seizure-inducing content (no flashing >3 times/second)
- [ ] Reduced motion preference is respected

## Tools for Testing

### Browser Extensions
- **WAVE**: Web Accessibility Evaluation Tool
- **axe DevTools**: Automated accessibility testing
- **Lighthouse**: Chrome DevTools accessibility audit

### Screen Readers
- **NVDA**: Free Windows screen reader
- **JAWS**: Popular Windows screen reader
- **VoiceOver**: macOS/iOS built-in screen reader
- **TalkBack**: Android built-in screen reader

### Keyboard Testing
- Use keyboard only (Tab, Shift+Tab, Enter, Space, Arrow keys)
- Test all interactive elements
- Verify skip link functionality

### Mobile Testing
- Test on real devices (iOS and Android)
- Test with different text sizes (Settings → Accessibility)
- Test with VoiceOver/TalkBack enabled
- Test on notched devices (iPhone X and later)

## Common Issues and Fixes

### Issue: Focusring not visible
**Fix:** Add `:focus-visible` styles
```css
button:focus-visible {
  outline: 3px solid var(--highlight-yellow);
  outline-offset: 2px;
}
```

### Issue: Icon-only button not labeled
**Fix:** Add `aria-label`
```tsx
<button aria-label="Close">
  <X aria-hidden="true" />
</button>
```

### Issue: Dynamic content not announced
**Fix:** Add `aria-live`
```tsx
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

### Issue: Touch target too small
**Fix:** Add minimum size on mobile
```tsx
<button className="min-h-[44px] min-w-[44px]">
  Button
</button>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)
- [Inclusive Components](https://inclusive-components.design/)

## Contact

For accessibility concerns or questions, please open an issue on GitHub.
