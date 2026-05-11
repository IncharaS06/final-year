"use client";

export default function StatCard({
    title,
    value,
    sub,
    icon,
    trend,
    trendValue,
}: {
    title: string;
    value: string;
    sub?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
}) {

    const trendColors = {
        up: "text-green-700 bg-green-100 border-green-200",
        down: "text-red-700 bg-red-100 border-red-200",
        neutral: "text-gray-700 bg-gray-100 border-gray-200",
    };

    return (

        <div
            className="
                relative overflow-hidden
                rounded-3xl
                bg-white/90
                backdrop-blur-xl
                border border-[#D7D3FF]/40
                shadow-lg shadow-[#7C6EE6]/5
                p-6
                transition-all duration-500
                hover:shadow-2xl
                hover:shadow-[#7C6EE6]/10
                hover:-translate-y-1
                hover:border-[#7C6EE6]/40
                group
            "
        >

            {/* animated glow */}
            <div
                className="
                    absolute top-0 right-0 w-40 h-40
                    bg-[#7C6EE6]/5 rounded-full blur-3xl
                    opacity-0 group-hover:opacity-100
                    transition duration-700
                "
            />

            {/* top */}
            <div className="relative z-10 flex items-start justify-between">

                <div>

                    <p
                        className="
                            text-xs uppercase tracking-[3px]
                            text-[#6F6A8A]/70
                            font-semibold
                        "
                    >
                        {title}
                    </p>

                </div>

                {icon && (

                    <div
                        className="
                            w-12 h-12 rounded-2xl
                            bg-gradient-to-br
                            from-[#7C6EE6]/10
                            to-[#A78BFA]/10
                            flex items-center justify-center
                            text-[#7C6EE6]
                            group-hover:scale-110
                            transition duration-500
                        "
                    >
                        {icon}
                    </div>

                )}

            </div>

            {/* VALUE */}
            <div className="relative z-10 mt-5 flex items-end gap-3">

                <h2
                    className="
                        text-5xl font-black tracking-tight
                        bg-gradient-to-r
                        from-[#2E2E3A]
                        via-[#4B4B68]
                        to-[#7C6EE6]
                        bg-clip-text text-transparent
                    "
                >
                    {value}
                </h2>

                {trend && trendValue && (

                    <span
                        className={`
                            px-3 py-1 rounded-full
                            text-xs font-bold
                            border
                            flex items-center gap-1
                            mb-2
                            ${trendColors[trend]}
                        `}
                    >

                        {trend === "up" && "↑"}

                        {trend === "down" && "↓"}

                        {trend === "neutral" && "→"}

                        {trendValue}

                    </span>

                )}

            </div>

            {/* SUB */}
            {sub && (

                <div className="relative z-10 mt-3 flex items-center gap-2">

                    <div className="w-2 h-2 rounded-full bg-[#7C6EE6] animate-pulse" />

                    <p className="text-sm text-[#6F6A8A]/80 font-medium">
                        {sub}
                    </p>

                </div>

            )}

            {/* bottom progress */}
            <div
                className="
                    relative z-10 mt-6
                    h-2 rounded-full overflow-hidden
                    bg-[#EEF2FF]
                "
            >

                <div
                    className="
                        h-full w-[78%]
                        rounded-full
                        bg-gradient-to-r
                        from-[#7C6EE6]
                        via-[#8B5CF6]
                        to-[#C084FC]
                        animate-pulse
                    "
                />

            </div>

            {/* shine */}
            <div
                className="
                    absolute inset-0 opacity-0
                    group-hover:opacity-100
                    transition duration-700
                    pointer-events-none
                "
            >
                <div
                    className="
                        absolute top-0 left-[-100%]
                        w-[50%] h-full
                        bg-gradient-to-r
                        from-transparent
                        via-white/40
                        to-transparent
                        skew-x-12
                        animate-shine
                    "
                />
            </div>

            <style jsx>{`
                @keyframes shine {
                    0% {
                        left: -100%;
                    }

                    100% {
                        left: 150%;
                    }
                }

                .animate-shine {
                    animation: shine 2s ease-in-out infinite;
                }
            `}</style>

        </div>
    );
}
