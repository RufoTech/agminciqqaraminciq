import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.4 + 0.1,
        }));

        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220, 38, 38, ${p.alpha})`;
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
            });
            raf = requestAnimationFrame(draw);
        };
        draw();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;600&display=swap');

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes glitch {
                    0%   { clip-path: inset(0 0 95% 0); transform: translate(-4px, 0); }
                    10%  { clip-path: inset(40% 0 50% 0); transform: translate(4px, 0); }
                    20%  { clip-path: inset(70% 0 10% 0); transform: translate(-2px, 0); }
                    30%  { clip-path: inset(20% 0 60% 0); transform: translate(2px, 0); }
                    40%  { clip-path: inset(85% 0 5% 0); transform: translate(-4px, 0); }
                    50%  { clip-path: inset(0 0 0 0); transform: translate(0, 0); }
                    100% { clip-path: inset(0 0 0 0); transform: translate(0, 0); }
                }
                @keyframes scanline {
                    0%   { top: -10%; }
                    100% { top: 110%; }
                }
                @keyframes pulse-red {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
                    50% { box-shadow: 0 0 30px 8px rgba(220,38,38,0.2); }
                }
                .btn-home {
                    position: relative;
                    display: inline-block;
                    padding: 14px 44px;
                    background: #dc2626;
                    color: #fff;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 600;
                    font-size: 13px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    text-decoration: none;
                    border: none;
                    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
                    transition: background 0.2s, transform 0.2s;
                    animation: pulse-red 2.5s ease infinite;
                }
                .btn-home:hover {
                    background: #b91c1c;
                    transform: scale(1.04);
                }
                .four04 {
                    font-family: 'Bebas Neue', Impact, sans-serif;
                    font-size: clamp(140px, 22vw, 280px);
                    line-height: 0.9;
                    color: #fff;
                    position: relative;
                    letter-spacing: -4px;
                    animation: fadeUp 0.8s ease both;
                }
                .four04::before {
                    content: '404';
                    position: absolute;
                    inset: 0;
                    color: #dc2626;
                    animation: glitch 4s infinite;
                    pointer-events: none;
                }
                .scanline {
                    position: absolute;
                    left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(to right, transparent, rgba(220,38,38,0.15), transparent);
                    animation: scanline 3.5s linear infinite;
                    pointer-events: none;
                }
            `}</style>

            {/* Particle canvas */}
            <canvas ref={canvasRef} style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            }} />

            {/* Scanline */}
            <div className="scanline" style={{ zIndex: 1 }} />

            {/* Red side accent lines */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: '4px',
                background: 'linear-gradient(to bottom, transparent 0%, #dc2626 40%, #dc2626 60%, transparent 100%)',
            }} />
            <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0,
                width: '4px',
                background: 'linear-gradient(to bottom, transparent 0%, #dc2626 40%, #dc2626 60%, transparent 100%)',
            }} />

            {/* Content */}
            <div style={{
                position: 'relative', zIndex: 2,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0px',
                textAlign: 'center', padding: '0 24px',
            }}>
                {/* Logo */}
                <div style={{
                    animation: 'fadeUp 0.6s ease both',
                    marginBottom: '12px',
                }}>
                    <svg width="180" height="40" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* B mark */}
                        <rect x="0" y="0" width="36" height="40" fill="#dc2626" />
                        <text x="6" y="32" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="34" fill="#fff">B</text>
                        {/* RENDEX text */}
                        <text x="44" y="30" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="30" fill="#fff" letterSpacing="3">RENDEX</text>
                    </svg>
                </div>

                {/* Divider */}
                <div style={{
                    width: '60px', height: '2px',
                    background: '#dc2626',
                    marginBottom: '24px',
                    animation: 'fadeUp 0.65s ease both',
                }} />

                {/* 404 */}
                <div className="four04">404</div>

                {/* Subtitle */}
                <p style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                    fontSize: '13px',
                    letterSpacing: '6px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.45)',
                    marginTop: '20px',
                    marginBottom: '6px',
                    animation: 'fadeUp 0.9s 0.15s ease both',
                    opacity: 0,
                    animationFillMode: 'forwards',
                }}>
                    Səhifə tapılmadı
                </p>

                <p style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 400,
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '40px',
                    maxWidth: '320px',
                    lineHeight: 1.6,
                    animation: 'fadeUp 0.9s 0.25s ease both',
                    opacity: 0,
                    animationFillMode: 'forwards',
                }}>
                    Axtardığınız səhifə mövcud deyil və ya köçürülüb.
                </p>

                <div style={{ animation: 'fadeUp 0.9s 0.35s ease both', opacity: 0, animationFillMode: 'forwards' }}>
                    <Link to="/" className="btn-home">
                        Əsas səhifəyə qayıt
                    </Link>
                </div>

                {/* Error code */}
                <p style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '4px',
                    color: 'rgba(220,38,38,0.5)',
                    marginTop: '48px',
                    textTransform: 'uppercase',
                    animation: 'fadeUp 0.9s 0.45s ease both',
                    opacity: 0,
                    animationFillMode: 'forwards',
                }}>
                    Error Code: 404 · Page Not Found
                </p>
            </div>
        </div>
    );
};

export default NotFound;