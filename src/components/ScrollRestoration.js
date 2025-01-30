import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollRestoration() {
    const { pathname } = useLocation();

    useEffect(() => {
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition-${pathname}`);
        
        if (savedScrollPosition) {
            window.scrollTo({
                top: parseInt(savedScrollPosition, 10),
                left: 0,
                behavior: "instant"
            });
        } else {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant"
            });; 
        }

        const handleScroll = () => {
            sessionStorage.setItem(`scrollPosition-${pathname}`, window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [pathname]);

    return null;
}