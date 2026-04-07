import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaChartLine, FaClock, FaEllipsisV, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import type { Dashboard } from '@dashboard/shared-types';

interface DashboardCardProps {
    dashboard: Dashboard;
    onDelete: (id: string) => void;
}

export default function DashboardCard({ dashboard, onDelete }: DashboardCardProps) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        router.push(`/design/view/${dashboard.id}`);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        router.push(`/design/${dashboard.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        onDelete(dashboard.id);
    };

    return (
        <div className="group relative bg-background border rounded-lg hover:shadow-md transition border-border h-full flex flex-col">
            <Link
                href={`/design/${dashboard.id}`}
                className="absolute inset-0 z-0"
                aria-label={`Open ${dashboard.name}`}
            />

            <div className="p-6 flex flex-col h-full pointer-events-none">
                <div className="flex items-start justify-between mb-4 pointer-events-auto">
                    <div className="p-3 bg-muted rounded-lg text-foreground mb-4">
                        <FaChartLine size={24} />
                    </div>

                    {/* Three-dot menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={handleMenuClick}
                            className="text-muted-foreground hover:text-foreground p-2 transition-colors z-10 cursor-pointer"
                            title="More options"
                        >
                            <FaEllipsisV size={16} />
                        </button>

                        {/* Dropdown menu */}
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg border border-border z-50 overflow-hidden">
                                <button
                                    onClick={handleView}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <FaEye size={16} className="text-blue-500" />
                                    <span>View</span>
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <FaEdit size={16} className="text-green-500" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <FaTrash size={16} className="text-red-500" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2 truncate group-hover:text-foreground pointer-events-auto">
                    {dashboard.name}
                </h3>

                <div className="mt-auto flex items-center text-sm text-muted-foreground gap-2">
                    <FaClock size={12} />
                    <span>
                        Updated {dashboard.updatedAt ? formatDistanceToNow(new Date(dashboard.updatedAt), { addSuffix: true }) : 'recently'}
                    </span>
                </div>
            </div>
        </div>
    );
}
