import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-sans)', 'Outfit', 'Arial', 'Helvetica', 'sans-serif'],
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			/* Yonima signature palette (raw hex tokens) */
  			'green-forest': 'var(--green-forest)',
  			'green-electric': 'var(--green-electric)',
  			'green-deep': 'var(--green-deep)',
  			'green-50': 'var(--green-50)',
  			'green-100': 'var(--green-100)',
  			'green-200': 'var(--green-200)',
  			'bg-warm': 'var(--bg-warm)',
  			'neutral-100': 'var(--neutral-100)',
  			'neutral-200': 'var(--neutral-200)',
  			'neutral-300': 'var(--neutral-300)',
  			'neutral-500': 'var(--neutral-500)',
  			ink: 'var(--ink)',
  			'ink-muted': 'var(--ink-muted)',
  			warning: 'var(--warning)',
  			'warning-bg': 'var(--warning-bg)',
  			'warning-ink': 'var(--warning-ink)',
  			success: 'var(--success)',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			/* Yonima radius scale: 8 / 14 / 18 / 20 / 26 / 99 */
  			sm: 'var(--radius-sm)',
  			md: 'var(--radius-md)',
  			lg: 'var(--radius-lg)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			pill: 'var(--radius-pill)'
  		},
  		boxShadow: {
  			card: 'var(--shadow-card)',
  			raised: 'var(--shadow-raised)',
  			float: 'var(--shadow-float)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
