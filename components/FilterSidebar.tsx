'use client';

import { X } from 'lucide-react';

interface FilterSidebarProps {
    filters: {
        flowerTypes: string[];
        priceRange: { min: number; max: number };
    };
    options: {
        flowerTypes: string[];
    };
    onFilterChange: (newFilters: any) => void;
    isMobileOpen: boolean;
    onClose: () => void;
}

export default function FilterSidebar({ filters, options, onFilterChange, isMobileOpen, onClose }: FilterSidebarProps) {
    const handleTypeChange = (type: string) => {
        const newTypes = filters.flowerTypes.includes(type)
            ? filters.flowerTypes.filter((t) => t !== type)
            : [...filters.flowerTypes, type];
        onFilterChange({ ...filters, flowerTypes: newTypes });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
        const value = parseInt(e.target.value) || 0;
        onFilterChange({
            ...filters,
            priceRange: { ...filters.priceRange, [type]: value },
        });
    };

    const sidebarContent = (
        <div className="flex flex-col gap-8">
            {/* Flower Types */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-serif">Flower Type</h3>
                <div className="space-y-3">
                    {options.flowerTypes.length > 0 ? options.flowerTypes.map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.flowerTypes.includes(type)}
                                onChange={() => handleTypeChange(type)}
                                className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                            />
                            <span className="text-gray-600 group-hover:text-pink-600 transition-colors capitalize tracking-wider text-sm font-medium">
                                {type}
                            </span>
                        </label>
                    )) : (
                        <p className="text-sm text-gray-400 italic">No types available</p>
                    )}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-serif">Price Range</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block uppercase tracking-tighter">Min</label>
                        <input
                            type="number"
                            value={filters.priceRange.min}
                            onChange={(e) => handlePriceChange(e, 'min')}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm"
                            placeholder="$0"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block uppercase tracking-tighter">Max</label>
                        <input
                            type="number"
                            value={filters.priceRange.max}
                            onChange={(e) => handlePriceChange(e, 'max')}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm"
                            placeholder="$1000"
                        />
                    </div>
                </div>
                <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange(e, 'max')}
                    className="w-full mt-4 accent-pink-600 cursor-pointer"
                />
            </div>

            <button
                onClick={() => onFilterChange({ flowerTypes: [], priceRange: { min: 0, max: 1000 } })}
                className="w-full py-3 text-sm font-bold text-pink-600 border border-pink-200 rounded-xl hover:bg-pink-50 transition-colors uppercase tracking-widest mt-4"
            >
                Reset All
            </button>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <div
                    className={`absolute left-0 top-0 bottom-0 w-80 bg-white p-8 transition-transform duration-300 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 font-serif">Filters</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    {sidebarContent}
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-28 self-start h-[calc(100vh-8rem)] overflow-y-auto pr-4 custom-scrollbar">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif border-b border-gray-200 pb-4">Filters</h2>
                {sidebarContent}
            </aside>
        </>
    );
}
