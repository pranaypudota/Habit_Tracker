export const CATEGORY_BADGE_COLORS: Record<string, string> = {
    'Health': 'badge-cyan',
    'Nutrition': 'badge-green',
    'Fitness': 'badge-red',
    'Learning': 'badge-blue',
    'Mindfulness': 'badge-teal',
    'Work': 'badge-indigo',
    'Creative': 'badge-pink',
    'Social': 'badge-lavender',
    'Finance': 'badge-emerald',
    'Self-Care': 'badge-coral',
    'Outdoor': 'badge-lime',
    'Other': 'badge-gray',
    'default': 'badge-gray',
};

export const CATEGORIES = [
    'Health', 'Nutrition', 'Fitness', 'Learning', 'Mindfulness',
    'Work', 'Creative', 'Social', 'Finance', 'Self-Care', 'Outdoor', 'Other',
] as const;
