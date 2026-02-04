import { Product } from '@/context/CartContext';

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'new-1',
        name: 'Midnight Calla Lilies',
        description: 'Elegant and mysterious dark purple calla lilies, perfect for a sophisticated statement.',
        imageUrl: '/calla-lily.jpg', // Deprecated
        images: ['/calla-lily.jpg'],
        originalPrice: 75.00,
        discountPrice: null,
        flowerType: 'Lilies',
        origin: 'Holland',
        freshness: '7 Days',
        colors: ['Purple'],
        colorImages: { 'Purple': '/calla-lily.jpg' }
    },
    {
        id: 'new-2',
        name: 'Elegant White Lilies',
        description: 'Pristine white lilies that radiate purity and grace. A classic choice for any refined setting.',
        imageUrl: '/white-lily-fresh.jpg',
        images: ['/white-lily-fresh.jpg'],
        originalPrice: 60.00,
        discountPrice: 55.00,
        flowerType: 'Lilies',
        origin: 'France',
        freshness: '5 Days',
        colors: ['White'],
        colorImages: { 'White': '/white-lily-fresh.jpg' }
    },
    {
        id: 'new-3',
        name: 'Blushing Peonies',
        description: 'Lush pink peonies with voluminous layers of petals. A symbol of romance and prosperity.',
        imageUrl: '/pink-peony.jpg',
        images: ['/pink-peony.jpg'],
        originalPrice: 95.00,
        discountPrice: null,
        flowerType: 'Peonies',
        origin: 'Holland',
        freshness: '5 Days',
        colors: ['Pink'],
        colorImages: { 'Pink': '/pink-peony.jpg' }
    },
    {
        id: 'new-4',
        name: 'Spring Daffodils',
        description: 'Bright and cheery daffodils to welcome the warmth of spring.',
        imageUrl: '/daffodil.jpg',
        images: ['/daffodil.jpg'],
        originalPrice: 40.00,
        discountPrice: null,
        flowerType: 'Daffodils',
        origin: 'UK',
        freshness: '5 Days',
        colors: ['Yellow'],
        colorImages: { 'Yellow': '/daffodil.jpg' }
    },
    {
        id: 'new-5',
        name: 'Pink Hydrangea Cloud',
        description: 'A voluminous cloud of soft pink hydrangea blooms.',
        imageUrl: '/hydrangea-pink.jpg',
        images: ['/hydrangea-pink.jpg'],
        originalPrice: 55.00,
        discountPrice: 48.00,
        flowerType: 'Hydrangea',
        origin: 'Colombia',
        freshness: '7 Days',
        colors: ['Pink'],
        colorImages: { 'Pink': '/hydrangea-pink.jpg' }
    },
    {
        id: '1',
        name: 'Royal Red Roses',
        description: 'Breathtaking long-stemmed red roses for your special someone. Symbolizing love and passion, these deep red blooms are hand-selected for their perfection and fresh fragrance. Perfect for anniversaries, Valentine’s Day, or simply to say "I love you".',
        imageUrl: '/flower-red.jpg',
        images: ['/flower-red.jpg'],
        originalPrice: 89.99,
        discountPrice: 69.99,
        flowerType: 'Roses',
        stemLength: 70,
        colors: ['Red', 'Pink', 'White'],
        colorImages: {
            'Red': '/flower-red.jpg',
            'Pink': '/flower-pink.jpg',
            'White': '/flower-blue.jpg' // Using blue as proxy for white/other for demo
        }
    },
    {
        id: '2',
        name: 'Pure White Lilies',
        description: 'Elegant white lilies that symbolize purity and grace. Their trumpet-shaped blooms release a sophisticated scent that fills the room. Ideal for weddings, sympathy arrangements, or adding a touch of serenity to your home.',
        imageUrl: '/flower-blue.jpg',
        images: ['/flower-blue.jpg'],
        originalPrice: 54.99,
        discountPrice: null,
        flowerType: 'Lilies',
        stemLength: 50,
        colors: ['White', 'Pink'],
        colorImages: {
            'White': '/flower-blue.jpg',
            'Pink': '/flower-lilies.jpg'
        }
    },
    {
        id: '3',
        name: 'Sunflower Happiness',
        description: 'Bright and cheerful sunflowers to light up any room. These "happy flowers" follow the sun and bring warmth and positivity wherever they go. A perfect gift to cheer up a friend or celebrate a summer day.',
        imageUrl: '/flower-pink.jpg',
        images: ['/flower-pink.jpg'],
        originalPrice: 45.00,
        discountPrice: 39.99,
        flowerType: 'Sunflowers',
        stemLength: 60,
        colors: ['Yellow', 'Red'],
        colorImages: {
            'Yellow': '/flower-pink.jpg',
            'Red': '/flower-red.jpg'
        }
    },
    {
        id: '4',
        name: 'Midnight Tulips',
        description: 'Rare dark purple tulips for a touch of mystery. These unique blooms add a dramatic flair to any bouquet. Known for their simple yet refined shape, tulips represent perfect love and elegance.',
        imageUrl: '/flower-tulip.jpg',
        images: ['/flower-tulip.jpg'],
        originalPrice: 65.00,
        discountPrice: null,
        flowerType: 'Tulips',
        stemLength: 25,
        colors: ['Purple', 'Pink'],
        colorImages: {
            'Purple': '/flower-tulip.jpg',
            'Pink': '/flower-pink.jpg'
        }
    },
    {
        id: '5',
        name: 'Pink Orchid Delight',
        description: 'Stunning pink orchids in a decorative pot. Known for their exotic beauty and long-lasting blooms, orchids symbolize luxury, beauty, and strength. A sophisticated gift that keeps on giving.',
        imageUrl: '/flower-lilies.jpg',
        images: ['/flower-lilies.jpg'],
        originalPrice: 120.00,
        discountPrice: 99.00,
        flowerType: 'Orchids',
        stemLength: 40,
        colors: ['Pink', 'White'],
        colorImages: {
            'Pink': '/flower-lilies.jpg',
            'White': '/flower-blue.jpg'
        }
    },
    {
        id: '6',
        name: 'Mixed Carnation Bouquet',
        description: 'A colorful mix of fresh carnations. These ruffled blooms are long-lasting and full of texture. Represents fascination and new love. A versatile choice for birthdays, graduations, or just because.',
        imageUrl: '/flower-red.jpg',
        images: ['/flower-red.jpg'],
        originalPrice: 35.00,
        discountPrice: null,
        flowerType: 'Carnations',
        stemLength: 35,
        colors: ['Mixed', 'Red', 'Pink'],
        colorImages: {
            'Mixed': '/flower-red.jpg',
            'Red': '/flower-red.jpg',
            'Pink': '/flower-pink.jpg'
        }
    },
];
