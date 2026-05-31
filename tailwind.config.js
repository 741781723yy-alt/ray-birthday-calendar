/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F0',
        'bg-blue-light': '#EBF4FA',
        'blue-primary': '#6B9AC4',
        'blue-dark': '#405B7A',
        'blue-mid': '#8AB4D6',
        'blue-glass': '#B8D4E8',
        'blue-pale': '#D6EBF5',
        peach: '#F4A261',
        gold: '#E9C46A',
        'pink-soft': '#F8C8DC',
        'green-soft': '#A3D9A5',
        'text-primary': '#2D3748',
        'text-light': '#FFFFFF',
        'text-muted': '#8899AA',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', 'cursive'],
        number: ['"Fredoka One"', 'sans-serif'],
        body: ['Quicksand', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        soft: '0 4px 20px rgba(107, 154, 196, 0.15)',
        medium: '0 8px 32px rgba(107, 154, 196, 0.25)',
        glow: '0 0 20px rgba(244, 162, 97, 0.4)',
        building: '0 12px 40px rgba(64, 91, 122, 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "cloud-drift": {
          '0%': { transform: 'translateX(-150%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        "twinkle": {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        "streamer-sway": {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        "character-walk": {
          '0%': { transform: 'translateX(-60px)' },
          '100%': { transform: 'translateX(calc(100vw + 60px))' },
        },
        "arm-wave": {
          '0%, 100%': { transform: 'rotate(-15deg)' },
          '50%': { transform: 'rotate(15deg)' },
        },
        "bob": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        "hint-pulse": {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "cloud-drift-1": "cloud-drift 22s linear infinite",
        "cloud-drift-2": "cloud-drift 18s linear infinite",
        "cloud-drift-3": "cloud-drift 25s linear infinite",
        "cloud-drift-4": "cloud-drift 20s linear infinite",
        "twinkle": "twinkle 2s ease-in-out infinite",
        "streamer-sway": "streamer-sway 4s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "character-walk": "character-walk 12s linear infinite",
        "arm-wave": "arm-wave 0.6s ease-in-out infinite",
        "bob": "bob 0.3s ease-in-out infinite",
        "hint-pulse": "hint-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
