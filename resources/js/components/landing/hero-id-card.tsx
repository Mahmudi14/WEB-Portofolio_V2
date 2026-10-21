import { Layers3, Move } from "lucide-react";
import { useEffect, useRef } from "react";

import type {
    PointerEvent as ReactPointerEvent,
    KeyboardEvent as ReactKeyboardEvent,
} from "react";

import "../../../css/hero-id-card.css";

type Props = {
    name: string;
    photoUrl: string | null;
    logoUrl: string | null;
};

type RopePoint = {
    x: number;
    y: number;
    oldX: number;
    oldY: number;
};

type Motion = {
    width: number;
    height: number;
    cardWidth: number;
    cardHeight: number;
    anchorX: number;
    anchorY: number;
    ropeLength: number;
    slotY: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    dragging: boolean;
    offsetX: number;
    offsetY: number;
    pointerTime: number;
    reducedMotion: boolean;
    rope: RopePoint[];
};

const SEGMENTS = 19;

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function createRope(
    ax: number,
    ay: number,
    bx: number,
    by: number,
): RopePoint[] {
    return Array.from({ length: SEGMENTS }, (_, index) => {
        const t = index / (SEGMENTS - 1);

        const x = ax + (bx - ax) * t;
        const y = ay + (by - ay) * t;

        return { x, y, oldX: x, oldY: y };
    });
}

function ropePath(points: RopePoint[]): string {
    if (points.length === 0) return "";

    const first = points[0]!;

    let path = `M ${first.x} ${first.y}`;

    for (let i = 1; i < points.length; i++) {
        const point = points[i]!;

        path += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    }

    return path;
}

function constrainCard(state: Motion) {
    const dx = state.x - state.anchorX;
    const dy = state.y - state.anchorY;

    const distance = Math.hypot(dx, dy);

    if (distance > state.ropeLength) {
        const nx = dx / distance;
        const ny = dy / distance;

        state.x = state.anchorX + nx * state.ropeLength;

        state.y = state.anchorY + ny * state.ropeLength;

        // Hilangkan kecepatan yang mencoba
        // meregangkan tali melewati panjangnya.
        const outward = state.vx * nx + state.vy * ny;

        if (outward > 0) {
            state.vx -= outward * nx;
            state.vy -= outward * ny;
        }
    }
}

function keepCardInsideStage(state: Motion) {
    const sideMargin = state.cardWidth * 0.44;

    const minX = sideMargin;
    const maxX = state.width - sideMargin;

    const minY = state.anchorY + 34;

    const maxY = state.height - (state.cardHeight - state.slotY) - 20;

    if (state.x < minX) {
        state.x = minX;
        state.vx *= -0.16;
    }

    if (state.x > maxX) {
        state.x = maxX;
        state.vx *= -0.16;
    }

    if (state.y < minY) {
        state.y = minY;
        state.vy *= -0.1;
    }

    if (state.y > maxY) {
        state.y = maxY;
        state.vy *= -0.15;
    }
}

// Simulasi tali menggunakan metode Verlet.
// Titik pertama ditambatkan di atas,
// titik terakhir selalu mengikuti ID card.
function simulateRope(state: Motion, dt: number) {
    const points = state.rope;
    const last = points.length - 1;

    const segmentLength = state.ropeLength / last;

    // Saat kartu baru jatuh dari atas,
    // gambar tali mengikuti kartu terlebih dahulu.
    if (state.y < state.anchorY + 12) {
        state.rope = createRope(state.anchorX, state.anchorY, state.x, state.y);

        return;
    }

    // Integrasi gravitasi dan momentum tali.
    for (let i = 1; i < last; i++) {
        const point = points[i]!;

        const vx = (point.x - point.oldX) * 0.96;
        const vy = (point.y - point.oldY) * 0.96;

        point.oldX = point.x;
        point.oldY = point.y;

        point.x += vx;
        point.y += vy + 1100 * dt * dt;
    }

    // Iterasi kendala panjang antarsegmen.
    // Membuat tali lentur tetapi tidak elastis.
    for (let iteration = 0; iteration < 12; iteration++) {
        points[0]!.x = state.anchorX;
        points[0]!.y = state.anchorY;

        points[last]!.x = state.x;
        points[last]!.y = state.y;

        for (let i = 0; i < last; i++) {
            const a = points[i]!;
            const b = points[i + 1]!;

            const dx = b.x - a.x;
            const dy = b.y - a.y;

            const distance = Math.hypot(dx, dy);

            if (distance < 0.0001) continue;

            const difference = (distance - segmentLength) / distance;

            if (i === 0) {
                b.x -= dx * difference;
                b.y -= dy * difference;
            } else if (i + 1 === last) {
                a.x += dx * difference;
                a.y += dy * difference;
            } else {
                a.x += dx * difference * 0.5;
                a.y += dy * difference * 0.5;

                b.x -= dx * difference * 0.5;
                b.y -= dy * difference * 0.5;
            }
        }
    }

    points[0]!.x = state.anchorX;
    points[0]!.y = state.anchorY;
    points[last]!.x = state.x;
    points[last]!.y = state.y;
}

export default function HeroIdCard({ name, photoUrl, logoUrl }: Props) {
    const stageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const leftShadowRef = useRef<SVGPathElement>(null);
    const rightShadowRef = useRef<SVGPathElement>(null);

    const leftBandRef = useRef<SVGPathElement>(null);
    const rightBandRef = useRef<SVGPathElement>(null);

    const leftAccentRef = useRef<SVGPathElement>(null);
    const rightAccentRef = useRef<SVGPathElement>(null);

    const buckleRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    const motionRef = useRef<Motion | null>(null);

    useEffect(() => {
        const stage = stageRef.current;
        const card = cardRef.current;
        const svg = svgRef.current;

        if (!stage || !card || !svg) return;

        let frame = 0;
        let previousTime = 0;
        let alive = true;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        function measure() {
            if (!stage || !card || !svg) return;

            const rect = stage.getBoundingClientRect();

            if (rect.width <= 0 || rect.height <= 0) {
                return;
            }

            const width = rect.width;
            const height = rect.height;

            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;

            // Titik gantung sedikit di tengah atas
            const anchorX = width / 2;
            const anchorY = 22;

            // Titik lubang kartu
            const slotY = 18;

            // Panjang lanyard dibuat lebih masuk akal
            const ropeLength = Math.max(
                150,
                Math.min(height * 0.34, height - cardHeight + slotY - 42),
            );

            svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

            const old = motionRef.current;

            if (!old) {
                // Mulai jatuh dari atas
                const x = reducedMotion ? anchorX : anchorX - 10;

                const y = reducedMotion
                    ? anchorY + ropeLength
                    : -cardHeight - 120;

                motionRef.current = {
                    width,
                    height,
                    cardWidth,
                    cardHeight,
                    anchorX,
                    anchorY,
                    ropeLength,
                    slotY,
                    x,
                    y,
                    vx: reducedMotion ? 0 : 16,
                    vy: 0,
                    angle: reducedMotion ? 0 : -4,
                    dragging: false,
                    offsetX: 0,
                    offsetY: 0,
                    pointerTime: 0,
                    reducedMotion,
                    rope: createRope(anchorX, anchorY, x, y),
                };
            } else {
                const relativeX =
                    (old.x - old.anchorX) / Math.max(old.ropeLength, 1);

                const relativeY =
                    (old.y - old.anchorY) / Math.max(old.ropeLength, 1);

                old.width = width;
                old.height = height;
                old.cardWidth = cardWidth;
                old.cardHeight = cardHeight;
                old.anchorX = anchorX;
                old.anchorY = anchorY;
                old.ropeLength = ropeLength;
                old.slotY = slotY;

                old.x = anchorX + relativeX * ropeLength;

                old.y = anchorY + relativeY * ropeLength;

                old.rope = createRope(anchorX, anchorY, old.x, old.y);
            }
        }

        function draw(state: Motion) {
            const cardLeft = state.x - state.cardWidth / 2;

            const cardTop = state.y - state.slotY;

            const transform = [
                `translate3d(${cardLeft}px, ${cardTop}px, 0)`,
                `rotate(${state.angle}deg)`,
            ].join(" ");

            card!.style.transform = transform;
            card!.style.opacity = "1";

            // Posisi buckle di atas kartu
            const rad = (state.angle * Math.PI) / 180;

            const buckleX = state.x + Math.sin(rad) * 8;

            const buckleY = state.y - state.slotY - 18;

            // Titik atas lanyard (dua sisi)
            const topY = state.anchorY + 14;

            const leftStartX = state.anchorX - 58;
            const rightStartX = state.anchorX + 58;

            // Titik bawah pita, masuk ke buckle
            const leftEndX = buckleX - 12;
            const rightEndX = buckleX + 12;

            const horizontalPull = clamp(
                (state.x - state.anchorX) * 0.24,
                -30,
                30,
            );

            const sag = clamp((state.y - topY) * 0.36, 58, 120);

            const leftPath = `
        M ${leftStartX} ${topY}
        Q ${leftStartX + 10 + horizontalPull} ${topY + sag}
          ${leftEndX} ${buckleY}
    `;

            const rightPath = `
        M ${rightStartX} ${topY}
        Q ${rightStartX - 10 + horizontalPull} ${topY + sag}
          ${rightEndX} ${buckleY}
    `;

            leftShadowRef.current?.setAttribute("d", leftPath);

            rightShadowRef.current?.setAttribute("d", rightPath);

            leftBandRef.current?.setAttribute("d", leftPath);

            rightBandRef.current?.setAttribute("d", rightPath);

            leftAccentRef.current?.setAttribute("d", leftPath);

            rightAccentRef.current?.setAttribute("d", rightPath);

            buckleRef.current!.style.transform = `translate3d(${buckleX - 20}px, ${buckleY - 10}px, 0) rotate(${state.angle}deg)`;

            ringRef.current!.style.transform = `translate3d(${buckleX - 9}px, ${buckleY + 15}px, 0) rotate(${state.angle}deg)`;
        }

        function animate(time: number) {
            if (!alive) return;

            const state = motionRef.current;

            if (!state) {
                frame = requestAnimationFrame(animate);
                return;
            }

            const dt = previousTime
                ? clamp((time - previousTime) / 1000, 0.001, 0.033)
                : 1 / 60;

            previousTime = time;

            if (!state.dragging) {
                if (state.reducedMotion) {
                    // Hindari animasi otomatis jika
                    // pengguna memilih reduced motion.
                    state.x = state.anchorX;
                    state.y = state.anchorY + state.ropeLength;

                    state.vx = 0;
                    state.vy = 0;
                } else {
                    // Gravitasi dan redaman udara.
                    state.vy += 2600 * dt;

                    state.vx *= Math.exp(-0.72 * dt);
                    state.vy *= Math.exp(-0.22 * dt);

                    state.x += state.vx * dt;
                    state.y += state.vy * dt;

                    // Tali menahan titik gantung kartu.
                    constrainCard(state);
                    keepCardInsideStage(state);
                }
            }

            // Kemiringan kartu mengikuti ayunan,
            // tetapi tetap terasa memiliki bobot.
            const dx = state.x - state.anchorX;
            const dy = Math.max(25, state.y - state.anchorY);

            const desiredAngle = state.reducedMotion
                ? 0
                : ((-Math.atan2(dx, dy) * 180) / Math.PI) * 0.72;

            state.angle += (desiredAngle - state.angle) * Math.min(1, dt * 9);

            draw(state);

            frame = requestAnimationFrame(animate);
        }

        measure();

        const resizeObserver = new ResizeObserver(measure);

        resizeObserver.observe(stage);
        resizeObserver.observe(card);

        frame = requestAnimationFrame(animate);

        return () => {
            alive = false;
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            motionRef.current = null;
        };
    }, []);

    function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        const state = motionRef.current;
        const stage = stageRef.current;

        if (!state || !stage) return;

        const rect = stage.getBoundingClientRect();

        state.dragging = true;

        state.offsetX = event.clientX - rect.left - state.x;

        state.offsetY = event.clientY - rect.top - state.y;

        state.pointerTime = performance.now();

        state.vx = 0;
        state.vy = 0;

        event.currentTarget.setPointerCapture(event.pointerId);

        event.currentTarget.classList.add("lp-id-card--dragging");

        event.preventDefault();
    }

    function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
        const state = motionRef.current;
        const stage = stageRef.current;

        if (!state || !stage || !state.dragging) {
            return;
        }

        const rect = stage.getBoundingClientRect();

        let targetX = event.clientX - rect.left - state.offsetX;

        let targetY = event.clientY - rect.top - state.offsetY;

        const sideMargin = state.cardWidth * 0.44;

        const minX = sideMargin;
        const maxX = state.width - sideMargin;

        const minY = state.anchorY + 34;
        const maxY = state.height - (state.cardHeight - state.slotY) - 20;

        targetX = clamp(targetX, minX, maxX);
        targetY = clamp(targetY, minY, maxY);

        // Drag tetap mengikuti panjang tali.
        const dx = targetX - state.anchorX;
        const dy = targetY - state.anchorY;
        const distance = Math.hypot(dx, dy);

        if (distance > state.ropeLength) {
            const scale = state.ropeLength / distance;

            targetX = state.anchorX + dx * scale;

            targetY = state.anchorY + dy * scale;
        }

        const now = performance.now();

        const elapsed = Math.max((now - state.pointerTime) / 1000, 0.016);

        // Simpan kecepatan untuk ayunan
        // setelah pengguna melepas kartu.
        state.vx = clamp((targetX - state.x) / elapsed, -1000, 1000);

        state.vy = clamp((targetY - state.y) / elapsed, -1000, 1000);

        state.x = targetX;
        state.y = targetY;
        state.pointerTime = now;
    }

    function onPointerEnd(event: ReactPointerEvent<HTMLElement>) {
        const state = motionRef.current;

        if (!state || !state.dragging) return;

        state.dragging = false;

        // Kurangi momentum agar tidak terlalu liar.
        state.vx *= 0.7;
        state.vy *= 0.7;

        event.currentTarget.classList.remove("lp-id-card--dragging");

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }

    function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
        const state = motionRef.current;

        if (!state) return;

        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();

            if (!state.reducedMotion) {
                state.vx += event.key === "ArrowLeft" ? -350 : 350;

                state.vy -= 65;
            }
        }

        if (event.key === "Home") {
            event.preventDefault();

            state.x = state.anchorX;
            state.y = state.anchorY + state.ropeLength;

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

            {/* TALI FISIKA */}

            <svg
                ref={svgRef}
                className="lp-id-lanyard"
                aria-hidden="true"
                preserveAspectRatio="none"
            >
                <path ref={leftShadowRef} className="lp-id-lanyard__shadow" />
                <path ref={rightShadowRef} className="lp-id-lanyard__shadow" />

                <path ref={leftBandRef} className="lp-id-lanyard__band" />
                <path ref={rightBandRef} className="lp-id-lanyard__band" />

                <path ref={leftAccentRef} className="lp-id-lanyard__accent" />
                <path ref={rightAccentRef} className="lp-id-lanyard__accent" />
            </svg>

            <span className="lp-id-anchor" aria-hidden="true" />

            <div ref={buckleRef} className="lp-id-buckle" aria-hidden="true">
                <span className="lp-id-buckle__top" />
                <span className="lp-id-buckle__bottom" />
            </div>

            <div ref={ringRef} className="lp-id-ring" aria-hidden="true" />

            <span className="lp-id-anchor" aria-hidden="true" />

            {/* KARTU IDENTITAS */}

            <article
                ref={cardRef}
                className="lp-id-card"
                role="group"
                aria-label={`Kartu identitas digital ${name}. Seret untuk mengayunkan kartu.`}
                tabIndex={0}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                onLostPointerCapture={onPointerEnd}
                onKeyDown={onKeyDown}
            >
                <div className="lp-id-card__slot" aria-hidden="true">
                    <span />
                </div>

                <div className="lp-id-card__clip" aria-hidden="true" />

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
                <span>Geser kartu untuk mengayunkan</span>
            </div>
        </div>
    );
}
