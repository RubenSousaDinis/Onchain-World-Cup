# Championship Manager 01/02 Style Guide
## Crypto World Cup 2026 - Design System Documentation

This guide ensures all pages maintain the authentic Championship Manager 01/02 aesthetic with football/soccer vibes.

---

## 🎨 Color Palette

### Primary Colors
```css
--cm-navy: #001a4d           /* Dark navy blue - sidebar, main backgrounds */
--cm-royal-blue: #0033cc     /* Royal blue - active states */
--cm-deep-purple: #1a0066    /* Deep purple - navigation tabs */
--cm-medium-purple: #2d1b69  /* Medium purple - section headers */
```

### Accent Colors
```css
--cm-yellow: #ffff00         /* Bright yellow - highlights, scores, important text */
--cm-lime: #d4ff00           /* Lime yellow - secondary highlights */
--cm-cyan: #00ffff           /* Cyan - special indicators */
```

### Neutrals
```css
--cm-gray-dark: #2a2a2a      /* Dark gray - data panels */
--cm-gray-medium: #4a4a4a    /* Medium gray - borders */
--cm-gray-light: #666666     /* Light gray - secondary text */
--cm-white: #ffffff          /* White - primary text */
--cm-off-white: #f0f0f0      /* Off-white - table backgrounds */
```

### Soccer Field Colors
```css
--field-green-dark: #1a4d2e  /* Dark green - field stripes */
--field-green-light: #2d5f3f /* Light green - alternating stripes */
--field-line-white: rgba(255, 255, 255, 0.6) /* Field markings */
```

---

## 📐 Layout Structure

### Page Container Pattern
```tsx
<div className="flex h-screen overflow-hidden bg-[#001a4d]">
  {/* Sidebar - Desktop Only */}
  <RetroSidebar />
  
  {/* Main Content Area */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Navigation Tabs */}
    <RetroNavTabs tabs={[...]} activeTab="..." />
    
    {/* Content with Soccer Background */}
    <div className="flex-1 overflow-y-auto soccer-field-bg">
      {/* Your content here */}
    </div>
  </div>
  
  {/* Mobile Navigation - Bottom */}
  <MobileNav />
</div>
```

### Section Header Pattern
Always use this pattern for page sections:
```tsx
<div className="cm-section-header">
  <h2 className="text-xl md:text-2xl font-bold text-[#ffff00] uppercase tracking-wider">
    Section Title
  </h2>
</div>
```

---

## 🏗️ Core Components

### 1. CM Panel (Data Container)
```tsx
<div className="cm-panel">
  <div className="cm-panel-header">
    Header Title
  </div>
  <div className="cm-panel-body">
    {/* Content */}
  </div>
</div>
```

**CSS Classes:**
```css
.cm-panel {
  background: linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #4a4a4a;
  border-radius: 0; /* No rounded corners in CM! */
}

.cm-panel-header {
  background: linear-gradient(to bottom, #2d1b69 0%, #1a0d4d 100%);
  border-bottom: 2px solid #ffff00;
  padding: 0.75rem 1rem;
  color: #ffff00;
  font-weight: bold;
  text-transform: uppercase;
}

.cm-panel-body {
  padding: 1rem;
}
```

### 2. CM Table
```tsx
<div className="cm-table-container">
  <table className="cm-table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <tr className="cm-table-row">
        <td>Data 1</td>
        <td className="text-[#ffff00]">123</td>
      </tr>
    </tbody>
  </table>
</div>
```

**CSS Classes:**
```css
.cm-table-container {
  overflow-x: auto;
  border: 2px solid #4a4a4a;
}

.cm-table {
  width: 100%;
  border-collapse: collapse;
}

.cm-table thead {
  background: linear-gradient(to bottom, #2d1b69 0%, #1a0d4d 100%);
}

.cm-table th {
  padding: 0.75rem;
  text-align: left;
  color: #ffff00;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.875rem;
  border-right: 1px solid #4a4a4a;
}

.cm-table-row {
  background: linear-gradient(to bottom, #2a2a2a 0%, #1f1f1f 100%);
  border-bottom: 1px solid #3a3a3a;
  transition: all 0.15s ease;
}

.cm-table-row:hover {
  background: linear-gradient(to bottom, #3a3a3a 0%, #2f2f2f 100%);
  border-left: 3px solid #ffff00;
  padding-left: calc(1rem - 3px);
}

.cm-table td {
  padding: 0.75rem 1rem;
  color: #ffffff;
  border-right: 1px solid #3a3a3a;
}
```

### 3. Match Card (Score Display)
```tsx
<Link href={`/matches/${match.id}`} className="cm-match-card">
  {/* Team 1 */}
  <div className="flex items-center justify-between flex-1">
    <Link href={`/teams/${team1}`} className="cm-team-name">
      {team1}
    </Link>
    <span className="cm-score">{votes1}</span>
  </div>
  
  {/* VS Divider */}
  <div className="cm-vs-divider">VS</div>
  
  {/* Team 2 */}
  <div className="flex items-center justify-between flex-1">
    <span className="cm-score">{votes2}</span>
    <Link href={`/teams/${team2}`} className="cm-team-name">
      {team2}
    </Link>
  </div>
</Link>
```

**CSS Classes:**
```css
.cm-match-card {
  background: linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #4a4a4a;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  transition: all 0.2s ease;
}

.cm-match-card:hover {
  border-color: #ffff00;
  background: linear-gradient(to bottom, #3a3a3a 0%, #2a2a2a 100%);
  transform: translateY(-2px);
}

.cm-team-name {
  color: #ffffff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1.125rem;
}

.cm-team-name:hover {
  color: #ffff00;
}

.cm-score {
  color: #ffff00;
  font-size: 1.5rem;
  font-weight: bold;
  font-family: monospace;
}

.cm-vs-divider {
  color: #ffff00;
  font-weight: bold;
  padding: 0 0.5rem;
  opacity: 0.6;
}
```

---

## ⚽ Soccer Field Backgrounds

### Implementation
Every page should have soccer field styling in headers and backgrounds:

```tsx
// Page wrapper
<div className="soccer-field-bg">
  {/* Content */}
</div>

// Section header with field
<div className="soccer-field-header">
  <h1>Title</h1>
</div>
```

**CSS Classes:**
```css
.soccer-field-bg {
  background: 
    linear-gradient(to bottom, 
      #1a4d2e 0%, 
      #2d5f3f 50%, 
      #1a4d2e 100%
    );
  position: relative;
}

.soccer-field-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 39px,
      rgba(255, 255, 255, 0.03) 39px,
      rgba(255, 255, 255, 0.03) 80px
    );
  pointer-events: none;
}

.soccer-field-header {
  background: linear-gradient(135deg, #1a4d2e 0%, #2d5f3f 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.soccer-field-header::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
}
```

---

## 🎯 Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
```

### Text Styles

**Headers:**
```css
h1: uppercase, font-weight: bold, color: #ffff00, font-size: 1.5rem-2rem
h2: uppercase, font-weight: bold, color: #ffff00, font-size: 1.25rem-1.5rem
h3: uppercase, font-weight: 600, color: #ffffff, font-size: 1rem-1.125rem
```

**Body Text:**
```css
Regular: color: #ffffff, font-size: 0.875rem-1rem
Secondary: color: #cccccc, font-size: 0.875rem
Small: color: #999999, font-size: 0.75rem-0.875rem
```

**Numeric Data (Scores, Stats):**
```css
color: #ffff00
font-weight: bold
font-family: monospace
font-size: 1.125rem-1.5rem
```

---

## 🔘 Interactive Elements

### Buttons

**Primary Button:**
```tsx
<button className="cm-button-primary">
  Vote Now
</button>
```

```css
.cm-button-primary {
  background: linear-gradient(to bottom, #0044cc 0%, #0033aa 100%);
  border: 2px solid #0066ff;
  color: #ffff00;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.cm-button-primary:hover {
  background: linear-gradient(to bottom, #0055dd 0%, #0044bb 100%);
  border-color: #ffff00;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
```

**Secondary Button:**
```css
.cm-button-secondary {
  background: linear-gradient(to bottom, #2d1b69 0%, #1a0d4d 100%);
  border: 2px solid #4a4a4a;
  color: #ffffff;
}

.cm-button-secondary:hover {
  border-color: #ffff00;
  color: #ffff00;
}
```

### Links
```css
a {
  color: #ffffff;
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: #ffff00;
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile Considerations
- Hide sidebar on mobile, show MobileNav at bottom
- Tables should scroll horizontally: `overflow-x-auto`
- Reduce font sizes: `text-sm md:text-base`
- Stack columns: `flex-col md:flex-row`
- Reduce padding: `p-2 md:p-4`
- Hide less important columns on mobile

---

## ✅ Do's and Don'ts

### ✅ DO:
- Use uppercase for headers and labels
- Use yellow (#ffff00) for scores, stats, and highlights
- Add soccer field backgrounds to main content areas
- Use sharp corners (no border-radius except for specific elements)
- Use gradients for depth (dark to darker)
- Add hover states that show yellow borders/highlights
- Use monospace fonts for numeric data
- Add border separators between rows/columns
- Use purple/blue gradients for navigation
- Make tables with alternating row backgrounds

### ❌ DON'T:
- Use rounded corners on panels/cards
- Use pastel colors or soft gradients
- Use emojis as icons
- Center-align tables (left-align is CM style)
- Use thin borders (always 2px minimum)
- Use light backgrounds (always dark)
- Hide the soccer field aesthetic
- Use modern, sleek designs (keep it retro/blocky)

---

## 🎨 Common Patterns

### Stat Display
```tsx
<div className="flex justify-between items-center p-3 border-b border-[#4a4a4a]">
  <span className="text-[#cccccc] uppercase text-sm">Label</span>
  <span className="text-[#ffff00] font-bold text-lg font-mono">123</span>
</div>
```

### Team/User Link
```tsx
<Link 
  href="/teams/brazil"
  className="text-white font-bold uppercase hover:text-[#ffff00] transition-colors"
>
  Brazil
</Link>
```

### Status Badge
```tsx
<span className="inline-block px-3 py-1 bg-gradient-to-b from-[#0044cc] to-[#0033aa] border border-[#0066ff] text-[#ffff00] text-xs font-bold uppercase">
  ACTIVE
</span>
```

### Section Divider
```tsx
<div className="h-0.5 bg-gradient-to-r from-transparent via-[#ffff00] to-transparent my-6" />
```

---

## 🏆 Example Page Structure

```tsx
export default function ExamplePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#001a4d]">
      <RetroSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <RetroNavTabs 
          tabs={['Overview', 'Stats', 'History']} 
          activeTab="Overview" 
        />
        
        <div className="flex-1 overflow-y-auto soccer-field-bg">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            
            {/* Page Header */}
            <div className="soccer-field-header">
              <h1 className="text-2xl md:text-3xl font-bold text-[#ffff00] uppercase">
                Page Title
              </h1>
            </div>
            
            {/* Content Sections */}
            <div className="cm-panel">
              <div className="cm-panel-header">
                Section Title
              </div>
              <div className="cm-panel-body">
                {/* Your content */}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <MobileNav />
    </div>
  )
}
```

---

## 🔍 Quality Checklist

Before considering a page complete, verify:

- [ ] Soccer field background is visible
- [ ] Headers use yellow (#ffff00) text
- [ ] All panels have dark gradients
- [ ] Navigation tabs are purple/blue
- [ ] Hover states show yellow highlights
- [ ] Tables have proper borders and alternating rows
- [ ] Mobile layout is responsive with bottom nav
- [ ] No rounded corners on main panels
- [ ] Uppercase text for headers/labels
- [ ] Numeric data uses yellow + monospace font
- [ ] Links turn yellow on hover
- [ ] Sharp, blocky aesthetic maintained
- [ ] Proper contrast for readability
- [ ] Consistent spacing and padding

---

## 📚 Reference Files

Key files to reference for consistent styling:
- `app/globals.css` - Core CM styles and utilities
- `components/match-card.tsx` - Match display pattern
- `app/HomePageClient.tsx` - Main matches page (best example)
- `components/retro-nav-tabs.tsx` - Navigation pattern
- `components/retro-sidebar.tsx` - Sidebar/menu pattern

---

**Remember:** Championship Manager 01/02 was iconic for its no-nonsense, data-dense, blocky interface with a distinctive color scheme. Every design decision should prioritize clarity, functionality, and that nostalgic retro football management aesthetic. ⚽
