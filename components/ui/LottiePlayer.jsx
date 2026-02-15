"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const LottiePlayer = ({ animationData, className, loop = true }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className={className} />; // Skeleton placeholder

    return (
        <div className={className}>
            <Lottie animationData={animationData} loop={loop} />
        </div>
    );
};

export default LottiePlayer;
