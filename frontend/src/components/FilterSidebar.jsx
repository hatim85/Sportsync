import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaTimes } from 'react-icons/fa';

const FilterSidebar = ({ selectedFilters, onFilterChange, onClearAll, currentCount }) => {
    const [openSections, setOpenSections] = useState({
        'Equipment Types': true,
        'Price Range': true
    });

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getAllcategory`);
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : (data?.categories || []));
            } catch (err) {
                console.error("Error fetching categories for filter:", err);
            }
        };
        fetchCategories();
    }, []);

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const priceRanges = [
        { id: 'p1', name: 'Under ₹500', min: 0, max: 500 },
        { id: 'p2', name: '₹500 - ₹1,000', min: 500, max: 1000 },
        { id: 'p3', name: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
        { id: 'p4', name: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
        { id: 'p5', name: 'Over ₹5,000', min: 5000, max: 1000000 },
    ];

    const totalItems = categories.reduce((acc, cat) => acc + (Array.isArray(cat.products) ? cat.products.length : 0), 0);

    const filterSections = [
        { 
            name: 'Equipment Types', 
            type: 'category', 
            data: [
                { id: 'all', name: 'All Collection', type: 'category', count: totalItems },
                ...categories.filter(c => c && c.name).map(c => ({ 
                    id: c._id, 
                    name: c.name, 
                    type: 'category', 
                    count: Array.isArray(c.products) ? c.products.length : 0 
                }))
            ] 
        },
        { name: 'Price Range', type: 'price', data: priceRanges.map(p => ({ ...p, type: 'price' })) }
    ];

    return (
        <aside className="w-full bg-card border border-border rounded-lg p-5 md:p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-foreground">Filters</h2>
                <button 
                    onClick={onClearAll}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline uppercase tracking-widest font-semibold"
                >
                    Clear All
                </button>
            </div>

            <div className="mb-8 pl-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold">
                    Showing <span className="text-foreground font-extrabold">{currentCount || 0}</span> Results
                </p>
            </div>

            {/* Selected Filter Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {selectedFilters.map(filter => (
                    <div 
                        key={filter.id} 
                        className="bg-secondary flex items-center px-3 py-1.5 rounded-sm border border-border group animate-fadeIn"
                    >
                        <span className="text-[11px] text-foreground font-medium">{filter.name}</span>
                        <button 
                            onClick={() => onFilterChange(filter)}
                            className="ml-2 text-muted-foreground group-hover:text-foreground transition-colors"
                        >
                            <FaTimes className="h-2 w-2" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="space-y-1">
                {filterSections.map((section) => (
                    <div key={section.name} className="border-b border-border py-4">
                        <button 
                            onClick={() => toggleSection(section.name)}
                            className="flex justify-between items-center w-full group"
                        >
                            <span className="text-sm md:text-base font-light tracking-wide text-foreground group-hover:text-foreground transition-colors">
                                {section.name}
                            </span>
                            {openSections[section.name] ? (
                                <FaMinus className="h-3 w-3 text-muted-foreground" />
                            ) : (
                                <FaPlus className="h-3 w-3 text-muted-foreground" />
                            )}
                        </button>

                        {openSections[section.name] && (
                            <div className="mt-4 space-y-3 pl-1">
                                {section.data.map((item) => {
                                    const isChecked = selectedFilters.some(
                                        (sf) => String(sf.id) === String(item.id)
                                    );
                                    return (
                                    <label key={item.id} className="flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isChecked}
                                            onChange={() => onFilterChange(item)}
                                        />
                                        <div
                                            className={`w-4 h-4 shrink-0 border rounded-sm flex items-center justify-center transition-all ${
                                                isChecked
                                                    ? 'bg-primary border-primary'
                                                    : 'bg-card border-border group-hover:border-primary/50'
                                            }`}
                                            aria-hidden
                                        >
                                            {isChecked && (
                                                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className={`ml-3 flex items-center text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${isChecked ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                            <span>{item.name}</span>
                                            {item.count !== undefined && <span className="ml-1 opacity-70">({item.count})</span>}
                                        </div>
                                    </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default FilterSidebar;
