import { Layers3, Move } from "lucide-react";
import { useEffect, useRef } from "react";

import type { KeyboardEvent, PointerEvent } from "react";

import "../../../css/hero-id-card.css";

type Props = {
    name: string;
    photoUrl: string | null;
    logoUrl: string | null;
};

type Point = {
    x: number;
    y: number;
};

type Sample = Point & {
    angle: number;
    half: number;
};

type Strap = {
    body: string;
    lattice: string;
    edgeA: string;
    edgeB: string;
    stitchA: string;
    stitchB: string;
    center: string;
    centerReversed: string;
    samples: Sample[];
};

type StrapNodes = {
    body: SVGPathElement | null;
    clip: SVGPathElement | null;
    weave: SVGPathElement | null;
    lattice: SVGPathElement | null;
    edgeA: SVGPathElement | null;
    edgeB: SVGPathElement | null;
    label: SVGPathElement | null;
    stitchA: SVGPathElement | null;
    stitchB: SVGPathElement | null;
    motifs: (SVGUseElement | null)[];
};

type PathNode = Exclude<keyof StrapNodes, "motifs">;

type Motion = {
    width: number;
    height: number;
    cardWidth: number;
    cardHeight: number;
    anchorX: number;
    anchorY: number;
    length: number;
    scale: number;
    slotY: number;
    spread: number;
    nominal: number;
    gradEnd: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    dragging: boolean;
    grabX: number;
    grabY: number;
    lastPointerTime: number;
    reducedMotion: boolean;
};

/**
 * Titik gantung (pusat slot holder) diukur dari sisi atas kartu, dalam em.
 * Nilai ini HARUS sama dengan `--slot-y` di hero-id-card.css.
 */
const SLOT_EM = 1.9;

/** Posisi ujung tali di dalam buckle, diukur dari pusat slot (px, skala 1). */
const STRAP_END_Y = 98;

const STRAP_STEPS = 36;

/** Posisi motif kawung di sepanjang tali (0 = atas, 1 = buckle). */
const MOTIF_AT = [0.66, 0.75, 0.84, 0.93] as const;

// Warna motif batik: orange terang ke orange pekat.
const INK_TOP = [255, 152, 82] as const;
const INK_BOTTOM = [255, 106, 0] as const;

const STRAPS = [
    { side: -1, key: "left", offset: "54%" },
    { side: 1, key: "right", offset: "46%" },
] as const;

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

const pointString = (point: Point) =>
    `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;

const linePath = (points: Point[]) =>
    `M ${points.map(pointString).join(" L ")}`;

const lerpPoint = (a: Point, b: Point, f: number): Point => ({
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
});

const createNodes = (): StrapNodes => ({
    body: null,
    clip: null,
    weave: null,
    lattice: null,
    edgeA: null,
    edgeB: null,
    label: null,
    stitchA: null,
    stitchB: null,
    motifs: [],
});

// Warna motif mengikuti gradasi kain (teal -> krem).
function inkColor(u: number) {
    const f = clamp((u - 0.64) / 0.2, 0, 1);

    const [r1, g1, b1] = INK_TOP;
    const [r2, g2, b2] = INK_BOTTOM;

    return `rgb(${Math.round(r1 + (r2 - r1) * f)} ${Math.round(
        g1 + (g2 - g1) * f,
    )} ${Math.round(b1 + (b2 - b1) * f)})`;
}

// Membuat satu sisi tali berupa pita poligon yang mengikuti kurva bezier.
// `bow` = lengkung ke arah luar (bertambah saat tali mengendur).
function makeStrap(
    start: Point,
    end: Point,
    side: -1 | 1,
    k: number,
    bow: number,
): Strap {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const chord = Math.max(1, Math.hypot(dx, dy));

    // Vektor tegak lurus yang mengarah ke sisi luar tali.
    const ox = (side * dy) / chord;
    const oy = (-side * dx) / chord;

    const a: Point = {
        x: start.x + dx * 0.33 + ox * bow,
        y: start.y + dy * 0.33 + oy * bow,
    };

    const b: Point = {
        x: start.x + dx * 0.67 + ox * bow,
        y: start.y + dy * 0.67 + oy * bow,
    };

    const edgeA: Point[] = [];
    const edgeB: Point[] = [];
    const center: Point[] = [];
    const samples: Sample[] = [];

    for (let i = 0; i < STRAP_STEPS; i++) {
        const t = i / (STRAP_STEPS - 1);
        const u = 1 - t;

        const x =
            u ** 3 * start.x +
            3 * u ** 2 * t * a.x +
            3 * u * t ** 2 * b.x +
            t ** 3 * end.x;

        const y =
            u ** 3 * start.y +
            3 * u ** 2 * t * a.y +
            3 * u * t ** 2 * b.y +
            t ** 3 * end.y;

        const tx =
            3 * u ** 2 * (a.x - start.x) +
            6 * u * t * (b.x - a.x) +
            3 * t ** 2 * (end.x - b.x);

        const ty =
            3 * u ** 2 * (a.y - start.y) +
            6 * u * t * (b.y - a.y) +
            3 * t ** 2 * (end.y - b.y);

        const size = Math.max(1, Math.hypot(tx, ty));
        const nx = -ty / size;
        const ny = tx / size;

        // Lebar pita menyempit halus ke arah buckle,
        // dengan sedikit riak supaya terasa seperti kain.
        const half = (14.5 - 5 * t + 0.8 * Math.sin(t * Math.PI * 2.4)) * k;

        const twist = k * Math.sin(t * Math.PI * 2 + side);

        const cx = x + nx * twist;
        const cy = y + ny * twist;

        center.push({ x: cx, y: cy });
        edgeA.push({ x: cx + nx * half, y: cy + ny * half });
        edgeB.push({ x: cx - nx * half, y: cy - ny * half });

        samples.push({
            x: cx,
            y: cy,
            half,
            angle: (Math.atan2(ty, tx) * 180) / Math.PI,
        });
    }

    const inset = (edge: Point[]) =>
        linePath(edge.map((point, i) => lerpPoint(point, center[i]!, 0.17)));

    // Garis diagonal bersilang yang mengikuti arah tali (motif lattice).
    const diamonds: string[] = [];

    for (let i = 0; i + 6 < STRAP_STEPS; i += 6) {
        diamonds.push(
            `M ${pointString(edgeA[i]!)} L ${pointString(edgeB[i + 6]!)} ` +
                `M ${pointString(edgeB[i]!)} L ${pointString(edgeA[i + 6]!)}`,
        );
    }

    return {
        body: `${linePath([...edgeA, ...edgeB.slice().reverse()])} Z`,
        lattice: diamonds.join(" "),
        edgeA: linePath(edgeA),
        edgeB: linePath(edgeB),
        stitchA: inset(edgeA),
        stitchB: inset(edgeB),
        center: linePath(center),
        centerReversed: linePath(center.slice().reverse()),
        samples,
    };
}

export default function HeroIdCard({ name, photoUrl, logoUrl }: Props) {
    const stageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const hardwareRef = useRef<SVGGElement>(null);

    const fabricGradientRef = useRef<SVGLinearGradientElement>(null);
    const inkGradientRef = useRef<SVGLinearGradientElement>(null);

    const strapsRef = useRef<StrapNodes[]>([createNodes(), createNodes()]);
    const motionRef = useRef<Motion | null>(null);

    const bind =
        (index: number, key: PathNode) => (el: SVGPathElement | null) => {
            const nodes = strapsRef.current[index];

            if (nodes) nodes[key] = el;
        };

    useEffect(() => {
        const stage = stageRef.current;
        const card = cardRef.current;
        const svg = svgRef.current;

        const navbarMount = document.querySelector<HTMLElement>(
            "[data-hero-lanyard-mount]",
        );

        const navbar = navbarMount?.closest<HTMLElement>(".lp-header");

        if (!stage || !card || !svg || !navbarMount || !navbar) {
            return;
        }

        let frame = 0;
        let lastTime = 0;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        const resize = () => {
            const bounds = stage.getBoundingClientRect();
            const navbarBounds = navbar.getBoundingClientRect();

            if (!bounds.width || !bounds.height) return;

            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;

            const unit = parseFloat(getComputedStyle(card).fontSize) || 10;

            const scale = unit / 10;
            const slotY = unit * SLOT_EM;

            const { width, height } = bounds;

            const spread = Math.min(66 * scale, width * 0.18);

            // Sejajarkan pengait Navbar dengan
            // bagian tengah panggung ID card.
            const mountCenterX = bounds.left + width / 2;

            navbarMount.style.left = `${mountCenterX - navbarBounds.left}px`;

            navbarMount.style.setProperty("--lp-lanyard-spread", `${spread}px`);

            const mountBounds = navbarMount.getBoundingClientRect();

            // Posisi anchor diambil dari pengait asli
            // di Navbar, bukan dari titik lokal Hero.
            const anchorX =
                mountBounds.left + mountBounds.width / 2 - bounds.left;

            const anchorY = mountBounds.bottom - bounds.top;

            // Ruang yang tersedia dari Navbar
            // sampai bagian bawah layar.
            const availableViewportLength =
                window.innerHeight -
                mountBounds.bottom -
                cardHeight +
                slotY -
                55;

            // Pastikan kartu tidak keluar
            // dari batas bawah area Hero.
            const availableStageLength =
                height - anchorY - cardHeight + slotY - 40;

            // Panjang ideal tali.
            // Pada HP sedikit lebih pendek.
            const preferredLength = window.innerWidth <= 600 ? 195 : 225;

            // Panjang tali dibatasi oleh
            // ruang layar dan ukuran kartu.
            const length = Math.max(
                70,
                Math.min(
                    preferredLength,
                    availableViewportLength,
                    availableStageLength,
                ),
            );

            // Posisi ujung pita pada buckle.
            const restEndY = anchorY + length - STRAP_END_Y * scale;

            const nominal = Math.hypot(spread, restEndY - anchorY);

            const gradEnd = Math.max(80, restEndY);

            svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

            // Gradasi kain dimulai tepat di Navbar.
            fabricGradientRef.current?.setAttribute("y1", String(anchorY));

            fabricGradientRef.current?.setAttribute("y2", String(restEndY));

            inkGradientRef.current?.setAttribute("y1", String(anchorY));

            inkGradientRef.current?.setAttribute("y2", String(restEndY));

            const layout = {
                width,
                height,
                cardWidth,
                cardHeight,
                anchorX,
                anchorY,
                length,
                scale,
                slotY,
                spread,
                nominal,
                gradEnd,
            };

            const old = motionRef.current;

            if (!old) {
                motionRef.current = {
                    ...layout,

                    x: reduceMotion
                        ? anchorX
                        : anchorX - Math.min(45, length * 0.25),

                    y: reduceMotion ? anchorY + length : -cardHeight - 40,

                    vx: 0,
                    vy: 0,
                    angle: 0,
                    dragging: false,
                    grabX: 0,
                    grabY: 0,
                    lastPointerTime: 0,
                    reducedMotion: reduceMotion,
                };
            } else {
                const ratioX = (old.x - old.anchorX) / Math.max(old.length, 1);

                const ratioY = (old.y - old.anchorY) / Math.max(old.length, 1);

                Object.assign(old, layout);

                old.x = anchorX + ratioX * length;
                old.y = anchorY + ratioY * length;
            }
        };

        // ==========================================
        // RESPONSIVE SCROLL FADE
        // Desktop: fade sebelum About.
        // Mobile: fade cepat setelah scroll.
        // ==========================================

        const syncScrollEffects = () => {
            const state = motionRef.current;

            if (!state) return;

            const hero = stage.closest<HTMLElement>(".lp-hero");

            const about = document.getElementById("about");

            if (!hero) return;

            const stageBounds = stage.getBoundingClientRect();
            const mountBounds = navbarMount.getBoundingClientRect();

            const heroBounds = hero.getBoundingClientRect();

            // ======================================
            // 1. SYNC ANCHOR DENGAN NAVBAR
            // ======================================

            const nextX =
                mountBounds.left + mountBounds.width / 2 - stageBounds.left;

            const nextY = mountBounds.bottom - stageBounds.top;

            const deltaX = nextX - state.anchorX;
            const deltaY = nextY - state.anchorY;

            state.anchorX = nextX;
            state.anchorY = nextY;

            // Pertahankan posisi layar kartu
            // ketika Navbar menjadi sticky.
            state.x += deltaX;
            state.y += deltaY;

            // ======================================
            // 2. UPDATE GRADASI LANYARD
            // ======================================

            const endY = nextY + state.length - STRAP_END_Y * state.scale;

            state.gradEnd = Math.max(80, endY);

            fabricGradientRef.current?.setAttribute("y1", String(nextY));

            fabricGradientRef.current?.setAttribute("y2", String(endY));

            inkGradientRef.current?.setAttribute("y1", String(nextY));

            inkGradientRef.current?.setAttribute("y2", String(endY));

            // ======================================
            // 3. HITUNG OPACITY RESPONSIVE
            // ======================================

            const isMobile = window.innerWidth <= 900;

            let opacity = 1;

            if (isMobile) {
                // MOBILE
                // Hitung jarak scroll dari awal Hero,
                // termasuk ketika URL dibuka dengan hash.

                const heroDocumentTop = heroBounds.top + window.scrollY;

                const scrollDistance = Math.max(
                    0,
                    window.scrollY -
                        Math.max(0, heroDocumentTop - navbar.offsetHeight),
                );

                // Mulai memudar hampir langsung.
                // Hilang seluruhnya sekitar 190px.
                const fadeStart = 6;
                const fadeEnd = 190;

                const progress = clamp(
                    (scrollDistance - fadeStart) / (fadeEnd - fadeStart),
                    0,
                    1,
                );

                // Memudar cepat di awal, kemudian
                // perlahan mencapai transparan penuh.
                opacity = Math.pow(1 - progress, 1.8);
            } else {
                // DESKTOP / LAPTOP
                // Kartu tetap terlihat di Hero,
                // tetapi memudar sebelum About
                // bergerak ke belakang kartu.

                // Perkiraan batas bawah kartu pada
                // posisi gantung saat diam.
                const restingCardBottom =
                    mountBounds.bottom +
                    state.length -
                    state.slotY +
                    state.cardHeight;

                const aboutTop =
                    about?.getBoundingClientRect().top ?? heroBounds.bottom;

                // Fade dimulai saat About masih
                // 220px di bawah batas kartu.
                const fadeStartAt = restingCardBottom + 220;

                // Hilang ketika About masih
                // 45px di bawah batas kartu.
                const fadeEndAt = restingCardBottom + 45;

                const progress = clamp(
                    (fadeStartAt - aboutTop) / (fadeStartAt - fadeEndAt),
                    0,
                    1,
                );

                // Smoothstep: lembut di awal dan akhir.
                const eased = progress * progress * (3 - 2 * progress);

                opacity = 1 - eased;
            }

            // ======================================
            // 4. BATAS AKHIR SECTION HERO
            // ======================================

            // Jangan biarkan ID card muncul
            // setelah Hero sepenuhnya dilewati.
            if (heroBounds.bottom <= mountBounds.bottom + 80) {
                opacity = 0;
            }

            opacity = clamp(opacity, 0, 1);

            // ======================================
            // 5. TERAPKAN FADE KE SELURUH ID CARD
            // ======================================

            const fadeValue = opacity.toFixed(3);

            stage.style.setProperty("--lp-scroll-opacity", fadeValue);

            // Pengait Navbar memudar bersama lanyard.
            navbarMount.style.setProperty("--lp-scroll-opacity", fadeValue);

            const hidden = opacity <= 0.015;

            stage.classList.toggle("lp-id-stage--out-of-view", hidden);

            navbarMount.classList.toggle(
                "lp-header__lanyard-mount--hidden",
                hidden,
            );

            // Saat transparan, card tidak menghalangi
            // interaksi elemen di belakangnya.
            if (opacity <= 0.06) {
                stage.style.pointerEvents = "none";
            } else {
                stage.style.removeProperty("pointer-events");
            }
        };

        const draw = (state: Motion) => {
            const k = state.scale;

            const rad = (state.angle * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            card.style.transform =
                `translate3d(${state.x - state.cardWidth / 2}px, ` +
                `${state.y - state.slotY}px, 0) rotate(${state.angle}deg)`;

            // Pantulan plastik bening bergeser mengikuti ayunan.
            card.style.setProperty(
                "--sheen",
                `${(50 - state.angle * 4).toFixed(1)}%`,
            );

            card.style.opacity = "1";

            STRAPS.forEach(({ side }, index) => {
                const nodes = strapsRef.current[index];

                if (!nodes) return;

                const start: Point = {
                    x: state.anchorX + side * state.spread,
                    y: state.anchorY,
                };

                // Dua tali bertemu di dalam buckle (koordinat lokal kartu).
                const lx = side * 4 * k;
                const ly = -STRAP_END_Y * k;

                const end: Point = {
                    x: state.x + lx * cos - ly * sin,
                    y: state.y + lx * sin + ly * cos,
                };

                // Saat tali memendek, kain melengkung keluar (kendur).
                const chord = Math.hypot(end.x - start.x, end.y - start.y);
                const slack = Math.max(0, state.nominal - chord);
                const bow = (6 + Math.min(32, slack * 0.45)) * k;

                const strap = makeStrap(start, end, side, k, bow);

                nodes.body?.setAttribute("d", strap.body);
                nodes.clip?.setAttribute("d", strap.body);
                nodes.weave?.setAttribute("d", strap.body);
                nodes.lattice?.setAttribute("d", strap.lattice);
                nodes.edgeA?.setAttribute("d", strap.edgeA);
                nodes.edgeB?.setAttribute("d", strap.edgeB);
                nodes.stitchA?.setAttribute("d", strap.stitchA);
                nodes.stitchB?.setAttribute("d", strap.stitchB);

                // Sisi kiri dibaca dari bawah ke atas, sisi kanan dari
                // atas ke bawah (seperti lanyard cetak sungguhan).
                nodes.label?.setAttribute(
                    "d",
                    side === -1 ? strap.centerReversed : strap.center,
                );

                MOTIF_AT.forEach((t, j) => {
                    const sample =
                        strap.samples[Math.round(t * (STRAP_STEPS - 1))];

                    const node = nodes.motifs[j];

                    if (!sample || !node) return;

                    const s = (sample.half / 15) * 0.74;

                    node.setAttribute(
                        "transform",
                        `translate(${sample.x.toFixed(2)} ${sample.y.toFixed(2)}) ` +
                            `rotate(${(sample.angle - 90).toFixed(2)}) ` +
                            `scale(${s.toFixed(3)})`,
                    );

                    node.style.color = inkColor(sample.y / state.gradEnd);
                });
            });

            hardwareRef.current?.setAttribute(
                "transform",
                `translate(${state.x.toFixed(2)} ${state.y.toFixed(2)}) ` +
                    `rotate(${state.angle.toFixed(2)}) scale(${k})`,
            );
        };

        const animate = (now: number) => {
            const state = motionRef.current;

            if (!state) {
                frame = requestAnimationFrame(animate);
                return;
            }

            const dt = lastTime
                ? clamp((now - lastTime) / 1000, 0.001, 0.032)
                : 1 / 60;

            lastTime = now;

            if (!state.dragging) {
                if (state.reducedMotion) {
                    state.x = state.anchorX;
                    state.y = state.anchorY + state.length;

                    state.vx = 0;
                    state.vy = 0;
                } else {
                    // Gravitasi dan redaman.
                    state.vy += 2150 * dt;

                    const friction = Math.exp(-0.88 * dt);

                    state.vx *= friction;
                    state.vy *= friction;

                    state.x += state.vx * dt;
                    state.y += state.vy * dt;

                    // Kartu jatuh hingga lanyard mencapai panjang maksimal.
                    if (state.y > state.anchorY) {
                        const dx = state.x - state.anchorX;
                        const dy = state.y - state.anchorY;

                        const distance = Math.hypot(dx, dy);

                        if (distance > state.length) {
                            const nx = dx / distance;
                            const ny = dy / distance;

                            state.x = state.anchorX + nx * state.length;
                            state.y = state.anchorY + ny * state.length;

                            const radial = state.vx * nx + state.vy * ny;

                            if (radial > 0) {
                                state.vx -= radial * nx;
                                state.vy -= radial * ny;
                            }
                        }
                    }
                }
            }

            const lean =
                (-Math.atan2(
                    state.x - state.anchorX,
                    Math.max(45, state.y - state.anchorY),
                ) *
                    180) /
                Math.PI;

            const desiredAngle = state.reducedMotion
                ? 0
                : clamp(lean * 0.42, -12, 12);

            state.angle += (desiredAngle - state.angle) * Math.min(1, dt * 7.5);

            draw(state);

            frame = requestAnimationFrame(animate);
        };

        resize();
        // ==========================================
        // INITIALIZE
        // ==========================================

        const onResize = () => {
            resize();
            syncScrollEffects();
        };

        onResize();

        const observer = new ResizeObserver(onResize);

        observer.observe(stage);
        observer.observe(card);
        observer.observe(navbar);

        // Cukup satu event scroll untuk
        // posisi anchor dan opacity.
        window.addEventListener("scroll", syncScrollEffects, { passive: true });

        window.addEventListener("resize", onResize);

        frame = requestAnimationFrame(animate);

        // ==========================================
        // CLEANUP
        // ==========================================

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();

            window.removeEventListener("scroll", syncScrollEffects);

            window.removeEventListener("resize", onResize);

            stage.style.removeProperty("--lp-scroll-opacity");

            stage.style.removeProperty("pointer-events");

            navbarMount.style.removeProperty("--lp-scroll-opacity");

            stage.classList.remove("lp-id-stage--out-of-view");

            navbarMount.classList.remove("lp-header__lanyard-mount--hidden");

            motionRef.current = null;
        };
    }, []);

    function pointerDown(event: PointerEvent<HTMLElement>) {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        const state = motionRef.current;

        if (!state || !stageRef.current) return;

        const rect = stageRef.current.getBoundingClientRect();

        state.dragging = true;

        state.grabX = event.clientX - rect.left - state.x;
        state.grabY = event.clientY - rect.top - state.y;

        state.lastPointerTime = performance.now();

        state.vx = 0;
        state.vy = 0;

        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.classList.add("lp-id-card--dragging");

        event.preventDefault();
    }

    function pointerMove(event: PointerEvent<HTMLElement>) {
        const state = motionRef.current;

        if (!state?.dragging || !stageRef.current) {
            return;
        }

        const rect = stageRef.current.getBoundingClientRect();

        const margin = state.cardWidth / 2 + 18;

        const x = clamp(
            event.clientX - rect.left - state.grabX,
            margin,
            state.width - margin,
        );

        const y = clamp(
            event.clientY - rect.top - state.grabY,
            state.anchorY + 24,
            state.anchorY + state.length,
        );

        const dx = x - state.anchorX;
        const dy = y - state.anchorY;

        const distance = Math.hypot(dx, dy);

        const scale = distance > state.length ? state.length / distance : 1;

        const px = state.anchorX + dx * scale;
        const py = state.anchorY + dy * scale;

        const now = performance.now();

        const seconds = Math.max((now - state.lastPointerTime) / 1000, 0.016);

        state.vx = clamp((px - state.x) / seconds, -850, 850);
        state.vy = clamp((py - state.y) / seconds, -850, 850);

        state.x = px;
        state.y = py;
        state.lastPointerTime = now;
    }

    function pointerEnd(event: PointerEvent<HTMLElement>) {
        const state = motionRef.current;

        if (!state?.dragging) return;

        state.dragging = false;

        state.vx *= 0.55;
        state.vy *= 0.55;

        event.currentTarget.classList.remove("lp-id-card--dragging");

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }

    function keyDown(event: KeyboardEvent<HTMLElement>) {
        const state = motionRef.current;

        if (!state) return;

        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();

            state.vx += event.key === "ArrowLeft" ? -220 : 220;
        }

        if (event.key === "Home") {
            event.preventDefault();

            state.x = state.anchorX;
            state.y = state.anchorY + state.length;

            state.vx = 0;
            state.vy = 0;
        }
    }

    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? "")
        .join("")
        .toUpperCase();

    // Teks cetak di lanyard (seperti "CUSTOM NAMA" pada lanyard asli).
    // Nama panjang dipersingkat jadi kata pertama agar muat di tali.
    const fullName = name.trim().toUpperCase();

    const lanyardText = "MHMD • PORTOFOLIO";

    return (
        <div ref={stageRef} className="lp-id-stage">
            <div className="lp-id-stage__glow" />

            {/* ==========================================
                LANYARD BATIK + HARDWARE (SVG)
                Ganti warna kain di gradient "lp-lny-fabric",
                warna motif di gradient "lp-lny-ink".
            ========================================== */}

            <svg
                ref={svgRef}
                className="lp-id-fabric"
                aria-hidden="true"
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Kain: teal pekat di atas, memudar ke krem di bawah */}
                    {/* Black textile with a controlled burnt-orange finish */}
                    <linearGradient
                        ref={fabricGradientRef}
                        id="lp-lny-fabric"
                        gradientUnits="userSpaceOnUse"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="220"
                    >
                        <stop offset="0" stopColor="#08090B" />
                        <stop offset=".18" stopColor="#101114" />
                        <stop offset=".42" stopColor="#17181C" />
                        <stop offset=".65" stopColor="#211915" />
                        <stop offset=".84" stopColor="#49220F" />
                        <stop offset="1" stopColor="#A74410" />
                    </linearGradient>

                    {/* Tinta cetak: krem di atas teal, emas di atas krem */}
                    {/* Orange ink for the woven strap details */}
                    <linearGradient
                        ref={inkGradientRef}
                        id="lp-lny-ink"
                        gradientUnits="userSpaceOnUse"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="220"
                    >
                        <stop offset="0" stopColor="#FFB27D" />
                        <stop offset=".55" stopColor="#FF8A38" />
                        <stop offset="1" stopColor="#FF6A00" />
                    </linearGradient>

                    {/* Serat anyaman halus */}
                    <pattern
                        id="lp-lny-weave"
                        patternUnits="userSpaceOnUse"
                        width="4"
                        height="4"
                        patternTransform="rotate(45)"
                    >
                        <path
                            d="M0 0 H4"
                            stroke="#fff"
                            strokeWidth=".7"
                            opacity=".28"
                        />
                        <path
                            d="M0 2 H4"
                            stroke="#000"
                            strokeWidth=".7"
                            opacity=".14"
                        />
                    </pattern>

                    <linearGradient
                        id="lp-lny-metal"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <stop offset="0" stopColor="#6d7078" />
                        <stop offset=".26" stopColor="#fafafa" />
                        <stop offset=".54" stopColor="#a3a9b2" />
                        <stop offset=".77" stopColor="#f4f5f6" />
                        <stop offset="1" stopColor="#62646c" />
                    </linearGradient>

                    <linearGradient
                        id="lp-lny-brass"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >
                        <stop offset="0" stopColor="#FFAE70" />
                        <stop offset=".5" stopColor="#D95B13" />
                        <stop offset="1" stopColor="#683015" />
                    </linearGradient>

                    <linearGradient
                        id="lp-lny-plastic"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0" stopColor="#2d3036" />
                        <stop offset=".45" stopColor="#15171a" />
                        <stop offset="1" stopColor="#0a0b0d" />
                    </linearGradient>

                    <linearGradient
                        id="lp-lny-cream"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <stop offset="0" stopColor="#101114" />
                        <stop offset=".45" stopColor="#34373D" />
                        <stop offset=".7" stopColor="#292B30" />
                        <stop offset="1" stopColor="#0D0E11" />
                    </linearGradient>

                    {/* Motif kawung (batik): 4 elips saling bertumpuk */}
                    <g
                        id="lp-lny-motif"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    >
                        <ellipse cx="0" cy="-7" rx="4.2" ry="7" />
                        <ellipse cx="0" cy="7" rx="4.2" ry="7" />
                        <ellipse cx="-7" cy="0" rx="7" ry="4.2" />
                        <ellipse cx="7" cy="0" rx="7" ry="4.2" />
                        <circle cx="0" cy="0" r="1.6" fill="currentColor" />
                    </g>

                    <clipPath id="lp-lny-hook-clip">
                        <rect x="-24" y="-60" width="48" height="63" />
                    </clipPath>

                    <filter
                        id="lp-lny-strap-shadow"
                        x="-30%"
                        y="-10%"
                        width="160%"
                        height="130%"
                    >
                        <feDropShadow
                            dx="2"
                            dy="5"
                            stdDeviation="3.2"
                            floodColor="#000"
                            floodOpacity=".38"
                        />
                    </filter>

                    <filter
                        id="lp-lny-hardware-shadow"
                        x="-60%"
                        y="-20%"
                        width="220%"
                        height="150%"
                    >
                        <feDropShadow
                            dx="1.5"
                            dy="3"
                            stdDeviation="2.2"
                            floodColor="#000"
                            floodOpacity=".42"
                        />
                    </filter>

                    {STRAPS.map((strap, index) => (
                        <clipPath
                            key={strap.key}
                            id={`lp-lny-clip-${strap.key}`}
                        >
                            <path ref={bind(index, "clip")} />
                        </clipPath>
                    ))}
                </defs>

                {/* Dua sisi tali (V) */}
                <g filter="url(#lp-lny-strap-shadow)">
                    {STRAPS.map((strap, index) => (
                        <g key={strap.key}>
                            <path
                                ref={bind(index, "body")}
                                fill="url(#lp-lny-fabric)"
                            />

                            <g clipPath={`url(#lp-lny-clip-${strap.key})`}>
                                <path
                                    ref={bind(index, "weave")}
                                    className="lp-id-fabric__weave"
                                    fill="url(#lp-lny-weave)"
                                />

                                <path
                                    ref={bind(index, "lattice")}
                                    className="lp-id-fabric__lattice"
                                    stroke="url(#lp-lny-ink)"
                                />

                                <path
                                    ref={bind(index, "edgeA")}
                                    className="lp-id-fabric__edge"
                                />
                                <path
                                    ref={bind(index, "edgeB")}
                                    className="lp-id-fabric__edge"
                                />

                                {/* Kilap tengah pita sekaligus jalur teks */}
                                <path
                                    id={`lp-id-${strap.key}-text-path`}
                                    ref={bind(index, "label")}
                                    className="lp-id-fabric__shine"
                                />

                                <path
                                    ref={bind(index, "stitchA")}
                                    className="lp-id-fabric__stitch"
                                    stroke="url(#lp-lny-ink)"
                                />
                                <path
                                    ref={bind(index, "stitchB")}
                                    className="lp-id-fabric__stitch"
                                    stroke="url(#lp-lny-ink)"
                                />

                                <text
                                    className="lp-id-fabric__label"
                                    textAnchor="middle"
                                >
                                    <textPath
                                        href={`#lp-id-${strap.key}-text-path`}
                                        startOffset={strap.offset}
                                    ></textPath>
                                </text>

                                {MOTIF_AT.map((t, j) => (
                                    <use
                                        key={t}
                                        href="#lp-lny-motif"
                                        ref={(el) => {
                                            const nodes =
                                                strapsRef.current[index];

                                            if (nodes) nodes.motifs[j] = el;
                                        }}
                                    />
                                ))}
                            </g>
                        </g>
                    ))}
                </g>

                {/* Hardware: tali krem, buckle snap hitam, ring dan lobster hook.
                    Titik (0,0) = pusat slot holder; sumbu y negatif = ke atas. */}
                <g ref={hardwareRef} filter="url(#lp-lny-hardware-shadow)">
                    {/* Tali krem bawah */}
                    <rect
                        x="-13"
                        y="-62"
                        width="26"
                        height="38"
                        fill="url(#lp-lny-cream)"
                    />
                    <path
                        d="M -13 -62 V -24 M 13 -62 V -24"
                        stroke="#9d8250"
                        strokeWidth=".8"
                        opacity=".5"
                    />
                    <path
                        d="M -9.2 -58 V -27 M 9.2 -58 V -27"
                        fill="none"
                        stroke="#a8814b"
                        strokeWidth=".9"
                        strokeDasharray="1.2 2.4"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="0"
                        cy="-46"
                        r="3.7"
                        fill="url(#lp-lny-brass)"
                        stroke="#6b4f2b"
                        strokeWidth=".7"
                    />
                    <circle cx="0" cy="-46" r="1.6" fill="#35261a" />

                    {/* Buckle snap hitam */}
                    <rect
                        x="-14.5"
                        y="-86"
                        width="29"
                        height="28"
                        rx="5.5"
                        fill="url(#lp-lny-plastic)"
                    />
                    <rect
                        x="-17"
                        y="-110"
                        width="34"
                        height="30"
                        rx="6.5"
                        fill="url(#lp-lny-plastic)"
                    />
                    <rect
                        x="-15"
                        y="-108.6"
                        width="30"
                        height="1.1"
                        rx=".55"
                        fill="#fff"
                        opacity=".2"
                    />
                    <path
                        d="M -17 -80 H 17"
                        stroke="#000"
                        strokeWidth=".9"
                        opacity=".55"
                    />
                    <circle
                        cx="0"
                        cy="-83"
                        r="9"
                        fill="#0a0b0d"
                        stroke="#363a41"
                        strokeWidth="1.1"
                    />
                    <circle
                        cx="0"
                        cy="-83"
                        r="5.4"
                        fill="url(#lp-lny-plastic)"
                        stroke="#4a5059"
                        strokeWidth=".8"
                    />
                    <circle
                        cx="-1.7"
                        cy="-84.7"
                        r="1.5"
                        fill="#fff"
                        opacity=".24"
                    />

                    {/* Ring dan swivel logam */}
                    <rect
                        x="-8.5"
                        y="-35"
                        width="17"
                        height="19"
                        rx="8.5"
                        fill="none"
                        stroke="url(#lp-lny-metal)"
                        strokeWidth="2.6"
                    />
                    <rect
                        x="-3.4"
                        y="-19"
                        width="6.8"
                        height="9"
                        rx="2.4"
                        fill="url(#lp-lny-metal)"
                        stroke="#6b6e76"
                        strokeWidth=".5"
                    />

                    {/* Lobster hook: bagian bawahnya masuk ke slot holder */}
                    <g clipPath="url(#lp-lny-hook-clip)">
                        <path
                            d="M -3.2 -12 C -11.5 -7 -11.5 7 0 11.5 C 11.5 7 11.5 -7 3.2 -12 Z"
                            fill="none"
                            stroke="url(#lp-lny-metal)"
                            strokeWidth="2.8"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M 3.4 -10.5 L 7 4"
                            fill="none"
                            stroke="#8b9099"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <rect
                            x="7.6"
                            y="-6"
                            width="3.4"
                            height="6.4"
                            rx="1.4"
                            fill="url(#lp-lny-metal)"
                        />
                    </g>
                </g>
            </svg>

            {/* ==========================================
                HOLDER KULIT + ID CARD
            ========================================== */}

            <article
                ref={cardRef}
                className="lp-id-card"
                role="group"
                aria-label={`ID card ${name}, tarik untuk mengayunkan`}
                tabIndex={0}
                onPointerDown={pointerDown}
                onPointerMove={pointerMove}
                onPointerUp={pointerEnd}
                onPointerCancel={pointerEnd}
                onLostPointerCapture={pointerEnd}
                onKeyDown={keyDown}
            >
                <div className="lp-id-card__tab" aria-hidden="true">
                    <span className="lp-id-card__slot" />
                </div>

                <div className="lp-id-card__holder">
                    <div className="lp-id-card__window">
                        <div className="lp-id-badge">
                            <header className="lp-id-badge__header">
                                <div className="lp-id-badge__brand">
                                    <span className="lp-id-badge__logo">
                                        {logoUrl ? (
                                            <img
                                                src={logoUrl}
                                                alt=""
                                                draggable={false}
                                            />
                                        ) : (
                                            <Layers3 size="1.8em" />
                                        )}
                                    </span>

                                    <span className="lp-id-badge__brand-text">
                                        <strong>MHMD</strong>
                                        <small>DIGITAL PROFILE</small>
                                    </span>
                                </div>

                                <span className="lp-id-badge__index">
                                    ID / 001
                                </span>
                            </header>

                            <div className="lp-id-badge__photo">
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        alt={`Foto ${name}`}
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="lp-id-badge__initials">
                                        {initials || "M"}
                                    </div>
                                )}

                                <span>SOFTWARE · AI · DATA · IOT</span>
                            </div>

                            <div className="lp-id-badge__info">
                                <span className="lp-id-badge__role">
                                    SOFTWARE ENGINEER
                                </span>

                                <h2 className="lp-id-badge__name">{name}</h2>

                                <p className="lp-id-badge__skills">
                                    Machine Learning · Data Mining · IoT
                                </p>
                            </div>

                            <footer className="lp-id-badge__footer">
                                <span
                                    className="lp-id-badge__barcode"
                                    aria-hidden="true"
                                />

                                <span>
                                    <small>BASED IN</small>
                                    <strong>INDONESIA</strong>
                                </span>
                            </footer>
                        </div>

                        <span
                            className="lp-id-card__glare"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </article>
        </div>
    );
}
