import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Watch, Headphones, Home, Shirt, Book } from 'lucide-react';

const categories = [
    { id: 1, name: 'Electronics', icon: Laptop, count: 250, slug: 'electronics' },
    { id: 2, name: 'Fashion', icon: Shirt, count: 180, slug: 'fashion' },
    { id: 3, name: 'Watches', icon: Watch, count: 90, slug: 'watches' },
    { id: 4, name: 'Audio', icon: Headphones, count: 120, slug: 'audio' },
    { id: 5, name: 'Home & Living', icon: Home, count: 200, slug: 'home' },
    { id: 6, name: 'Books', icon: Book, count: 150, slug: 'books' },
];

export default function CategoryCards() {
    return (
        <section className="section bg-[var(--surface)]">
            <div className="page-container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
                    <p className="text-[var(--text-muted)] text-lg">
                        Explore our wide range of products across different categories
                    </p>
                </div>

                <div className="grid-layout">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                to={`/products?category=${category.slug}`}
                                className="group"
                            >
                                <div className="card card-interactive text-center h-full">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--accent)] transition-colors">
                                            <Icon className="w-8 h-8 text-[var(--accent)] group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-[var(--text-muted)] text-sm">
                                            {category.count} Products
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
