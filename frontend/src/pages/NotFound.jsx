import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="page-container max-w-2xl text-center py-12">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-[var(--primary)] mb-4">404</h1>
                    <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                    <p className="text-[var(--text-muted)] text-lg mb-8">
                        Sorry, the page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/" className="btn btn-primary">
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                    <Link to="/products" className="btn btn-outline">
                        <Search className="w-5 h-5" />
                        Browse Products
                    </Link>
                </div>

                <div className="mt-12 text-sm text-[var(--text-muted)]">
                    <p>Need help? Check out our:</p>
                    <div className="flex gap-4 justify-center mt-2">
                        <Link to="/products" className="hover:text-[var(--accent)] transition-colors">
                            Products
                        </Link>
                        <span>•</span>
                        <Link to="/login" className="hover:text-[var(--accent)] transition-colors">
                            Login
                        </Link>
                        <span>•</span>
                        <Link to="/" className="hover:text-[var(--accent)] transition-colors">
                            Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
