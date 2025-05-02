import type { Config } from "tailwindcss";
const animate = require('tailwindcss-animate'); // Explicit import
const typography = require('@tailwindcss/typography'); // Explicit import

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
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
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
        // Configure typography styles using HSL variables from the theme
        typography: (theme: any) => ({
            DEFAULT: {
              css: {
                '--tw-prose-body': 'hsl(var(--foreground))',
                '--tw-prose-headings': 'hsl(var(--primary))',
                '--tw-prose-lead': 'hsl(var(--foreground))',
                '--tw-prose-links': 'hsl(var(--primary))',
                '--tw-prose-bold': 'hsl(var(--foreground))', // Use foreground for bold
                '--tw-prose-counters': 'hsl(var(--muted-foreground))',
                '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
                '--tw-prose-hr': 'hsl(var(--border))',
                '--tw-prose-quotes': 'hsl(var(--foreground))',
                '--tw-prose-quote-borders': 'hsl(var(--border))',
                '--tw-prose-captions': 'hsl(var(--muted-foreground))',
                '--tw-prose-code': 'hsl(var(--foreground))', // Code color
                '--tw-prose-pre-code': 'hsl(var(--foreground))', // Code block text color
                '--tw-prose-pre-bg': 'hsl(var(--muted))', // Code block background
                '--tw-prose-th-borders': 'hsl(var(--border))',
                '--tw-prose-td-borders': 'hsl(var(--border))',

                // Dark mode handled by CSS variables, but you could define specific dark prose if needed
                 '--tw-prose-invert-body': 'hsl(var(--foreground))', // Already handled by body dark mode
                 '--tw-prose-invert-headings': 'hsl(var(--primary))', // Already handled by body dark mode
                 '--tw-prose-invert-links': 'hsl(var(--primary))', // Already handled by body dark mode
                 '--tw-prose-invert-bold': 'hsl(var(--foreground))',
                 '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
                 '--tw-prose-invert-hr': 'hsl(var(--border))',
                 '--tw-prose-invert-quotes': 'hsl(var(--foreground))',
                 '--tw-prose-invert-quote-borders': 'hsl(var(--border))',
                 '--tw-prose-invert-pre-bg': 'hsl(var(--muted))', // Use dark muted for code blocks

                // Customizations: Adjust list spacing, paragraph margins etc.
                ul: {
                  paddingLeft: theme('spacing.5'),
                  marginTop: theme('spacing.2'), // Add some top margin to lists
                  marginBottom: theme('spacing.2'), // Add some bottom margin to lists
                 },
                ol: {
                  paddingLeft: theme('spacing.5'),
                   marginTop: theme('spacing.2'),
                   marginBottom: theme('spacing.2'),
                 },
                li: {
                  marginTop: theme('spacing.1'),
                  marginBottom: theme('spacing.1'),
                 },
                 p: {
                    marginTop: '0.5em', // Slightly reduced paragraph spacing within prose
                    marginBottom: '0.5em',
                 },
                 h1: { color: 'hsl(var(--primary))' }, // Ensure headings use primary color
                 h2: { color: 'hsl(var(--primary))' },
                 h3: { color: 'hsl(var(--primary))' },
                 h4: { color: 'hsl(var(--primary))', fontSize: '1.1em' }, // Example: make h4 slightly bigger
                 strong: { color: 'hsl(var(--foreground))' }, // Ensure bold uses foreground
                 a: {
                    color: 'hsl(var(--accent))', // Use accent for links
                    '&:hover': {
                      color: 'hsl(var(--accent-foreground))', // Optional: change link hover color
                      textDecoration: 'underline',
                    },
                  },
                  // Style code blocks
                  pre: {
                    backgroundColor: 'hsl(var(--muted) / 0.6)', // Slightly transparent muted background
                    borderRadius: theme('borderRadius.md'),
                    padding: theme('spacing.4'),
                    color: 'hsl(var(--foreground))', // Use foreground for code text
                    border: `1px solid hsl(var(--border))`, // Add subtle border
                  },
                  code: {
                      backgroundColor: 'hsl(var(--muted) / 0.5)', // Inline code background
                      padding: '0.2em 0.4em',
                      borderRadius: theme('borderRadius.sm'),
                      fontSize: '90%', // Slightly smaller inline code
                      color: 'hsl(var(--accent-foreground))', // Use accent foreground for inline code
                      '&::before': { content: '""' }, // Remove backticks
                      '&::after': { content: '""' }, // Remove backticks
                  },
              },
            },
          }),
  	}
  },
  plugins: [
    animate, // Use imported variable
    typography, // Use imported variable
    ],
} satisfies Config;
