import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HeroBanner() {
    return (
        <section className="relative bg-gradient-to-br from-[var(--primary)] to-[#334155] text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="page-container relative z-10">
                <div className="py-20 md:py-32 max-w-3xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        New Arrivals Every Week
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Discover Amazing Products at Unbeatable Prices
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                        Shop the latest trends, enjoy fast shipping, and experience exceptional customer service. Your perfect purchase is just a click away.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/products" className="btn btn-accent btn-lg">
                            Shop Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/products" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-[var(--primary)]">
                            Browse Categories
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-8 mt-12 pt-12 border-t border-white/20">
                        <div>
                            <div className="text-3xl font-bold mb-1">10,000+</div>
                            <div className="text-gray-300 text-sm">Products</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">50,000+</div>
                            <div className="text-gray-300 text-sm">Happy Customers</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">4.8/5</div>
                            <div className="text-gray-300 text-sm">Average Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Shape */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mb-48" />
        </section>
    );
}
