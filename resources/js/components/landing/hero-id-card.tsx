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

type Fabric = {
    body: string;
    seamA: string;
    seamB: string;
    center: string;
};

type Motion = {
    width: number;
    height: number;
    cardWidth: number;
    cardHeight: number;
    anchorX: number;
    anchorY: number;
    length: number;
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

const SLOT_Y = 18;

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

const pointString = (point: Point) =>
    `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;

const linePath = (points: Point[]) =>
    `M ${points.map(pointString).join(" L ")}`;

// Membuat permukaan kain berupa poligon.
// Bukan stroke SVG yang ditebalkan.
function makeFabric(start: Point, end: Point, side: -1 | 1): Fabric {
    const rise = end.y - start.y;
    const drift = end.x - start.x;

    const controlA = {
        x: start.x + side * 27 + drift * 0.1,
        y: start.y + rise * 0.32,
    };

    const controlB = {
        x: end.x + side * 39 - drift * 0.08,
        y: end.y - rise * 0.27,
    };

    const edgeA: Point[] = [];
    const edgeB: Point[] = [];
    const center: Point[] = [];

    for (let i = 0; i <= 34; i++) {
        const t = i / 34;
        const u = 1 - t;

        const x =
            u ** 3 * start.x +
            3 * u ** 2 * t * controlA.x +
            3 * u * t ** 2 * controlB.x +
            t ** 3 * end.x;

        const y =
            u ** 3 * start.y +
            3 * u ** 2 * t * controlA.y +
            3 * u * t ** 2 * controlB.y +
            t ** 3 * end.y;

        const dx =
            3 * u ** 2 * (controlA.x - start.x) +
            6 * u * t * (controlB.x - controlA.x) +
            3 * t ** 2 * (end.x - controlB.x);

        const dy =
            3 * u ** 2 * (controlA.y - start.y) +
            6 * u * t * (controlB.y - controlA.y) +
            3 * t ** 2 * (end.y - controlB.y);

        const size = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / size;
        const ny = dx / size;

        // Lebar pita berubah sedikit untuk
        // menghasilkan kesan lipatan kain.
        const halfWidth = 12.4 - 3.3 * t + 1.4 * Math.sin(t * Math.PI * 2.2);

        const twist = 1.3 * Math.sin(t * Math.PI * 2 + side);

        center.push({
            x: x + nx * twist,
            y: y + ny * twist,
        });

        edgeA.push({
            x: x + nx * (halfWidth + twist),
            y: y + ny * (halfWidth + twist),
        });

        edgeB.push({
            x: x - nx * (halfWidth - twist),
            y: y - ny * (halfWidth - twist),
        });
    }

    const perimeter = [...edgeA, ...edgeB.slice().reverse()];

    const seam = (points: Point[]) =>
        linePath(
            points.map((point, index) => ({
                x: point.x + (center[index]!.x - point.x) * 0.13,
                y: point.y + (center[index]!.y - point.y) * 0.13,
            })),
        );

    return {
        body: `${linePath(perimeter)} Z`,
        seamA: seam(edgeA),
        seamB: seam(edgeB),
        center: linePath(center),
    };
}

export default function HeroIdCard({ name, photoUrl, logoUrl }: Props) {
    const stageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const hardwareRef = useRef<SVGGElement>(null);

    const leftRef = useRef<SVGPathElement>(null);
    const rightRef = useRef<SVGPathElement>(null);

    const leftPatternRef = useRef<SVGPathElement>(null);
    const rightPatternRef = useRef<SVGPathElement>(null);

    const leftWeaveRef = useRef<SVGPathElement>(null);
    const rightWeaveRef = useRef<SVGPathElement>(null);

    const seamsRef = useRef<SVGPathElement[]>([]);
    const textRefs = useRef<SVGPathElement[]>([]);

    const motionRef = useRef<Motion | null>(null);

    useEffect(() => {
        const stage = stageRef.current;
        const card = cardRef.current;
        const svg = svgRef.current;

        if (!stage || !card || !svg) return;

        let frame = 0;
        let lastTime = 0;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        function resize() {
            const bounds = stage!.getBoundingClientRect();

            if (!bounds.width || !bounds.height) return;

            const cardWidth = card!.offsetWidth;
            const cardHeight = card!.offsetHeight;

            const width = bounds.width;
            const height = bounds.height;

            const anchorX = width / 2;
            const anchorY = 18;

            // Panjang disesuaikan dengan tinggi kartu.
            // Menyisakan ruang agar tidak terpotong.
            const maxLength = Math.max(
                75,
                height - cardHeight + SLOT_Y - anchorY - 48,
            );

            const length = Math.min(height * 0.3, maxLength);

            svg!.setAttribute("viewBox", `0 0 ${width} ${height}`);

            const old = motionRef.current;

            if (!old) {
                motionRef.current = {
                    width,
                    height,
                    cardWidth,
                    cardHeight,
                    anchorX,
                    anchorY,
                    length,

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

                Object.assign(old, {
                    width,
                    height,
                    cardWidth,
                    cardHeight,
                    anchorX,
                    anchorY,
                    length,
                });

                old.x = anchorX + ratioX * length;
                old.y = anchorY + ratioY * length;
            }
        }

        function draw(state: Motion) {
            card!.style.transform = [
                `translate3d(`,
                `${state.x - state.cardWidth / 2}px,`,
                `${state.y - SLOT_Y}px, 0)`,
                `rotate(${state.angle}deg)`,
            ].join(" ");

            card!.style.opacity = "1";

            const rad = (state.angle * Math.PI) / 180;

            const spread = Math.min(105, state.width * 0.25);

            // Dua pita turun dari atas dan
            // bertemu pada konektor kartu.
            const endpoints = ([-1, 1] as const).map((side) => {
                const localX = side * 9;
                const localY = -46;

                return {
                    start: {
                        x: state.anchorX + side * spread,
                        y: -48,
                    },

                    end: {
                        x:
                            state.x +
                            localX * Math.cos(rad) -
                            localY * Math.sin(rad),

                        y:
                            state.y +
                            localX * Math.sin(rad) +
                            localY * Math.cos(rad),
                    },
                };
            });

            const left = makeFabric(endpoints[0]!.start, endpoints[0]!.end, -1);

            const right = makeFabric(endpoints[1]!.start, endpoints[1]!.end, 1);

            leftRef.current?.setAttribute("d", left.body);

            rightRef.current?.setAttribute("d", right.body);

            leftPatternRef.current?.setAttribute("d", left.body);

            rightPatternRef.current?.setAttribute("d", right.body);

            leftWeaveRef.current?.setAttribute("d", left.body);

            rightWeaveRef.current?.setAttribute("d", right.body);

            const seams = [left.seamA, left.seamB, right.seamA, right.seamB];

            seamsRef.current.forEach((element, index) =>
                element?.setAttribute("d", seams[index]!),
            );

            textRefs.current[0]?.setAttribute("d", left.center);

            textRefs.current[1]?.setAttribute("d", right.center);

            hardwareRef.current?.setAttribute(
                "transform",
                `translate(${state.x} ${state.y}) rotate(${state.angle})`,
            );
        }

        function animate(now: number) {
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

                    // Kartu jatuh hingga lanyard
                    // mencapai panjang maksimal.
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
        }

        resize();

        const observer = new ResizeObserver(resize);

        observer.observe(stage);
        observer.observe(card);

        frame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
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

    return (
        <div ref={stageRef} className="lp-id-stage">
            <div className="lp-id-stage__glow" />

            {/* LANYARD BERTEKSTUR */}

            <svg
                ref={svgRef}
                className="lp-id-fabric"
                aria-hidden="true"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient
                        id="lp-fabric-tone"
                        x1="0"
                        x2="1"
                        y1="0"
                        y2="0"
                    >
                        <stop offset="0%" stopColor="#b9b2aa" />
                        <stop offset="16%" stopColor="#f6f0e8" />
                        <stop offset="48%" stopColor="#ffffff" />
                        <stop offset="80%" stopColor="#e4dad1" />
                        <stop offset="100%" stopColor="#a69b91" />
                    </linearGradient>

                    <linearGradient
                        id="lp-metal-tone"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <stop offset="0%" stopColor="#676970" />
                        <stop offset="25%" stopColor="#fafafa" />
                        <stop offset="53%" stopColor="#a5abb4" />
                        <stop offset="76%" stopColor="#f4f5f6" />
                        <stop offset="100%" stopColor="#62636c" />
                    </linearGradient>

                    <pattern
                        id="lp-fabric-threads"
                        patternUnits="userSpaceOnUse"
                        width="7"
                        height="7"
                    >
                        <path
                            d="M0 0 L7 7 M-2 5 L2 9"
                            stroke="#a89f97"
                            strokeWidth=".55"
                            opacity=".26"
                        />
                        <path
                            d="M7 0 L0 7"
                            stroke="#fff"
                            strokeWidth=".55"
                            opacity=".52"
                        />
                    </pattern>

                    <pattern
                        id="lp-fabric-graphic"
                        patternUnits="userSpaceOnUse"
                        width="78"
                        height="98"
                    >
                        <path
                            d="M0 8 L78 8 L78 26 L0 26 Z"
                            fill="#20375e"
                            opacity=".96"
                        />
                        <path
                            d="M0 60 L78 60 L78 78 L0 78 Z"
                            fill="#df6a27"
                            opacity=".94"
                        />
                        <path
                            d="M0 32 L36 53 L0 53 Z M78 83 L40 98 L78 98 Z"
                            fill="#efbc58"
                        />
                    </pattern>
                </defs>

                {/* Permukaan kain */}
                <path
                    ref={leftRef}
                    className="lp-id-fabric__strap"
                    fill="url(#lp-fabric-tone)"
                />
                <path
                    ref={rightRef}
                    className="lp-id-fabric__strap"
                    fill="url(#lp-fabric-tone)"
                />

                {/* Motif tercetak */}
                <path
                    ref={leftPatternRef}
                    fill="url(#lp-fabric-graphic)"
                    opacity=".43"
                />
                <path
                    ref={rightPatternRef}
                    fill="url(#lp-fabric-graphic)"
                    opacity=".43"
                />

                {/* Jahitan tepi */}
                {[0, 1, 2, 3].map((index) => (
                    <path
                        key={index}
                        ref={(element) => {
                            if (element) {
                                seamsRef.current[index] = element;
                            }
                        }}
                        className="lp-id-fabric__stitch"
                    />
                ))}

                {/* Serat anyaman kain */}
                <path
                    ref={leftWeaveRef}
                    className="lp-id-fabric__grain"
                    fill="url(#lp-fabric-threads)"
                />
                <path
                    ref={rightWeaveRef}
                    className="lp-id-fabric__grain"
                    fill="url(#lp-fabric-threads)"
                />

                {/* Jalur teks cetak */}
                <path
                    id="lp-id-left-text-path"
                    ref={(element) => {
                        if (element) {
                            textRefs.current[0] = element;
                        }
                    }}
                    fill="none"
                    stroke="none"
                />
                <path
                    id="lp-id-right-text-path"
                    ref={(element) => {
                        if (element) {
                            textRefs.current[1] = element;
                        }
                    }}
                    fill="none"
                    stroke="none"
                />

                <text className="lp-id-fabric__label">
                    <textPath href="#lp-id-left-text-path" startOffset="15%">
                        MHMD • PORTFOLIO • MHMD
                    </textPath>
                </text>

                <text className="lp-id-fabric__label">
                    <textPath href="#lp-id-right-text-path" startOffset="15%">
                        MHMD • PORTFOLIO • MHMD
                    </textPath>
                </text>

                {/* BUCKLE DAN RING LOGAM */}

                <g ref={hardwareRef} className="lp-id-fabric__hardware">
                    <path
                        d="M -13 -48 L 13 -48 L 12 -31 L -12 -31 Z"
                        fill="#f1e6d7"
                        stroke="#b1a29a"
                        strokeWidth="1"
                    />

                    <rect
                        x="-17"
                        y="-39"
                        width="34"
                        height="25"
                        rx="6"
                        fill="#15171a"
                        stroke="#51545a"
                        strokeWidth="1.4"
                    />

                    <rect
                        x="-8"
                        y="-32"
                        width="16"
                        height="12"
                        rx="3"
                        fill="#363940"
                    />

                    <path
                        d="M -12 -17 H 12 M -12 -14 H 12"
                        stroke="#656970"
                        strokeWidth="1"
                    />

                    <path
                        d="M -7 -14 L -7 -3 Q -7 0 0 0 Q 7 0 7 -3 L 7 -14"
                        stroke="url(#lp-metal-tone)"
                        strokeWidth="5"
                        fill="none"
                    />

                    <circle
                        cx="0"
                        cy="9"
                        r="10"
                        stroke="url(#lp-metal-tone)"
                        strokeWidth="4"
                        fill="none"
                    />
                </g>
            </svg>

            {/* ID CARD */}

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
                <div className="lp-id-card__slot" aria-hidden="true">
                    <span />
                </div>

                <header className="lp-id-card__header">
                    <div className="lp-id-card__brand">
                        <span className="lp-id-card__logo">
                            {logoUrl ? (
                                <img src={logoUrl} alt="" draggable={false} />
                            ) : (
                                <Layers3 size={19} />
                            )}
                        </span>

                        <span>
                            <strong>MHMD</strong>
                            <small>DIGITAL PROFILE</small>
                        </span>
                    </div>

                    <span className="lp-id-card__index">ID / 001</span>
                </header>

                <div className="lp-id-card__photo">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={`Foto ${name}`}
                            draggable={false}
                        />
                    ) : (
                        <div className="lp-id-card__initials">
                            {initials || "M"}
                        </div>
                    )}

                    <span>SOFTWARE · AI · DATA · IOT</span>
                </div>

                <div className="lp-id-card__information">
                    <span className="lp-id-card__role">SOFTWARE ENGINEER</span>

                    <h2>{name}</h2>

                    <p>Machine Learning · Data Mining · IoT</p>
                </div>

                <footer className="lp-id-card__footer">
                    <span className="lp-id-card__barcode" aria-hidden="true" />

                    <span>
                        <small>BASED IN</small>
                        <strong>INDONESIA</strong>
                    </span>
                </footer>
            </article>

            <div className="lp-id-drag-hint">
                <Move size={14} />
                Geser kartu untuk mengayunkan
            </div>
        </div>
    );
}
