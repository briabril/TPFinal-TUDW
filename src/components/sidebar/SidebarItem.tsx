"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface SidebarItemProps {
    id: string
    label: string
    icon: LucideIcon
    isActive: boolean
    isExpanded: boolean
    onClick: () => void
    title?: string
    variant?: "default" | "danger"
}

export function SidebarItem({
    id,
    label,
    icon: Icon,
    isActive,
    isExpanded,
    onClick,
    title,
    variant = "default",
}: SidebarItemProps) {

    const isDanger = variant === "danger"

    return (

        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, cursor: "pointer" }}
            whileTap={{ scale: 0.98 }}
            className={`
                w-full flex items-center rounded-lg font-medium relative
                transition-colors duration-150
                ${isExpanded ? "px-4 py-3 gap-4" : "py-3 justify-center"}
                ${isActive
                    ? "bg-(--color-primary) text-(--color-primary-contrast) hover:bg-primary/90"
                    : "text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }
            `}
            title={!isExpanded ? label : title}
        >
            <motion.div
                className="flex shrink-0"
                animate={{ scale: isActive && !isDanger ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
            >
                <Icon size={22} />
            </motion.div>

            {isExpanded && (
                <motion.span
                    className="text-base whitespace-nowrap overflow-hidden"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                >
                    {label}
                </motion.span>
            )}
        </motion.button>
    )
}
