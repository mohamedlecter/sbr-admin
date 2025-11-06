# SBR Admin Design System

This document outlines the complete design system used in the SBR Admin application. Use this as a reference when building the user-facing website to maintain consistency.

## Color Palette

All colors are defined in HSL format. The primary color is **#CE0014** (red).

### Primary Colors
```css
--primary: 354 100% 40%;           /* #CE0014 - Main brand red */
--primary-foreground: 0 0% 100%;    /* White text on red */
```

### Background Colors
```css
--background: 0 0% 100%;            /* White background */
--foreground: 222 10% 12%;         /* Dark text (#1a1d21) */
--card: 0 0% 98%;                   /* Very light gray cards */
--card-foreground: 222 10% 12%;    /* Dark text on cards */
```

### Secondary Colors
```css
--secondary: 210 8% 95%;           /* Light gray-blue */
--secondary-foreground: 222 10% 12%;
--muted: 210 10% 92%;               /* Muted gray */
--muted-foreground: 222 10% 45%;   /* Gray text */
```

### Accent Colors
```css
--accent: 354 90% 60%;              /* Lighter red */
--accent-foreground: 0 0% 100%;     /* White text */
```

### Status Colors
```css
--destructive: 354 100% 45%;        /* Red for errors/delete */
--destructive-foreground: 0 0% 100%;
--success: 142 71% 45%;             /* Green (#22c55e) */
--success-foreground: 0 0% 100%;
--warning: 38 92% 50%;              /* Orange (#f59e0b) */
--warning-foreground: 222 10% 12%;
```

### Border & Input Colors
```css
--border: 210 10% 88%;              /* Light gray borders */
--input: 210 10% 88%;               /* Input borders */
--ring: 354 100% 40%;               /* Focus ring (same as primary) */
```

### Sidebar Colors
```css
--sidebar-background: 0 0% 100%;    /* White sidebar */
--sidebar-foreground: 222 10% 12%;  /* Dark text */
--sidebar-primary: 354 100% 40%;    /* Active item color */
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 210 8% 95%;       /* Hover background */
--sidebar-accent-foreground: 222 10% 12%;
--sidebar-border: 210 10% 88%;       /* Sidebar border */
```

## Gradients

### Primary Gradient
```css
--gradient-primary: linear-gradient(135deg, 
  hsl(354 100% 40%),    /* #CE0014 */
  hsl(348 90% 60%)      /* Lighter red */
);
```

### Accent Gradient
```css
--gradient-accent: linear-gradient(135deg,
  hsl(354 90% 60%),     /* Light red */
  hsl(16 100% 60%)      /* Orange-red */
);
```

### Mesh Gradient (Background)
```css
--gradient-mesh: 
  radial-gradient(at 40% 20%, hsl(354 100% 40% / 0.18) 0px, transparent 50%),
  radial-gradient(at 80% 0%, hsl(25 95% 53% / 0.12) 0px, transparent 50%),
  radial-gradient(at 0% 50%, hsl(348 90% 60% / 0.08) 0px, transparent 50%);
```

**Usage in Tailwind:**
- `bg-gradient-primary` - Primary gradient background
- `bg-gradient-accent` - Accent gradient background
- `bg-gradient-mesh` - Subtle mesh background pattern

## Typography

### Font Families
The application uses the default system font stack (no custom fonts specified):
- Sans-serif system fonts
- Default browser font rendering

### Font Sizes (via Tailwind)
- Headings: `text-2xl`, `text-3xl`, `text-lg`
- Body: Default base size
- Small text: `text-sm`, `text-xs`

### Font Weights
- Bold: `font-bold` (700)
- Medium: `font-medium` (500)
- Regular: Default (400)

## Border Radius

```css
--radius: 0.75rem;  /* 12px - Base radius */
```

**Tailwind classes:**
- `rounded-lg` - 12px (base radius)
- `rounded-md` - 10px (radius - 2px)
- `rounded-sm` - 8px (radius - 4px)
- `rounded-xl` - Extra large for special elements

## Shadows

```css
--shadow-sm: 0 1px 2px 0 hsl(0 0% 0% / 0.05);
--shadow-md: 0 4px 6px -1px hsl(0 0% 0% / 0.3);
--shadow-lg: 0 10px 15px -3px hsl(0 0% 0% / 0.4);
--shadow-glow: 0 0 30px hsl(221 83% 53% / 0.3);
--shadow-accent: 0 0 20px hsl(25 95% 53% / 0.4);
```

**Tailwind classes:**
- `shadow-sm` - Small shadow
- `shadow-md` - Medium shadow
- `shadow-lg` - Large shadow
- `shadow-glow` - Glowing effect
- `shadow-accent` - Accent colored glow

## Spacing & Layout

### Container
```css
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px",
  },
}
```

### Common Spacing Patterns
- Cards: `p-6` or `p-4` padding
- Sections: `space-y-6` or `space-y-4` vertical spacing
- Grid gaps: `gap-6`, `gap-4`, `gap-2`
- Page padding: `p-6` for main content

## Component Patterns

### Buttons
```tsx
// Primary button (with gradient)
<Button className="bg-gradient-primary hover:opacity-90">
  Click me
</Button>

// Secondary button
<Button variant="outline">
  Cancel
</Button>

// Destructive button
<Button variant="destructive">
  Delete
</Button>
```

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Badges/Status Indicators
```tsx
// Primary badge
<Badge>{text}</Badge>

// Secondary badge
<Badge variant="secondary">{text}</Badge>

// Status colors
<Badge variant={status === 'active' ? 'default' : 'secondary'}>
  {status}
</Badge>
```

### Input Fields
```tsx
<Input 
  placeholder="Enter text"
  className="h-11"  // Common height
/>
```

## Common Class Patterns

### Text Colors
- `text-foreground` - Primary text color
- `text-muted-foreground` - Muted/secondary text
- `text-primary` - Primary red color

### Backgrounds
- `bg-background` - Main background (white)
- `bg-card` - Card background (very light gray)
- `bg-primary` - Primary red background
- `bg-muted` - Muted gray background

### Borders
- `border-border` - Default border color
- `border-primary` - Primary red border
- `rounded-lg` - Standard border radius

### Hover Effects
- `hover:bg-muted/50` - Subtle hover background
- `hover:opacity-90` - Slight opacity change
- `hover:underline` - Text underline on hover

## Animation & Transitions

```css
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

Common transitions:
- `transition-colors` - Color transitions
- `transition-all` - All property transitions
- Duration: Usually 150-300ms

## Loading States

```tsx
// Spinner
<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />

// With icon
<Loader2 className="mr-2 h-4 w-4 animate-spin" />
```

## Example Full Page Layout

```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold text-foreground">Page Title</h1>
    <Button className="bg-gradient-primary">Action</Button>
  </div>

  {/* Content Cards */}
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Content</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main content */}
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Sidebar</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Sidebar content */}
      </CardContent>
    </Card>
  </div>
</div>
```

## Quick Reference - Tailwind Classes

### Colors
- `bg-primary` / `text-primary` - Primary red
- `bg-secondary` / `text-secondary` - Secondary gray
- `bg-success` / `text-success` - Success green
- `bg-destructive` / `text-destructive` - Error red
- `bg-muted` / `text-muted-foreground` - Muted colors
- `bg-card` - Card background
- `border-border` - Default border

### Gradients
- `bg-gradient-primary` - Primary gradient
- `bg-gradient-accent` - Accent gradient
- `bg-gradient-mesh` - Mesh background pattern

### Typography
- `text-2xl` / `text-3xl` - Large headings
- `font-bold` / `font-medium` - Font weights
- `text-muted-foreground` - Muted text

### Layout
- `space-y-6` / `space-y-4` - Vertical spacing
- `gap-6` / `gap-4` - Grid/flex gaps
- `rounded-lg` - Standard border radius
- `shadow-lg` / `shadow-md` - Shadows

---

## Implementation Notes

1. **All colors must be HSL** - This allows for easy theme switching
2. **Use CSS variables** - Defined in `:root` for global access
3. **Tailwind classes** - Most styling done via Tailwind utility classes
4. **Component library** - Uses shadcn/ui components with custom styling
5. **Responsive design** - Mobile-first with `md:`, `lg:`, `xl:` breakpoints

## Recommended Stack for User Site

- **Framework**: React/Next.js
- **Styling**: Tailwind CSS with same config
- **Components**: shadcn/ui or similar component library
- **Icons**: Lucide React (same icon library)
- **Theme**: Copy the CSS variables from `index.css`

---

*Last updated: Based on current admin application codebase*

