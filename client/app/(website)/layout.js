import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopMarquee from "@/components/TopMarquee";
import WebsiteLoaderWrapper from "@/components/ui/WebsiteLoaderWrapper";

export default function WebsiteLayout({ children }) {
    return (
        <div className="relative min-h-screen bg-white">
            <WebsiteLoaderWrapper>
                <TopMarquee />
                <Navbar />
                <main className="pt-20">
                    {children}
                </main>
                <Footer />
            </WebsiteLoaderWrapper>
        </div>
    );
}
