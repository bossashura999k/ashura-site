// js/products.js
export async function loadProducts(category) {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // If the JSON has a "products" array, use it; otherwise assume the data itself is an array
        const allProducts = Array.isArray(data) ? data : (data.products || []);
        return allProducts.filter(p => p.category === category);
    } catch (error) {
        console.error('Failed to load products from JSON:', error);
        // Fallback data (hardcoded) – you can also return empty array
        return getFallbackProducts(category);
    }
}

// Optional fallback if JSON fails
function getFallbackProducts(category) {
    const fallback = {
        bags: [
            {
                id: 1,
                name: "Classic Leather Tote",
                price: 35000,
                image: "images/207980951-1-silvermet.jpeg",
                descriptionShort: "Professional & Spacious",
                description: "A timeless leather tote bag, perfect for work and everyday elegance."
            },
            {
                id: 2,
                name: "Sling Crossbody",
                price: 18000,
                image: "images/208481497-1-black.jpeg",
                descriptionShort: "Compact & Secure",
                description: "Stylish crossbody bag with secure zipper and adjustable strap."
            },
            {
                id: 3,
                name: "Urban Backpack",
                price: 28500,
                image: "images/208995850-1-white.jpeg",
                descriptionShort: "Modern Everyday Carry",
                description: "A sleek, durable backpack with padded laptop compartment."
            }
        ],
        gadgets: [
            {
                id: 4,
                name: "Dell Alienware m18",
                price: 7550000,
                image: "images/pic.jpeg",
                descriptionShort: "Extreme Performance",
                description: "High-end gaming laptop with Intel Core i9, RTX 4090."
            },
            {
                id: 5,
                name: "HP EliteBook G8",
                price: 1220000,
                image: "images/pic2.jpeg",
                descriptionShort: "Business Professional",
                description: "Lightweight business laptop with powerful security features."
            },
            {
                id: 6,
                name: "iPhone 17 Pro Max",
                price: 2530500,
                image: "images/pic3.jpeg",
                descriptionShort: "Gold • 1TB Storage",
                description: "Latest iPhone with A17 chip, Pro camera system."
            }
        ]
    };
    return fallback[category] || [];
}
