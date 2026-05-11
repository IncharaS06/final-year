"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {

    const [isScrolled, setIsScrolled] = useState(false);

    const pathname = usePathname();

    useEffect(() => {

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll
            );

    }, []);

    return (

        <header
            className={`
                sticky top-0 z-50 w-full
                transition-all duration-500
                ${
                    isScrolled
                        ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-[#D7D3FF]/40"
                        : "bg-white/60 backdrop-blur-md border-b border-[#D7D3FF]/20"
                }
            `}
        >

            {/* animated top glow */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#7C6EE6] to-transparent opacity-70" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="h-20 flex items-center justify-between">

                    {/* LEFT */}
                    <Link
                        href="/"
                        className="flex items-center gap-4 group"
                    >

                        {/* LOGO */}
                        <div className="relative">

                            {/* glow */}
                            <div className="absolute inset-0 bg-[#7C6EE6]/20 rounded-2xl blur-xl group-hover:bg-[#7C6EE6]/30 transition-all duration-500" />

                            {/* spinning border */}
                            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#7C6EE6] via-[#A78BFA] to-[#7C6EE6] opacity-0 group-hover:opacity-100 blur-sm transition duration-500" />

                            {/* logo box */}
                            <div
                                className="
                                    relative w-14 h-14 rounded-2xl
                                    bg-gradient-to-br from-[#7C6EE6] to-[#6B5DDA]
                                    flex items-center justify-center
                                    shadow-lg shadow-[#7C6EE6]/25
                                    transition-all duration-500
                                    group-hover:scale-105
                                "
                            >

                                <img
                                    src="/logo.png"
                                    alt="MEDORA"
                                    className="
                                        w-8 h-8 object-contain
                                        drop-shadow-md
                                    "
                                />

                            </div>

                        </div>

                        {/* TEXT */}
                        <div className="flex flex-col">

                            <span
                                className="
                                    text-3xl font-black tracking-tight
                                    bg-gradient-to-r from-[#7C6EE6] via-[#8B5CF6] to-[#6B5DDA]
                                    bg-clip-text text-transparent
                                "
                            >
                                MEDORA AI
                            </span>

                            <span
                                className="
                                    text-[11px] uppercase tracking-[4px]
                                    text-[#6F6A8A]/80
                                    font-medium
                                    -mt-1
                                "
                            >
                                Pediatric Wrist Fracture Intelligence
                            </span>

                        </div>

                    </Link>

                    {/* RIGHT STATUS */}
                    <div className="hidden md:flex items-center gap-3">

                        <div
                            className="
                                px-4 py-2 rounded-full
                                bg-gradient-to-r from-[#EEF2FF] to-[#F8F7FF]
                                border border-[#C8C3FF]/30
                                flex items-center gap-2
                                shadow-sm
                            "
                        >

                            <span className="relative flex h-3 w-3">

                                <span
                                    className="
                                        animate-ping absolute inline-flex
                                        h-full w-full rounded-full
                                        bg-green-400 opacity-75
                                    "
                                />

                                <span
                                    className="
                                        relative inline-flex rounded-full
                                        h-3 w-3 bg-green-500
                                    "
                                />

                            </span>

                            <span className="text-sm font-medium text-[#2E2E3A]">
                                AI System Online
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </header>
    );
}
