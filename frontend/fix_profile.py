import re

fpath = '/Users/hatim/Projects/Sportsync-Updated/Sportsync/frontend/src/pages/user/Profile.jsx'
with open(fpath, 'r') as f:
    content = f.read()

replacements = [
    (r'bg-white(?!\s*\/)', 'bg-card'),
    (r'bg-\[#f9f9f9\]', 'bg-secondary'),
    (r'bg-\[#FAF5E6\]', 'bg-secondary'),
    (r'bg-gray-50', 'bg-secondary'),
    (r'bg-gray-100', 'bg-secondary'),
    (r'bg-gray-800', 'bg-primary'),
    (r'bg-gray-900', 'bg-primary'),
    (r'(?<!\-)bg-black(?!\/)','bg-primary'),

    (r'text-gray-900', 'text-foreground'),
    (r'text-gray-800', 'text-foreground'),
    (r'text-gray-700', 'text-foreground'),
    (r'text-gray-600', 'text-muted-foreground'),
    (r'text-gray-500', 'text-muted-foreground'),
    (r'text-gray-400', 'text-muted-foreground'),
    (r'text-gray-300', 'text-muted-foreground'),
    (r'(?<!\-)text-black(?!\/)', 'text-foreground'),
    (r'(?<!\-)text-white(?!\/)', 'text-primary-foreground'),

    (r'border-gray-100', 'border-border'),
    (r'border-gray-200', 'border-border'),
    (r'border-gray-300', 'border-border'),
    (r'border-gray-400', 'border-border'),
    (r'(?<!\-)border-black', 'border-primary'),

    (r'ring-purple-500', 'ring-primary'),
    (r'ring-blue-500', 'ring-primary'),
    (r'focus:border-black', 'focus:border-primary'),
    (r'focus:border-gray-400', 'focus:border-primary'),

    (r'hover:bg-gray-100', 'hover:bg-secondary'),
    (r'hover:bg-gray-50', 'hover:bg-secondary'),
    (r'hover:bg-gray-800', 'hover:bg-primary/90'),
    (r'hover:text-black', 'hover:text-foreground'),
    (r'hover:text-gray-900', 'hover:text-foreground'),

    (r'placeholder-gray-400', 'placeholder-muted-foreground'),
    (r'placeholder-gray-500', 'placeholder-muted-foreground'),

    (r'SilverWale', 'Sportsync'),
    (r'Silverwale', 'Sportsync'),
    (r'silverwale', 'sportsync'),
    (r'Jewellery', 'Equipment'),
    (r'jewellery', 'equipment'),
    (r'jewelry', 'equipment'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

# bg-background wrapper
content = re.sub(
    r'(className="[^"]*?)bg-card(\s+min-h-screen)',
    r'\1bg-background text-foreground\2',
    content, count=1
)
content = re.sub(
    r'(className="[^"]*?min-h-screen\s+)bg-card',
    r'\1bg-background text-foreground',
    content, count=1
)

with open(fpath, 'w') as f:
    f.write(content)
