import { Crown, Handshake, Landmark, TrendingUp } from "lucide-react";

export const COMPANY_NAME = "Living Vine Properties & Investments Ltd";

export const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
];

export const SERVICES = [
    {
        title: "Investment Schemes",
        description: "Secure real estate investment opportunities with guaranteed returns.",
        icon: TrendingUp,
        href: "/services#investment",
    },
    {
        title: "Joint Ventures",
        description: "Strategic partnerships for property development and wealth creation.",
        icon: Handshake,
        href: "/services#joint-ventures",
    },
    {
        title: "Land Acquisition",
        description: "Acquiring prime land assets for appreciation or development.",
        icon: Landmark,
        href: "/services#land-acquisition",
    },
    {
        title: "Real Estate Finance",
        description: "Equity-based financing models for robust property development.",
        icon: Crown,
        href: "/services#finance",
    },
];

export const CONTACT_INFO = {
    address: "Block 10, Flat 3, B Close, 22 Road, Festac Town, Lagos.",
    phone: "+234 803 308 8888", // Placeholder, need to check site
    email: "info@livingvineproperties.com.ng",
};
