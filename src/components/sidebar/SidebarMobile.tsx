"use client";

import { Box } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import type { NavItem } from "@/types/nav_item";
import { motion } from "framer-motion";
import { useState } from "react";
import { ShieldCheck, User } from "lucide-react"; 

type SidebarMobileProps = {
  items: NavItem[];
  isAdmin?: boolean;
  adminItems?: NavItem[];
};

export default function SidebarMobile({
  items,
  isAdmin = false,
  adminItems = [],
}: SidebarMobileProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminOpen, setAdminOpen] = useState(false);

  const handleNavigate = (item: NavItem) => {
    if (item.path) router.push(item.path);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: adminOpen ? 120 : 65,
        display: "flex",
        flexDirection: "column",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        backgroundColor: "background.paper",
        zIndex: 2000,
        transition: "height 0.25s ease",
      }}
    >
      {isAdmin && adminOpen && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            padding: "6px 0 10px 0",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path!);

            return (
              <Box
                key={item.id}
                onClick={() => handleNavigate(item)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  color: isActive ? "primary.main" : "text.secondary",
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                <Box
                  component="span"
                  sx={{
                    fontSize: 9,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Box
        sx={{
          height: 65,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {items
          .filter((item) => item.path)
          .map((item) => {
            const Icon =
              isAdmin && item.id === "profile"
                ? ShieldCheck
                : item.icon;

            const isActive = pathname.startsWith(item.path!);

            return (
              <Box
                key={item.id}
                onClick={() => handleNavigate(item)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  position: "relative",
                  color: isActive ? "primary.main" : "text.secondary",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-indicator"
                    style={{
                      position: "absolute",
                      top: -6,
                      width: 36,
                      height: 3,
                      borderRadius: 4,
                      backgroundColor:
                        "rgb(var(--mui-palette-primary-main))",
                    }}
                  />
                )}

                <Icon size={24} strokeWidth={isActive ? 2.6 : 2} />

                <Box
                  component="span"
                  sx={{
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </Box>
              </Box>
            );
          })}

        {isAdmin && (
          <Box
            onClick={() => setAdminOpen((prev) => !prev)}
            sx={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              color: adminOpen ? "primary.main" : "text.secondary",
            }}
          >
            <ShieldCheck size={24} strokeWidth={adminOpen ? 2.6 : 2} />
            <Box
              component="span"
              sx={{
                fontSize: 10,
                fontWeight: adminOpen ? 600 : 400,
              }}
            >
              Admin
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
