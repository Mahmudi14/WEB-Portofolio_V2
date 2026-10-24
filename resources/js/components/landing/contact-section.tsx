import { ArrowUpRight, ExternalLink, Github, Mail } from "lucide-react";
import { Section } from "./landing-section";
import { safeUrl } from "./landing-helpers";
import type { Profile, Social } from "./landing-types";

export default function ContactSection({ profile, socials }: {
    profile: Profile;
    socials: Social[];
}) {
    const whatsAppNumber = profile.whatsapp?.replace(/\D/g, "") ?? "";
    return (
        <Section id="contact" alternate>
            <div className="lp-contact">
                <span className="lp-eyebrow">
                    <span className="lp-pulse" />
                    MARI TERHUBUNG
                </span>
                <h2>
                    Punya ide menarik?<br />
                    <em>Mari berkolaborasi.</em>
                </h2>
                <p>
                    Terbuka untuk diskusi, kolaborasi, serta kesempatan
                    untuk membangun sesuatu yang bermanfaat bersama.
                </p>
                <div className="lp-contact__buttons">
                    {profile.email && (
                        <a href={`mailto:${profile.email}`} className="lp-button lp-button--primary">
                            <Mail size={18} /> Kirim Email
                        </a>
                    )}
                    {whatsAppNumber && (
                        <a href={`https://wa.me/${whatsAppNumber}`}
                            className="lp-button lp-button--outline" target="_blank" rel="noopener noreferrer">
                            Hubungi via WhatsApp <ArrowUpRight size={17} />
                        </a>
                    )}
                </div>
                {socials.length > 0 && (
                    <div className="lp-social-links">
                        {socials.map((social) => {
                            const href = safeUrl(social.url);
                            if (!href) return null;
                            return (
                                <a key={social.id} href={href} target="_blank" rel="noopener noreferrer">
                                    {social.platform.toLowerCase() === "github" ? (
                                        <Github size={16} />
                                    ) : <ExternalLink size={15} />}
                                    {social.name}
                                    <ArrowUpRight size={14} />
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </Section>
    );
}
