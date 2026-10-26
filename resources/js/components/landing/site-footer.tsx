import { ArrowUp } from "lucide-react";

type Props = {
    name: string;
};

export default function SiteFooter({ name }: Props) {
    const year = new Date().getFullYear();

    return (
        <footer className="lp-footer sc-footer">
            <div className="lp-container lp-footer__inner sc-footer__inner">
                <div className="sc-footer__identity">
                    <a
                        href="#home"
                        className="lp-footer__brand sc-footer__brand"
                        aria-label="Kembali ke beranda"
                    >
                        {name}
                        <span>.</span>
                    </a>

                    <span className="sc-footer__label">PERSONAL PORTFOLIO</span>
                </div>

                <p className="sc-footer__copyright">
                    © {year} {name}. Dibangun dengan dedikasi dan kreativitas.
                </p>

                <a
                    href="#home"
                    className="sc-footer__back"
                    aria-label="Kembali ke atas halaman"
                >
                    <span>Kembali ke atas</span>

                    <span className="sc-footer__back-icon">
                        <ArrowUp
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />
                    </span>
                </a>
            </div>
        </footer>
    );
}
