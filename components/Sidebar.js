"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenu } from "@/lib/hooks/useMenu";

function MenuItem({ item }) {
    const pathname = usePathname();
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isActive = item.path && pathname === item.path;

    const [open, setOpen] = useState(
        hasChildren &&
        item.children.some((c) => c.path && pathname?.startsWith(c.path))
    );

    if (!hasChildren) {
        return (
            <li>
                <Link href={item.path || "#"} className={isActive ? "active" : ""}>
                    <i className={`bx ${item.icon} icon nav-icon`}></i>
                    <span>{item.name}</span>
                </Link>
            </li>
        );
    }

    const handleToggle = (e) => {
        e.preventDefault();
        setOpen((prev) => !prev);
    };

    return (
        <li className={open ? "mm-active" : ""}>
            <a href="#" className="has-arrow" onClick={handleToggle}>
                <i className={`bx ${item.icon} icon nav-icon`}></i>
                <span>{item.name}</span>
            </a>
            <ul className={`sub-menu ${open ? "mm-show" : "mm-collapse"}`}>
                {[...item.children]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((child) => (
                        <MenuItem key={child.id} item={child} />
                    ))}
            </ul>
        </li>
    );
}

export default function Sidebar() {
    const { menu, loading, error, refetch } = useMenu();

    return (
        <div className="vertical-menu">
            <div data-simplebar className="h-100">
                <div id="sidebar-menu">
                    <ul className="metismenu list-unstyled" id="side-menu">
                        <li className="menu-title">Menu</li>

                        {loading && (
                            <li className="px-3 py-2 text-muted small">Memuat menu...</li>
                        )}

                        {error && (
                            <li className="px-3 py-2">
                                <span className="text-danger small d-block mb-1">{error}</span>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={refetch}
                                >
                                    Coba lagi
                                </button>
                            </li>
                        )}

                        {!loading &&
                            !error &&
                            [...menu]
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                .map((item) => <MenuItem key={item.id} item={item} />)}
                    </ul>
                </div>
            </div>
        </div>
    );
}
