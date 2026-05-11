"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function GlobalLoader() {

    const loadingMessages = [
        "Initializing MEDORA AI...",
        "Loading fracture detection model...",
        "Analyzing pediatric wrist scans...",
        "Preparing GradCAM visualizations...",
        "Optimizing YOLO detections...",
        "Securing medical pipeline...",
        "Generating diagnostic workspace...",
        "Ready for intelligent analysis...",
    ];

    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {

        const interval = setInterval(() => {

            setMessageIndex((prev) =>
                (prev + 1) % loadingMessages.length
            );

        }, 2200);

        return () => clearInterval(interval);

    }, []);

    return (

        <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#F7F8FC] flex items-center justify-center">

            {/* BACKGROUND */}
            <div className="absolute inset-0">

                <div className="absolute inset-0 bg-gradient-to-br from-[#F7F8FC] via-white to-[#EEF2FF]" />

                {/* floating blur */}
                <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-[#6D5EF3]/10 rounded-full blur-3xl animate-floatOne" />

                <div className="absolute bottom-[-120px] right-[-100px] w-[400px] h-[400px] bg-[#8B5CF6]/10 rounded-full blur-3xl animate-floatTwo" />

                <div className="absolute top-[40%] left-[45%] w-[250px] h-[250px] bg-[#C4B5FD]/20 rounded-full blur-3xl animate-pulse" />

                {/* circles */}
                <div className="absolute inset-0 flex items-center justify-center">

                    <div className="absolute w-[650px] h-[650px] rounded-full border border-[#6D5EF3]/10 animate-spinSlow" />

                    <div className="absolute w-[500px] h-[500px] rounded-full border border-[#8B5CF6]/10 animate-spinReverse" />

                    <div className="absolute w-[350px] h-[350px] rounded-full border border-[#C4B5FD]/20 animate-spinSlow2" />

                </div>

            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center">

                {/* LOGO AREA */}
                <div className="relative mb-10">

                    {/* glowing bg */}
                    <div className="absolute inset-0 bg-[#6D5EF3]/20 blur-[80px] rounded-full animate-pulse" />

                    {/* spinning ring */}
                    <div className="absolute -inset-6 rounded-full border-2 border-[#6D5EF3]/30 border-t-[#6D5EF3] border-r-transparent animate-spinSlow" />

                    <div className="absolute -inset-12 rounded-full border border-[#A78BFA]/20 border-b-[#6D5EF3] border-l-transparent animate-spinReverse" />

                    {/* image */}
                    <div className="relative w-40 h-40 animate-floatLogo">

                        <Image
                            src="/loader.gif"
                            alt="MEDORA AI"
                            fill
                            priority
                            className="object-contain drop-shadow-[0_20px_40px_rgba(109,94,243,0.35)]"
                        />

                    </div>

                </div>

                {/* TITLE */}
                <div className="text-center mb-6">

                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#6D5EF3] to-[#8B5CF6] bg-clip-text text-transparent">
                        MEDORA AI
                    </h1>

                    <p className="mt-3 text-[#6B7280] text-lg tracking-wide">
                        Pediatric Wrist Fracture Intelligence
                    </p>

                </div>

                {/* MESSAGE */}
                <div className="h-[40px] flex items-center justify-center">

                    <p className="text-[#374151] text-lg font-medium tracking-wide animate-fadeIn">
                        {loadingMessages[messageIndex]}
                    </p>

                </div>

                {/* LOADING BAR */}
                <div className="mt-8 w-[320px] h-[8px] bg-[#E5E7EB] rounded-full overflow-hidden shadow-inner">

                    <div className="h-full rounded-full bg-gradient-to-r from-[#6D5EF3] via-[#8B5CF6] to-[#A78BFA] animate-loaderBar" />

                </div>

                {/* DOTS */}
                <div className="flex items-center gap-3 mt-8">

                    <span className="w-3 h-3 rounded-full bg-[#6D5EF3] animate-bounceDot1" />

                    <span className="w-3 h-3 rounded-full bg-[#8B5CF6] animate-bounceDot2" />

                    <span className="w-3 h-3 rounded-full bg-[#A78BFA] animate-bounceDot3" />

                </div>

                {/* VERSION */}
                <div className="mt-12 text-center">

                    <p className="text-[11px] tracking-[4px] text-[#9CA3AF] uppercase">
                        MEDORA RADIOLOGY SUITE v2.4
                    </p>

                </div>

            </div>

            <style jsx>{`

                @keyframes spinSlow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes spinReverse {
                    from {
                        transform: rotate(360deg);
                    }
                    to {
                        transform: rotate(0deg);
                    }
                }

                @keyframes floatOne {
                    0%,100% {
                        transform: translate(0px,0px);
                    }
                    50% {
                        transform: translate(40px,20px);
                    }
                }

                @keyframes floatTwo {
                    0%,100% {
                        transform: translate(0px,0px);
                    }
                    50% {
                        transform: translate(-40px,-20px);
                    }
                }

                @keyframes floatLogo {
                    0%,100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-12px);
                    }
                }

                @keyframes loaderBar {
                    0% {
                        width: 0%;
                    }
                    50% {
                        width: 75%;
                    }
                    100% {
                        width: 100%;
                    }
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0px);
                    }
                }

                @keyframes bounceDot {
                    0%,100% {
                        transform: translateY(0px);
                        opacity: 0.5;
                    }
                    50% {
                        transform: translateY(-10px);
                        opacity: 1;
                    }
                }

                .animate-spinSlow {
                    animation: spinSlow 10s linear infinite;
                }

                .animate-spinReverse {
                    animation: spinReverse 14s linear infinite;
                }

                .animate-spinSlow2 {
                    animation: spinSlow 18s linear infinite;
                }

                .animate-floatOne {
                    animation: floatOne 12s ease-in-out infinite;
                }

                .animate-floatTwo {
                    animation: floatTwo 14s ease-in-out infinite;
                }

                .animate-floatLogo {
                    animation: floatLogo 4s ease-in-out infinite;
                }

                .animate-loaderBar {
                    animation: loaderBar 3s ease-in-out infinite;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.6s ease;
                }

                .animate-bounceDot1 {
                    animation: bounceDot 1s infinite;
                }

                .animate-bounceDot2 {
                    animation: bounceDot 1s infinite 0.2s;
                }

                .animate-bounceDot3 {
                    animation: bounceDot 1s infinite 0.4s;
                }

            `}</style>

        </div>
    );
}
