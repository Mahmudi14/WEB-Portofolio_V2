import { ArrowUpRight } from "lucide-react";

export default function SiteFooter({ name }: { name: string }) {
    return (
        <footer className="lp-footer">
            <div className="lp-container lp-footer__inner">
                <a href="#home" className="lp-footer__brand">
                    {name}<span>.</span>
                </a>
                <p>
                    © {new Date().getFullYear()} {name}. Dibangun dengan dedikasi dan kreativitas.
                </p>
                <a href="#home">
                    Kembali ke atas <ArrowUpRight size={15} />
                </a>
            </div>
        </footer>
    );
}
