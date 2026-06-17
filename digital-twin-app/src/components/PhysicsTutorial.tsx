import React, { useEffect, useRef, useState } from 'react';

interface ComponentInfo {
    title: string;
    sub: string;
    mat: string;
    param: string;
    fn: string;
    simple: string;
}

const POPUP_DB: Record<string, ComponentInfo> = {
    bobina: {
        title: 'Bobina Solenoide',
        sub: 'Fio de Cobre Esmaltado',
        mat: 'Cobre (Cu) AWG 24 · Esmaltado para isolamento elétrico',
        param: 'R ≈ 38 Ω · L ≈ 0.8 H · N ≈ 500 espiras',
        fn: 'Cada volta do fio cria um pequeno campo magnético. Juntos, todos empurram na mesma direção e somam os campos, criando um ímã poderoso.',
        simple: '🔌 É como várias formigas carregando um grão de areia — cada uma faz pouco, mas juntas fazem muito!'
    },
    nucleo: {
        title: 'Núcleo Ferromagnético',
        sub: 'Aço Laminado de Alta Permeabilidade',
        mat: 'Aço Silício Laminado · μᵣ ≈ 2000 (vs. 1 para o ar)',
        param: 'Relutância: ℛ = ℓ / (μ·A) [A·e/Wb]',
        fn: 'O núcleo de ferro "conduz" o campo magnético como um fio conduz elétrons. Ele amplifica e concentra o campo gerado pela bobina.',
        simple: '🧲 O ferro é um "autoestrada" para o campo magnético. O ar é um "caminho de terra" — muito mais difícil de atravessar!'
    },
    campo: {
        title: 'Campo Magnético (B)',
        sub: 'Linhas de Força Magnética',
        mat: 'Campo invisível · unidade: Tesla (T)',
        param: 'B = μ₀·μᵣ·N·I / ℓ · linhas saem do polo N, entram no polo S',
        fn: 'O campo magnético é a "zona de influência" do eletroímã — a região onde ele consegue atrair objetos. Ele existe no espaço ao redor da bobina.',
        simple: '🌀 Imagine o campo como ondas saindo de uma pedra jogada na água — mas em vez de molhar, elas atraem metais!'
    },
    fonte: {
        title: 'Fonte de Alimentação DC',
        sub: 'ICEL Manaus PS-3005 (0–32V · 0–5A)',
        mat: 'Fonte Chaveada DC · Tensão regulada',
        param: 'V = tensão (Volts) · I = corrente (Ampères) · P = V·I (Watts)',
        fn: 'Fornece energia elétrica controlada para a bobina. A tensão (V) "empurra" os elétrons, a resistência (R) limita a corrente: I = V/R.',
        simple: '🔋 A fonte é a caixa d\'água — a tensão é a altura da caixa, a corrente é a quantidade de água que flui pelo cano!'
    },
    resistor: {
        title: 'Resistência da Bobina (R)',
        sub: 'Resistência Ôhmica do Fio de Cobre',
        mat: 'Resistência elétrica intrínseca do fio de cobre · R ≈ 38 Ω',
        param: 'Lei de Ohm: V = R · I · Efeito Joule: P = R · I²',
        fn: 'O fio de cobre não é perfeito — ele "resiste" um pouco à passagem dos elétrons. Essa resistência limita a corrente e gera calor (Efeito Joule).',
        simple: '🚰 É como um cano estreito numa mangueira — quanto mais estreito (R maior), menos água passa (I menor)!'
    },
    indutor: {
        title: 'Indutância (L)',
        sub: 'Propriedade de "Memória" da Bobina',
        mat: 'L ≈ 0.8 Henrys · depende de N², área e comprimento',
        param: 'τ = L/R = 21ms · dI/dt = (V − R·I) / L',
        fn: 'A indutância faz a bobina "lembrar" do campo magnético anterior. Ela se opõe a mudanças rápidas de corrente — por isso a corrente sobe devagar.',
        simple: '😴 A bobina é teimosa — não quer sair do estado atual! Quanto maior L, mais teimosa ela é.'
    },
    entreferro: {
        title: 'Entreferro (g)',
        sub: 'Espaço de Ar entre Eletroímã e Objeto',
        mat: 'Ar · μᵣ = 1 (baixíssima permeabilidade)',
        param: 'F ∝ 1/g² — se dobrar g, a força cai para ¼!',
        fn: 'É o espaço entre o eletroímã e o objeto de metal. O ar "resiste" muito ao campo magnético — quanto menor o espaço, maior a força.',
        simple: '📏 É como tentar pegar algo com a mão — mais perto = mais fácil. Dobrar a distância = 4× mais difícil (não 2×)!'
    },
    armadura: {
        title: 'Armadura / Objeto Ferromagnético',
        sub: 'Massa de Aço ou Ferro Atraída',
        mat: 'Aço Carbono · Fe · Ferramenta metálica · Cadeado',
        param: 'F = μ₀(N·I)²A/(2g²) em Newtons',
        fn: 'Qualquer objeto de ferro ou aço é atraído pelo eletroímã quando há corrente. Sem corrente, sem atração — o eletroímã pode ser ligado e desligado!',
        simple: '🔩 Por isso eletroímãs são usados em ferro-velhos: ligou, agarrou o carro; desligou, largou o carro!'
    },
    joule: {
        title: 'Efeito Joule — Calor Elétrico',
        sub: 'Dissipação de Energia Térmica',
        mat: 'Energia elétrica → calor térmico · unidade: Watts (W)',
        param: 'P = R · I² · [James Prescott Joule, 1841]',
        fn: 'Toda corrente elétrica numa resistência gera calor. No eletroímã, isso aquece a carcaça durante o uso. É por isso que equipamentos industriais precisam de resfriamento.',
        simple: '🌡️ É o mesmo princípio que aquece a resistência do chuveiro: corrente + resistência = calor!'
    },
    icel: {
        title: 'Fonte ICEL Manaus PS-3005',
        sub: 'Fonte de Bancada DC Chaveada',
        mat: 'Saída: 0–32V · 0–5A · Display digital de 4 dígitos',
        param: 'Permite monitorar V e I simultaneamente → valida R = V/I',
        fn: 'A fonte usada no experimento permite ajustar a tensão com precisão e ler a corrente em tempo real. Com esses dois valores, calculamos a resistência da bobina sem nenhum outro instrumento.',
        simple: '📟 O display da fonte mostrou V = 24V e I = 0.632A → R = 24/0.632 = 38Ω. Física funcionando ao vivo!'
    },
    estator: {
        title: 'Estator do Freio (Eletroímã Real)',
        sub: 'Componente Industrial de Equipamento de Raio-X',
        mat: 'Aço SAE + Bobina Cu 500 espiras + Carcaça Metálica',
        param: 'V_nom = 24V · R = 38Ω · L = 0.8H · N ≈ 500 espiras',
        fn: 'O eletroímã real usado no experimento é o estator de um freio de uma máquina de Raio-X industrial. Quando energizado, trava a mesa de exame com força suficiente para segurar dezenas de quilos.',
        simple: '🏥 Na vida real, esse eletroímã garante que a mesa do Raio-X fica absolutamente parada durante o exame — se movesse, a imagem ficaria borrada!'
    },
    carga: {
        title: 'Massa Ferromagnética (Carga de Teste)',
        sub: 'Ferramenta de Aço · Bloco de Ferro · Cadeado',
        mat: 'Ferro ou Aço · Alta permeabilidade magnética',
        param: 'Peso variado · Demonstra a força de retenção do eletroímã',
        fn: 'Usada no experimento para demonstrar fisicamente a força do campo. Com corrente zero, o objeto cai. Com corrente máxima, fica suspenso — validando a relação F = N·I ao vivo.',
        simple: '🔒 Com o eletroímã ligado: o cadeado gruda. Com o eletroímã desligado: o cadeado cai. Simples assim!'
    },
    'res-ohm': {
        title: 'Lei de Ohm Validada',
        sub: 'Georg Simon Ohm — 1827',
        mat: 'Princípio: V = R · I (tensão = resistência × corrente)',
        param: 'V = 24V · I = 0.632A → R = 24/0.632 = 38.0 Ω',
        fn: 'Com a fonte ICEL mostrando V=24V e I=0.632A, calculamos R = V/I = 38Ω. Isso confirma que a bobina se comporta como um resistor ôhmico em regime permanente (corrente contínua estável).',
        simple: '📐 Lei de Ohm é como: Tensão é o empurrão, Corrente é o que corre, Resistência é o que atrapalha. Empurrão = (o que atrapalha) × (o que corre).'
    },
    'res-mmf': {
        title: 'Força Magnetomotriz Medida',
        sub: 'Lei de Ampère — ℱ = N·I',
        mat: 'Resultado: ℱ = 316 A·espiras (Ampere-espiras)',
        param: 'N = 500 espiras · I = 0.632A → ℱ = 500 × 0.632 = 316',
        fn: 'A FMM é a "força de condução" do fluxo magnético pelo circuito. Com 316 A·e, o eletroímã gera campo suficiente para travar um braço articulado de dezenas de quilos durante a emissão de raios X.',
        simple: '💪 316 trabalhadores (A·espiras) empurrando o campo magnético ao mesmo tempo. É muita força!'
    },
    'res-joule': {
        title: 'Efeito Joule Observado',
        sub: 'P = R · I² — James Prescott Joule, 1841',
        mat: 'P = 38 × (0.632)² = 38 × 0.3994 = 15.2 W',
        param: 'Energia dissipada como calor: 15.2 W = suficiente para aquecer o componente',
        fn: 'Após alguns minutos operando, a carcaça do eletroímã aqueceu visivelmente. Isso é o Efeito Joule em ação: os elétrons colidindo com os átomos do cobre e gerando calor. No total, 15.2 Watts são dissipados como calor.',
        simple: '🌡️ 15.2 Watts de calor é como deixar uma lâmpada de LED acesa por dentro do eletroímã. Dá para sentir no toque!'
    },
    'res-tau': {
        title: 'Constante de Tempo (τ)',
        sub: 'τ = L/R — Tempo de Resposta do Circuito RL',
        mat: 'τ = 0.8 / 38 = 0.021 s = 21.1 milissegundos',
        param: 'Em 1τ: 63% da corrente. Em 5τ (105ms): praticamente 100%',
        fn: 'O atraso de 21ms foi observado no simulador: ao ligar a fonte, a corrente não sobe instantaneamente. O simulador plotou a curva I(t) = (V/R)(1-e^{-t/τ}), confirmando o comportamento teórico.',
        simple: '⏱️ 21ms é muito rápido para nós, mas para um circuito eletrônico é perceptível! É o tempo que a bobina leva para "acordar".'
    }
};

const SECTIONS = ['s0', 's1', 's2', 's3', 's4', 's5'];

export const PhysicsTutorial: React.FC = () => {
    // Nav dots & progress state
    const [activeSection, setActiveSection] = useState(0);
    const [scrollPct, setScrollPct] = useState(0);

    // Inspection popup HUD state
    const [inspectId, setInspectId] = useState<string | null>(null);
    const [hudCoords, setHudCoords] = useState({ x: 0, y: 0 });

    // Section 1 Sliders
    const [s1Current, setS1Current] = useState(0);
    const [s1Turns, setS1Turns] = useState(500);

    // Section 2 States & Sliders
    const [s2On, setS2On] = useState(false);
    const [s2Voltage, setS2Voltage] = useState(24.0);
    const [s2Resistance, setS2Resistance] = useState(38.0);
    const [s2Inductance, setS2Inductance] = useState(0.80);

    // Section 3 Sliders
    const [s3Current, setS3Current] = useState(0.632);
    const [s3Turns, setS3Turns] = useState(500);
    const [s3Gap, setS3Gap] = useState(0.5); // mm

    // Refs for physics loops
    const containerRef = useRef<HTMLDivElement | null>(null);
    const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const coilCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const circuitCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const rlChartRef = useRef<HTMLCanvasElement | null>(null);
    const forceCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const benchCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Dynamic calculated states for formula sheets
    const s1MMF = (s1Turns * s1Current).toFixed(0);
    const s2TauMs = (s2Resistance > 0 ? (s2Inductance / s2Resistance) * 1000 : 0).toFixed(1);
    const s2Imax = (s2Resistance > 0 ? s2Voltage / s2Resistance : 0).toFixed(3);
    
    // Maxwell values
    const mu0 = 4 * Math.PI * 1e-7;
    const A_core = 0.01; // m²
    const s3GapM = s3Gap / 1000;
    const s3Force = (mu0 * Math.pow(s3Turns * s3Current, 2) * A_core / (2 * Math.pow(s3GapM, 2)));
    const s3JoulePower = 38.0 * s3Current * s3Current; // approximate on 38 ohm
    const s3JoulePct = Math.min(100, (s3JoulePower / (38 * 25)) * 100);

    // Open inspection sheet handler
    const triggerInspect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setInspectId(id);
        const pw = 328, ph = 420, mg = 12;
        let px = e.clientX + 16;
        let py = e.clientY - 24;
        if (px + pw > window.innerWidth - mg) px = e.clientX - pw - 12;
        if (py + ph > window.innerHeight - mg) py = window.innerHeight - ph - mg;
        if (py < mg) py = mg;
        setHudCoords({ x: px, y: py });
    };

    const handleScroll = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const scrolled = container.scrollTop;
        const total = container.scrollHeight - container.clientHeight;
        
        setScrollPct(total > 0 ? (scrolled / total) * 100 : 0);

        SECTIONS.forEach((sid, i) => {
            const el = document.getElementById(sid);
            if (el) {
                const rect = el.getBoundingClientRect();
                // Check if section occupies the middle vertical line
                if (rect.top >= -window.innerHeight / 2 && rect.top < window.innerHeight / 2) {
                    setActiveSection(i);
                }
            }
        });
    };

    const navigateToSection = (idx: number) => {
        const el = document.getElementById(SECTIONS[idx]);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // --- ANIMATION EFFECTS ---

    // 0. Hero Section Particles Canvas Loop
    useEffect(() => {
        let frameId: number;
        const cv = heroCanvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        let w = cv.parentElement?.clientWidth || 800;
        let h = cv.parentElement?.clientHeight || 600;
        cv.width = w * dpr; cv.height = h * dpr;
        cv.style.width = w + 'px'; cv.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        let TURNS = 7;
        let COIL_CX = w * 0.75;
        let COIL_CY = h * 0.5;
        let COIL_W = 160;
        let COIL_H = 20;

        const particles = Array.from({ length: 40 }, (_, i) => ({
            t: i / 40,
            speed: 0.0004 + Math.random() * 0.0003,
            alpha: 0.4 + Math.random() * 0.6,
            r: 2.5 + Math.random() * 2,
        }));

        const fieldLines = Array.from({ length: 8 }, (_, i) => ({
            rx: 55 + i * 28,
            ry: 14 + i * 8,
            dash: i * 5,
            speed: 0.4 + i * 0.1,
        }));

        let frame = 0;

        const getCoilPos = (t: number) => {
            const totalAngle = t * Math.PI * 2 * TURNS;
            const turn = Math.floor(totalAngle / (Math.PI * 2));
            const phase = totalAngle % (Math.PI * 2);
            const x = COIL_CX - COIL_W / 2 + (turn / TURNS) * COIL_W + 16 * Math.sin(phase);
            const y = COIL_CY + COIL_H * Math.sin(phase) * (phase < Math.PI ? 1 : -1);
            return { x, y };
        };

        const draw = () => {
            if (document.hidden) {
                frameId = requestAnimationFrame(draw);
                return;
            }

            ctx.clearRect(0, 0, w, h);

            // Subtle gradient
            const bg = ctx.createRadialGradient(COIL_CX, COIL_CY, 0, COIL_CX, COIL_CY, 300);
            bg.addColorStop(0, 'rgba(34,211,238,0.04)');
            bg.addColorStop(1, 'transparent');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            // Draw coil body
            ctx.save();
            for (let i = 0; i < TURNS; i++) {
                const px = COIL_CX - COIL_W / 2 + (i / TURNS) * COIL_W;
                const nx = COIL_CX - COIL_W / 2 + ((i + 1) / TURNS) * COIL_W;

                // Top arc
                ctx.beginPath();
                ctx.ellipse(px + (nx - px) / 2, COIL_CY - COIL_H / 2, (nx - px) / 2, COIL_H, 0, Math.PI, 0);
                ctx.strokeStyle = 'rgba(180,120,40,0.65)'; ctx.lineWidth = 6; ctx.stroke();
                ctx.strokeStyle = 'rgba(217,119,6,0.45)'; ctx.lineWidth = 3; ctx.stroke();

                // Bottom arc
                ctx.beginPath();
                ctx.ellipse(px + (nx - px) / 2, COIL_CY + COIL_H / 2, (nx - px) / 2, COIL_H, 0, 0, Math.PI);
                ctx.strokeStyle = 'rgba(120,53,15,0.65)'; ctx.lineWidth = 6; ctx.stroke();
                ctx.strokeStyle = 'rgba(180,100,20,0.35)'; ctx.lineWidth = 3; ctx.stroke();
            }

            // Iron Core
            ctx.fillStyle = 'rgba(30,58,95,0.85)';
            ctx.beginPath(); ctx.roundRect(COIL_CX - COIL_W / 2 - 20, COIL_CY - 9, COIL_W + 40, 18, 4); ctx.fill();
            ctx.strokeStyle = 'rgba(100,160,220,0.3)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.restore();

            // Field lines
            frame++;
            fieldLines.forEach(fl => {
                const dash = (fl.dash + frame * fl.speed * 0.4) % 40;
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(COIL_CX, COIL_CY, fl.rx, fl.ry, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(34,211,238,0.25)';
                ctx.lineWidth = 1.2;
                ctx.setLineDash([6, 8]);
                ctx.lineDashOffset = -dash;
                ctx.stroke();
                ctx.restore();
            });

            // Electron particles
            particles.forEach(p => {
                p.t = (p.t + p.speed) % 1;
                const pos = getCoilPos(p.t);
                
                const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.r * 4);
                g.addColorStop(0, `rgba(251,191,36,${p.alpha * 0.9})`);
                g.addColorStop(1, 'rgba(251,191,36,0)');
                ctx.beginPath(); ctx.fillStyle = g; ctx.arc(pos.x, pos.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
                
                ctx.beginPath(); ctx.fillStyle = `rgba(251,191,36,${p.alpha})`; ctx.arc(pos.x, pos.y, p.r, 0, Math.PI * 2); ctx.fill();
            });

            frameId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(frameId);
    }, [activeSection]);

    // 1. Ampère Solenoid Coil Canvas Loop
    useEffect(() => {
        let frameId: number;
        const cv = coilCanvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const SZ = 420;
        cv.width = cv.height = SZ * dpr;
        ctx.scale(dpr, dpr);

        let dash = 0, t = 0;

        const drawArrow = (c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) => {
            c.save();
            c.strokeStyle = color; c.lineWidth = 2;
            c.setLineDash([]); c.beginPath();
            c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
            const dir = x2 > x1 ? 1 : -1;
            c.fillStyle = color;
            c.beginPath();
            c.moveTo(x2, y2); c.lineTo(x2 - dir * 10, y2 - 5); c.lineTo(x2 - dir * 10, y2 + 5);
            c.closePath(); c.fill();
            c.font = '700 13px Inter,sans-serif';
            c.fillText(label, x2 + dir * 14, y2 + 5);
            c.restore();
        };

        const draw = () => {
            if (document.hidden) {
                frameId = requestAnimationFrame(draw);
                return;
            }

            const cx = SZ / 2, cy = SZ / 2;
            const alpha = s1Current / 5;
            ctx.clearRect(0, 0, SZ, SZ);

            // Background
            ctx.fillStyle = '#060d1a'; ctx.fillRect(0, 0, SZ, SZ);

            // Field lines (ellipses)
            const numLines = Math.min(8, Math.max(1, Math.round(alpha * 8)));
            for (let i = 0; i < numLines; i++) {
                const rx = 50 + i * 22, ry = 14 + i * 8;
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(34,211,238,${0.5 * alpha * (1 - i * 0.08)})`;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 8]);
                ctx.lineDashOffset = -dash;
                ctx.stroke();
                ctx.restore();
            }

            // Iron Core
            ctx.fillStyle = '#1a3a5f';
            ctx.beginPath(); ctx.roundRect(cx - 130, cy - 10, 260, 20, 4); ctx.fill();
            ctx.strokeStyle = 'rgba(100,160,220,0.4)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(cx - 128, cy - 8, 256, 4);

            // Coil turns
            const TURNS = Math.min(12, Math.max(3, Math.round(s1Turns / 80)));
            const coilW = 240, coilH = 18;
            const cx0 = cx - coilW / 2;
            for (let i = 0; i < TURNS; i++) {
                const px = cx0 + (i / TURNS) * coilW;
                const nxt = cx0 + ((i + 1) / TURNS) * coilW;
                const mx = (px + nxt) / 2, rw = (nxt - px) / 2;

                ctx.beginPath();
                ctx.ellipse(mx, cy - coilH / 2, rw, coilH, 0, Math.PI, 0, true);
                ctx.strokeStyle = '#d97706'; ctx.lineWidth = 5; ctx.setLineDash([]); ctx.stroke();
                ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.stroke();

                ctx.beginPath();
                ctx.ellipse(mx, cy + coilH / 2, rw, coilH, 0, 0, Math.PI, true);
                ctx.strokeStyle = '#78350f'; ctx.lineWidth = 5; ctx.stroke();
                ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2; ctx.stroke();
            }

            // Electron particles
            t = (t + 0.012) % 1;
            for (let p = 0; p < 5; p++) {
                const pt = (t + p * 0.2) % 1;
                const angle = pt * Math.PI * 2 * TURNS;
                const turn = Math.floor(angle / (Math.PI * 2));
                const phase = angle % (Math.PI * 2);
                const ex = cx0 + (turn / TURNS) * coilW + (240 / TURNS / 2) * Math.sin(phase);
                const ey = cy + 18 * Math.sin(phase) * (phase < Math.PI ? 1 : -0.8);
                const ga = ctx.createRadialGradient(ex, ey, 0, ex, ey, 10);
                ga.addColorStop(0, `rgba(251,191,36,${alpha * 0.9})`);
                ga.addColorStop(1, 'rgba(251,191,36,0)');
                ctx.beginPath(); ctx.fillStyle = ga; ctx.arc(ex, ey, 10, 0, Math.PI * 2); ctx.fill();
                if (alpha > 0.05) {
                    ctx.beginPath(); ctx.fillStyle = `rgba(251,191,36,${alpha})`; ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
                }
            }

            // Polarity labels
            if (alpha > 0.05) {
                drawArrow(ctx, cx - 140, cy, cx - 190, cy, `rgba(34,211,238,${alpha})`, 'N');
                drawArrow(ctx, cx + 140, cy, cx + 190, cy, `rgba(251,113,133,${alpha})`, 'S');
            }

            // Coil turns text indicator
            ctx.font = '700 10px JetBrains Mono';
            ctx.fillStyle = 'rgba(251,191,36,0.55)';
            ctx.textAlign = 'center';
            ctx.fillText(`N = ${s1Turns} espiras`, cx, SZ - 18);

            dash = (dash + 0.5) % 40;
            frameId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(frameId);
    }, [s1Current, s1Turns, activeSection]);

    // 2. RL Circuit diagram & chart Transient Loop
    useEffect(() => {
        let frameId: number;
        const circCv = circuitCanvasRef.current;
        const chartCv = rlChartRef.current;
        if (!circCv || !chartCv) return;
        const circCtx = circCv.getContext('2d');
        const chartCtx = chartCv.getContext('2d');
        if (!circCtx || !chartCtx) return;

        const dpr = window.devicePixelRatio || 1;
        
        const resize = () => {
            [circCv, chartCv].forEach(cv => {
                const r = cv.getBoundingClientRect();
                cv.width = r.width * dpr; cv.height = r.height * dpr;
            });
            circCtx.scale(dpr, dpr);
            chartCtx.scale(dpr, dpr);
        };
        resize();

        let tSim = 0;
        let Inow = 0;
        let lastTs = performance.now();

        const drawCircuit = (V: number, R: number, _L: number, Ival: number, isPowerOn: boolean) => {
            const cw = circCv.width / dpr, ch = circCv.height / dpr;
            circCtx.clearRect(0, 0, cw, ch);
            circCtx.fillStyle = '#06111e'; circCtx.fillRect(0, 0, cw, ch);

            // grid lines
            circCtx.strokeStyle = 'rgba(34,211,238,0.025)'; circCtx.lineWidth = 1;
            for (let x = 0; x < cw; x += 30) { circCtx.beginPath(); circCtx.moveTo(x, 0); circCtx.lineTo(x, ch); circCtx.stroke(); }
            for (let y = 0; y < ch; y += 30) { circCtx.beginPath(); circCtx.moveTo(0, y); circCtx.lineTo(cw, y); circCtx.stroke(); }

            const mx = cw / 2, my = ch / 2;
            const W = 320, H = 140;
            const x0 = mx - W / 2, x1 = mx + W / 2;
            const y0 = my - H / 2, y1 = my + H / 2;

            const iAlpha = isPowerOn ? Math.min(1, Ival / (V / R)) : 0;
            const wireColor = `rgba(34,211,238,${0.25 + iAlpha * 0.65})`;

            // Wires paths
            circCtx.strokeStyle = wireColor; circCtx.lineWidth = 2.5; circCtx.setLineDash([]);
            circCtx.beginPath();
            circCtx.moveTo(x0, y0); circCtx.lineTo(x0, my - 18); circCtx.stroke();
            circCtx.beginPath();
            circCtx.moveTo(x0, my + 18); circCtx.lineTo(x0, y1); circCtx.stroke();
            circCtx.beginPath();
            circCtx.moveTo(x0, y1); circCtx.lineTo(mx - 40, y1); circCtx.stroke();
            circCtx.beginPath();
            circCtx.moveTo(mx + 40, y1); circCtx.lineTo(x1, y1); circCtx.stroke();
            circCtx.beginPath();
            circCtx.moveTo(x1, y1); circCtx.lineTo(x1, my + 18); circCtx.stroke();
            circCtx.beginPath();
            circCtx.moveTo(x1, my - 18); circCtx.lineTo(x1, y0); circCtx.stroke();
            circCtx.beginPath();
            circCtx.moveTo(x1, y0); circCtx.lineTo(mx + 40, y0); circCtx.stroke();
            circCtx.beginPath();
            circCtx.moveTo(mx - 40, y0); circCtx.lineTo(x0, y0); circCtx.stroke();

            // Source (Top)
            circCtx.save();
            circCtx.fillStyle = isPowerOn ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.04)';
            circCtx.beginPath(); circCtx.roundRect(mx - 50, y0 - 16, 100, 32, 6); circCtx.fill();
            circCtx.strokeStyle = isPowerOn ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.1)';
            circCtx.lineWidth = 1.5; circCtx.stroke();
            circCtx.fillStyle = isPowerOn ? '#22d3ee' : '#4d5f73';
            circCtx.font = '700 11px JetBrains Mono'; circCtx.textAlign = 'center';
            circCtx.fillText(V.toFixed(0) + 'V', mx, y0 + 4);
            circCtx.font = '600 8px Inter,sans-serif'; circCtx.fillStyle = '#4d5f73';
            circCtx.fillText('FONTE', mx, y0 + 15);
            circCtx.restore();

            // Resistor (Right)
            circCtx.save();
            circCtx.fillStyle = 'rgba(251,113,133,0.08)';
            circCtx.beginPath(); circCtx.roundRect(x1 - 22, my - 28, 44, 56, 6); circCtx.fill();
            circCtx.strokeStyle = 'rgba(251,113,133,0.4)'; circCtx.lineWidth = 1.5; circCtx.stroke();
            
            const pts = [my - 18, my - 10, my, my + 10, my + 18];
            circCtx.beginPath(); circCtx.moveTo(x1, my - 28);
            pts.forEach((py, i) => circCtx.lineTo(x1 + (i % 2 === 0 ? 10 : -10), py));
            circCtx.lineTo(x1, my + 28);
            circCtx.strokeStyle = '#fb7185'; circCtx.lineWidth = 2; circCtx.stroke();
            circCtx.fillStyle = '#fb7185'; circCtx.font = '700 10px JetBrains Mono'; circCtx.textAlign = 'center';
            circCtx.fillText('R', x1 + 32, my);
            circCtx.restore();

            // Inductor (Bottom)
            circCtx.save();
            circCtx.fillStyle = 'rgba(167,139,250,0.08)';
            circCtx.beginPath(); circCtx.roundRect(mx - 44, y1 - 20, 88, 40, 6); circCtx.fill();
            circCtx.strokeStyle = 'rgba(167,139,250,0.4)'; circCtx.lineWidth = 1.5; circCtx.stroke();
            
            const bumps = 4, bw = 80 / bumps;
            circCtx.beginPath(); circCtx.strokeStyle = '#a78bfa'; circCtx.lineWidth = 2.5;
            circCtx.moveTo(mx - 40, y1);
            for (let i = 0; i < bumps; i++) {
                circCtx.bezierCurveTo(mx - 40 + i * bw, y1 - 12, mx - 40 + i * bw + bw, y1 - 12, mx - 40 + (i + 1) * bw, y1);
            }
            circCtx.stroke();
            circCtx.fillStyle = '#a78bfa'; circCtx.font = '700 10px JetBrains Mono'; circCtx.textAlign = 'center';
            circCtx.fillText('L', mx, y1 + 17);
            circCtx.restore();

            // Current text indicator
            if (isPowerOn && Ival > 0.005) {
                circCtx.fillStyle = `rgba(251,191,36,${iAlpha})`;
                circCtx.font = '700 12px JetBrains Mono';
                circCtx.textAlign = 'center';
                circCtx.fillText(`I = ${Ival.toFixed(3)} A`, mx, y0 - 20);
            }
        };

        const drawChart = (V: number, R: number, L: number, tNow: number) => {
            const cw = chartCv.width / dpr, ch = chartCv.height / dpr;
            chartCtx.clearRect(0, 0, cw, ch);
            chartCtx.fillStyle = '#04090f'; chartCtx.fillRect(0, 0, cw, ch);
            const pad = 12;
            const Imax = V / R;
            const tau = L / R;

            // Chart background grids
            chartCtx.strokeStyle = 'rgba(255,255,255,0.04)'; chartCtx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const gy = pad + (i / 3) * (ch - pad * 2);
                chartCtx.beginPath(); chartCtx.moveTo(pad, gy); chartCtx.lineTo(cw - pad, gy); chartCtx.stroke();
            }

            // Curve I(t)
            const pts = 200;
            const tMax = tau * 6;
            chartCtx.beginPath(); chartCtx.strokeStyle = '#22d3ee'; chartCtx.lineWidth = 2.5; chartCtx.lineJoin = 'round';
            for (let i = 0; i <= pts; i++) {
                const tt = (i / pts) * tMax;
                const It = Imax * (1 - Math.exp(-tt / (tau || 1)));
                const x = pad + (tt / tMax) * (cw - pad * 2);
                const y = ch - pad - (It / (Imax || 1)) * (ch - pad * 2);
                if (i === 0) chartCtx.moveTo(x, y); else chartCtx.lineTo(x, y);
            }
            chartCtx.stroke();

            // Live dot
            if (tNow > 0 && tNow < tMax) {
                const It = Imax * (1 - Math.exp(-tNow / (tau || 1)));
                const cx = pad + (tNow / tMax) * (cw - pad * 2);
                const cy2 = ch - pad - (It / (Imax || 1)) * (ch - pad * 2);
                chartCtx.beginPath(); chartCtx.setLineDash([4, 4]);
                chartCtx.strokeStyle = 'rgba(251,191,36,0.4)'; chartCtx.lineWidth = 1;
                chartCtx.moveTo(cx, ch - pad); chartCtx.lineTo(cx, cy2); chartCtx.stroke();
                chartCtx.setLineDash([]);
                chartCtx.beginPath(); chartCtx.fillStyle = '#fbbf24';
                chartCtx.arc(cx, cy2, 5, 0, Math.PI * 2); chartCtx.fill();
            }

            // Tau vertical marker line
            const tauX = pad + (tau / tMax) * (cw - pad * 2);
            chartCtx.strokeStyle = 'rgba(167,139,250,0.5)'; chartCtx.lineWidth = 1;
            chartCtx.setLineDash([3, 4]);
            chartCtx.beginPath(); chartCtx.moveTo(tauX, pad); chartCtx.lineTo(tauX, ch - pad); chartCtx.stroke();
            chartCtx.setLineDash([]);
            chartCtx.fillStyle = 'rgba(167,139,250,0.8)'; chartCtx.font = '700 9px JetBrains Mono';
            chartCtx.textAlign = 'left'; chartCtx.fillText('τ', tauX + 4, pad + 12);

            chartCtx.fillStyle = 'rgba(77,95,115,0.7)'; chartCtx.font = '9px JetBrains Mono'; chartCtx.textAlign = 'left';
            chartCtx.fillText(`I(t) = (V/R)(1−e^{−t/τ})`, pad + 4, ch - pad - 4);
            chartCtx.textAlign = 'right';
            chartCtx.fillText(`I_max=${Imax.toFixed(3)}A`, cw - pad - 4, pad + 12);
        };

        const loop = (ts: number) => {
            if (document.hidden) {
                frameId = requestAnimationFrame(loop);
                return;
            }

            const dt = Math.min((ts - lastTs) / 1000, 0.05);
            lastTs = ts;

            if (s2On) {
                tSim += dt;
                Inow = (s2Voltage / s2Resistance) * (1 - Math.exp(-tSim / (s2Inductance / s2Resistance)));
            } else {
                tSim = 0;
                Inow = 0;
            }

            drawCircuit(s2Voltage, s2Resistance, s2Inductance, Inow, s2On);
            drawChart(s2Voltage, s2Resistance, s2Inductance, s2On ? tSim : 0);

            // Direct update inside formula result
            const resVal = document.getElementById('formula-s2-result');
            if (resVal) resVal.textContent = Inow.toFixed(3);

            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(frameId);
    }, [s2On, s2Voltage, s2Resistance, s2Inductance, activeSection]);

    // 3. Maxwell Force Inverse Square Canvas Loop
    useEffect(() => {
        let frameId: number;
        const cv = forceCanvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const SZ = 320;
        cv.width = SZ * dpr; cv.height = SZ * dpr;
        ctx.scale(dpr, dpr);

        let dash = 0;

        const draw = () => {
            if (document.hidden) {
                frameId = requestAnimationFrame(draw);
                return;
            }

            ctx.clearRect(0, 0, SZ, SZ);
            ctx.fillStyle = '#06111e'; ctx.fillRect(0, 0, SZ, SZ);

            const fNorm = Math.min(1, s3Force / 1000);
            const alpha = s3Current / 5;

            // Electromagnet body
            const emX = 30, emY = SZ / 2 - 55;
            ctx.fillStyle = '#0e1d34';
            ctx.beginPath(); ctx.roundRect(emX, emY, 100, 110, 8); ctx.fill();
            ctx.strokeStyle = `rgba(34,211,238,${0.2 + alpha * 0.5})`; ctx.lineWidth = 1.5; ctx.stroke();

            // Windings loops
            for (let i = 0; i < 5; i++) {
                const wy = emY + 15 + i * 16;
                ctx.beginPath();
                ctx.ellipse(emX + 50, wy, 32, 6, 0, 0, Math.PI * 2);
                ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3; ctx.stroke();
            }

            // Metal Core
            ctx.fillStyle = 'rgba(30,58,95,0.9)';
            ctx.fillRect(emX + 38, emY + 5, 24, 100);
            ctx.strokeStyle = 'rgba(100,160,220,0.3)'; ctx.lineWidth = 1; ctx.stroke();

            ctx.fillStyle = '#22d3ee'; ctx.font = '700 9px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText(`N=${s3Turns}`, emX + 50, emY - 8);
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`I=${s3Current.toFixed(2)}A`, emX + 50, emY - 18);

            // Core poles & gap line
            const poleX = emX + 100;
            const gWidth = Math.max(6, Math.min(120, s3Gap * 14));

            ctx.save();
            ctx.strokeStyle = 'rgba(251,191,36,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.moveTo(poleX, SZ / 2 - 30); ctx.lineTo(poleX + gWidth, SZ / 2 - 30); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(251,191,36,0.7)'; ctx.font = '700 9px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText(`g = ${s3Gap.toFixed(1)}mm`, poleX + gWidth / 2, SZ / 2 - 36);
            ctx.restore();

            // Field flux animations
            if (alpha > 0.02) {
                for (let fl = 0; fl < 4; fl++) {
                    const fy = SZ / 2 - 24 + fl * 16;
                    ctx.save();
                    ctx.strokeStyle = `rgba(34,211,238,${alpha * 0.55})`;
                    ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]);
                    ctx.lineDashOffset = -dash;
                    ctx.beginPath(); ctx.moveTo(poleX, fy); ctx.lineTo(poleX + gWidth, fy); ctx.stroke();
                    ctx.restore();
                }
            }

            // Target Steel armature block
            const objBaseX = poleX + 6 + gWidth;
            ctx.fillStyle = `rgba(30,50,80,${0.5 + fNorm * 0.4})`;
            ctx.beginPath(); ctx.roundRect(objBaseX, SZ / 2 - 50, 70, 100, 6); ctx.fill();
            ctx.strokeStyle = `rgba(100,140,200,${0.3 + fNorm * 0.5})`; ctx.lineWidth = 1.5; ctx.stroke();
            
            ctx.fillStyle = '#374151';
            ctx.fillRect(objBaseX, SZ / 2 - 50, 8, 100);
            
            ctx.fillStyle = 'rgba(139,148,158,0.6)'; ctx.font = '700 8px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText('FERRO', objBaseX + 35, SZ / 2 + 5);

            // Force vector arrow
            if (s3Force > 0.1) {
                const aLen = Math.min(80, fNorm * 60 + 10);
                ctx.save();
                ctx.strokeStyle = `rgba(251,113,133,${0.5 + fNorm * 0.5})`; ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(objBaseX + 30, SZ / 2); ctx.lineTo(objBaseX + 30 - aLen, SZ / 2); ctx.stroke();
                ctx.fillStyle = `rgba(251,113,133,${0.5 + fNorm * 0.5})`;
                ctx.beginPath();
                ctx.moveTo(objBaseX + 30 - aLen, SZ / 2);
                ctx.lineTo(objBaseX + 30 - aLen + 12, SZ / 2 - 6);
                ctx.lineTo(objBaseX + 30 - aLen + 12, SZ / 2 + 6);
                ctx.closePath(); ctx.fill();
                ctx.font = '700 10px JetBrains Mono'; ctx.fillStyle = '#fb7185';
                ctx.textAlign = 'center';
                ctx.fillText(`F=${s3Force.toFixed(1)}N`, objBaseX + 30 - aLen / 2, SZ / 2 - 12);
                ctx.restore();
            }

            dash = (dash + 0.6) % 40;
            frameId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(frameId);
    }, [s3Current, s3Turns, s3Gap, s3Force, activeSection]);

    // 4. Bench Experiment Laboratory Setup Canvas Loop
    useEffect(() => {
        let frameId: number;
        const cv = benchCanvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const resize = () => {
            const r = cv.getBoundingClientRect();
            cv.width = r.width * dpr; cv.height = r.height * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener('resize', resize);

        let t = 0;

        const draw = () => {
            if (document.hidden) {
                frameId = requestAnimationFrame(draw);
                return;
            }

            const cw = cv.width / dpr, ch = cv.height / dpr;
            ctx.clearRect(0, 0, cw, ch);
            ctx.fillStyle = '#060d1a'; ctx.fillRect(0, 0, cw, ch);

            // grid background
            ctx.strokeStyle = 'rgba(34,211,238,0.025)'; ctx.lineWidth = 1;
            for (let x = 0; x < cw; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke(); }
            for (let y = 0; y < ch; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }

            // Table shelf line
            ctx.fillStyle = '#0d1829';
            ctx.beginPath(); ctx.roundRect(20, ch - 30, cw - 40, 12, 3); ctx.fill();
            ctx.strokeStyle = 'rgba(56,100,160,0.3)'; ctx.lineWidth = 1; ctx.stroke();

            // ICEL Source unit
            const ps = { x: 30, y: ch - 145, w: 120, h: 115 };
            ctx.fillStyle = '#0f1e35';
            ctx.beginPath(); ctx.roundRect(ps.x, ps.y, ps.w, ps.h, 6); ctx.fill();
            ctx.strokeStyle = 'rgba(34,211,238,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();

            // LCD panel
            ctx.fillStyle = '#001a0a';
            ctx.beginPath(); ctx.roundRect(ps.x + 10, ps.y + 12, ps.w - 20, 38, 3); ctx.fill();
            ctx.strokeStyle = 'rgba(0,255,80,0.3)'; ctx.lineWidth = 1; ctx.stroke();
            
            ctx.fillStyle = '#00e550'; ctx.font = '700 14px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText('24.0V', ps.x + ps.w / 2, ps.y + 36);
            ctx.fillStyle = '#00cc44'; ctx.font = '700 11px JetBrains Mono';
            ctx.fillText('0.632A', ps.x + ps.w / 2, ps.y + 50);

            // adjustment knobs
            [0.3, 0.7].forEach(kx => {
                ctx.beginPath();
                ctx.arc(ps.x + kx * ps.w, ps.y + ps.h - 22, 10, 0, Math.PI * 2);
                ctx.fillStyle = '#1a3a5f'; ctx.fill();
                ctx.strokeStyle = 'rgba(34,211,238,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
            });

            ctx.fillStyle = 'rgba(34,211,238,0.6)'; ctx.font = '700 8px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText('ICEL PS-3005', ps.x + ps.w / 2, ps.y + ps.h - 6);
            
            // banana plugs
            ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.arc(ps.x + 25, ps.y + ps.h - 38, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4d5f73'; ctx.beginPath(); ctx.arc(ps.x + 95, ps.y + ps.h - 38, 5, 0, Math.PI * 2); ctx.fill();

            // Red & Blue hook wires
            ctx.save();
            ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3; ctx.setLineDash([]);
            ctx.beginPath(); ctx.moveTo(ps.x + 25, ps.y + ps.h - 38);
            ctx.bezierCurveTo(ps.x + 80, ps.y + ps.h - 80, cw / 2 - 60, ps.y - 20, cw / 2 - 20, ps.y + 20);
            ctx.stroke();
            
            ctx.strokeStyle = '#1d4ed8';
            ctx.beginPath(); ctx.moveTo(ps.x + 95, ps.y + ps.h - 38);
            ctx.bezierCurveTo(ps.x + 140, ps.y + ps.h - 60, cw / 2 + 20, ps.y - 10, cw / 2 + 30, ps.y + 20);
            ctx.stroke();
            ctx.restore();

            // Electromagnet estator (center)
            const em = { x: cw / 2 - 60, y: ch - 160, w: 120, h: 120 };
            ctx.fillStyle = '#0c1929';
            ctx.beginPath(); ctx.roundRect(em.x, em.y, em.w, em.h, 8); ctx.fill();
            ctx.strokeStyle = 'rgba(251,191,36,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();

            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.ellipse(em.x + em.w / 2, em.y + 20 + i * 16, 36, 7, 0, 0, Math.PI * 2);
                ctx.strokeStyle = '#b45309'; ctx.lineWidth = 4; ctx.stroke();
                ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.stroke();
            }

            ctx.fillStyle = '#1a3a5f';
            ctx.fillRect(em.x + 50, em.y + 8, 20, 104);
            ctx.strokeStyle = 'rgba(100,160,220,0.4)'; ctx.lineWidth = 1; ctx.stroke();

            ctx.fillStyle = 'rgba(251,191,36,0.7)'; ctx.font = '700 8px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText('ESTATOR', em.x + em.w / 2, em.y - 6);
            ctx.fillStyle = 'rgba(34,211,238,0.5)'; ctx.font = '700 7px JetBrains Mono';
            ctx.fillText('500 ESPIRAS · 38Ω', em.x + em.w / 2, em.y + em.h + 12);

            // Magnetic field pulsing glow
            const gPulse = 0.6 + 0.4 * Math.sin(t * 0.05);
            ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 14 * gPulse;
            ctx.strokeStyle = `rgba(34,211,238,${0.25 * gPulse})`;
            ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
            for (let fl = 0; fl < 3; fl++) {
                ctx.beginPath(); ctx.ellipse(em.x + em.w / 2, em.y + em.h / 2, 50 + fl * 18, 20 + fl * 8, 0, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.shadowBlur = 0; ctx.setLineDash([]);

            // Lock (massa de teste)
            const lockX = cw - 110, lockY = ch - 138;
            ctx.fillStyle = '#1e3a5f';
            ctx.beginPath(); ctx.roundRect(lockX, lockY, 68, 90, 6); ctx.fill();
            ctx.strokeStyle = 'rgba(52,211,153,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();

            ctx.beginPath(); ctx.strokeStyle = '#34d399'; ctx.lineWidth = 5;
            ctx.arc(lockX + 34, lockY + 5, 20, Math.PI, 0); ctx.stroke();
            ctx.fillStyle = 'rgba(52,211,153,0.5)'; ctx.font = '700 8px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText('CADEADO', lockX + 34, lockY + 52);
            ctx.fillStyle = 'rgba(52,211,153,0.4)'; ctx.font = '700 7px JetBrains Mono';
            ctx.fillText('(MASSA DE TESTE)', lockX + 34, lockY + 65);

            // Force arrow
            const arX = em.x + em.w + 8, arY = ch - 100;
            ctx.strokeStyle = `rgba(251,113,133,${0.4 + 0.3 * Math.sin(t * 0.07)})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(arX, arY); ctx.lineTo(lockX - 8, arY); ctx.stroke();
            ctx.fillStyle = 'rgba(251,113,133,0.6)'; ctx.font = '700 9px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText('F', arX + (lockX - arX) / 2, arY - 6);

            ctx.fillStyle = 'rgba(77,95,115,0.5)'; ctx.font = '700 8px JetBrains Mono'; ctx.textAlign = 'left';
            ctx.fillText('Bancada IF Goiano · Fonte ICEL PS-3005 + Estator Real', 22, 16);

            t++;
            frameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
        };
    }, [activeSection]);

    return (
        <div 
            style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
            onClick={() => { setInspectId(null); }}
        >
            {/* Scroll progress loading line */}
            <div className="scroll-progress-line">
                <div className="scroll-progress-fill" style={{ width: `${scrollPct}%` }} />
            </div>

            {/* Scroll navigation dot bullets */}
            <div className="slide-dots-indicator">
                {SECTIONS.map((sid, idx) => (
                    <button
                        key={sid}
                        onClick={() => navigateToSection(idx)}
                        className={`slide-dot-btn ${activeSection === idx ? 'active-slide' : ''}`}
                        title={
                            idx === 0 ? 'Início' :
                            idx === 1 ? 'Bobina' :
                            idx === 2 ? 'Circuito RL' :
                            idx === 3 ? 'Força' :
                            idx === 4 ? 'Experimento' : 'Referências'
                        }
                    />
                ))}
            </div>

            {/* Floating HUD inspect popup details */}
            {inspectId && POPUP_DB[inspectId] && (
                <div 
                    className="hud-panel visible" 
                    style={{ left: `${hudCoords.x}px`, top: `${hudCoords.y}px`, zIndex: 1000 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="hud-header-area">
                        <div className="hud-crosshair-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="3" />
                                <line x1="12" y1="2" x2="12" y2="7" />
                                <line x1="12" y1="17" x2="12" y2="22" />
                                <line x1="2" y1="12" x2="7" y2="12" />
                                <line x1="17" y1="12" x2="22" y2="12" />
                            </svg>
                        </div>
                        <div>
                            <div className="hud-header-title-text" style={{ fontSize: '11px' }}>{POPUP_DB[inspectId].title}</div>
                            <div className="hud-header-subtitle-text" style={{ fontSize: '8px' }}>{POPUP_DB[inspectId].sub}</div>
                        </div>
                    </div>
                    <div className="hud-field-row">
                        <div className="hud-field-label-text">Material / Tipo</div>
                        <div className="hud-field-value-text">{POPUP_DB[inspectId].mat}</div>
                    </div>
                    <div className="hud-field-row">
                        <div className="hud-field-label-text">Parâmetro Físico</div>
                        <div className="hud-field-value-text">{POPUP_DB[inspectId].param}</div>
                    </div>
                    <div className="hud-field-row">
                        <div className="hud-field-label-text">Função no Circuito</div>
                        <div className="hud-field-desc-text">{POPUP_DB[inspectId].fn}</div>
                    </div>
                    <div style={{ background: 'rgba(34, 211, 238, 0.05)', borderLeft: '2px solid var(--cyan)', borderRadius: '0 6px 6px 0', padding: '8px 12px', fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.65, marginTop: '10px' }}>
                        {POPUP_DB[inspectId].simple}
                    </div>
                    <button className="hud-close-btn" style={{ minHeight: '34px', padding: '6px' }} onClick={() => setInspectId(null)}>✕ Fechar</button>
                </div>
            )}

            {/* Main Presentation Slides Container */}
            <div 
                ref={containerRef}
                className="tutorial-slide-container"
                onScroll={handleScroll}
            >
                {/* ════ SEÇÃO 0: HERO ════ */}
                <section className="tutorial-slide-section" id="s0">
                    <canvas ref={heroCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
                    <div className="tutorial-section-inner-block" style={{ position: 'relative', zIndex: 2 }}>
                        <div className="badge-hero-announcement">
                            <span>⚡</span> Instituto Federal Goiano · Física Eletromagnetismo
                        </div>
                        <h1 className="title-hero-main">
                            <span style={{ color: 'var(--text-hi)', display: 'block' }}>Como funciona</span>
                            <span className="highlight-cyan" style={{ display: 'block' }}>um Eletroímã?</span>
                        </h1>
                        <p className="description-hero-text">
                            Um ímã que você <strong style={{ color: 'var(--text-hi)' }}>liga e desliga</strong>.
                            Explore as equações reais que governam um freio eletromagnético industrial —
                            do experimento de bancada à simulação interativa.
                        </p>
                        <div className="cta-buttons-row">
                            <button onClick={() => navigateToSection(1)} className="cta-button-btn cta-primary-style">Começar a Explorar ↓</button>
                        </div>
                        <div className="hero-telemetry-stats">
                            <div className="hero-stat-card">
                                <div className="hero-stat-val">4</div>
                                <div className="hero-stat-label">Fórmulas Interativas</div>
                            </div>
                            <div className="hero-stat-card">
                                <div className="hero-stat-val">60Hz</div>
                                <div className="hero-stat-label">Motor Físico</div>
                            </div>
                            <div className="hero-stat-card">
                                <div className="hero-stat-val">500</div>
                                <div className="hero-stat-label">Espiras na Bobina Real</div>
                            </div>
                            <div className="hero-stat-card">
                                <div className="hero-stat-val">21ms</div>
                                <div className="hero-stat-label">Tempo de Resposta (τ)</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════ SEÇÃO 1: BOBINA / AMPÈRE ════ */}
                <section className="tutorial-slide-section" id="s1">
                    <div className="tutorial-section-divider"></div>
                    <div className="tutorial-section-inner-block">
                        <div className="tutorial-eyebrow">
                            <div className="tutorial-eyebrow-line"></div>Lei de Ampère · Seção 01<div className="tutorial-eyebrow-line"></div>
                        </div>
                        <h2 className="tutorial-section-title">A Bobina e o <span>Campo Magnético</span></h2>
                        <p className="tutorial-section-subtitle">Quando a corrente elétrica percorre um fio enrolado em espiral (bobina), ela cria um campo magnético ao redor. Quanto mais espiras e mais corrente, mais forte o ímã.</p>
                        <div className="educational-simplified-note">
                            <span className="emoji-icon">🔌</span> <strong>Linguagem simples:</strong>
                            Imagine que cada volta do fio é um trabalhador empurrando o campo magnético.
                            Mais trabalhadores (N) + mais força de cada um (I) = ímã mais poderoso!
                        </div>

                        <div className="interactive-two-column">
                            {/* Canvas Block */}
                            <div>
                                <canvas ref={coilCanvasRef} style={{ width: '100%', maxWidth: '340px', aspectRatio: '1', borderRadius: '12px', background: 'rgba(4,9,15,0.8)', border: '1px solid var(--border)', display: 'block', margin: '0 auto' }} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <button className={`external-navigation-btn clickable-inspection-spot ${inspectId === 'bobina' ? 'inspecting-active' : ''}`} onClick={(e) => triggerInspect('bobina', e)}>🔍 Bobina (fio)</button>
                                    <button className={`external-navigation-btn clickable-inspection-spot ${inspectId === 'nucleo' ? 'inspecting-active' : ''}`} onClick={(e) => triggerInspect('nucleo', e)}>🔍 Núcleo de Ferro</button>
                                    <button className={`external-navigation-btn clickable-inspection-spot ${inspectId === 'campo' ? 'inspecting-active' : ''}`} onClick={(e) => triggerInspect('campo', e)}>🔍 Campo Magnético</button>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div className="tutorial-slider-controller">
                                    <div className="tutorial-slider-header-row">
                                        <span>Corrente (I)</span>
                                        <span className="value-span">{s1Current.toFixed(2)} A</span>
                                    </div>
                                    <input type="range" className="slider-input-cyan" min="0" max="5" step="0.01" value={s1Current} onChange={(e) => setS1Current(parseFloat(e.target.value))} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                                        <span>0A (desligado)</span><span>5A (máx. fonte ICEL)</span>
                                    </div>
                                </div>
                                <div className="tutorial-slider-controller">
                                    <div className="tutorial-slider-header-row">
                                        <span>Número de Espiras (N)</span>
                                        <span className="value-span">{s1Turns} esp</span>
                                    </div>
                                    <input type="range" className="param-range-slider" min="50" max="1000" step="10" value={s1Turns} onChange={(e) => setS1Turns(parseInt(e.target.value))} />
                                </div>

                                <div className="formula-sheet-box">
                                    <div className="formula-sheet-label">Força Magnetomotriz — Lei de Ampère</div>
                                    <div style={{ fontSize: '18px' }}>ℱ = N · I</div>
                                    <div className="formula-sheet-variables">
                                        N = número de espiras · I = corrente (A)<br />
                                        ℱ = Força Magnetomotriz (A·espiras)
                                    </div>
                                    <div className="formula-sheet-result">{s1MMF} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>A·e</span></div>
                                </div>

                                <div style={{ padding: '14px', background: 'rgba(34,211,238,0.04)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Experimento Real (IF Goiano)
                                    </div>
                                    <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-mid)' }}>
                                        N = 500 esp · I = 0.632A<br />
                                        <span style={{ color: 'var(--green)' }}>ℱ = 500 × 0.632 = <strong style={{ color: 'var(--green)' }}>316 A·e</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════ SEÇÃO 2: CIRCUITO RL ════ */}
                <section className="tutorial-slide-section" id="s2">
                    <div className="tutorial-section-divider"></div>
                    <div className="tutorial-section-inner-block">
                        <div className="tutorial-eyebrow">
                            <div className="tutorial-eyebrow-line"></div>Circuito RL · Seção 02<div className="tutorial-eyebrow-line"></div>
                        </div>
                        <h2 className="tutorial-section-title">A "Preguiça" da <span>Bobina</span></h2>
                        <p className="tutorial-section-subtitle">A bobina não aceita corrente de repente. Ela "resiste" à mudança graças à sua indutância (L). Isso cria um atraso que pode ser calculado com precisão.</p>
                        <div className="educational-simplified-note">
                            <span className="emoji-icon">😴</span> <strong>Linguagem simples:</strong>
                            A bobina é como uma pessoa preguiçosa acordando de manhã — não sai do zero para o máximo de uma vez.
                            Ela leva um tempinho (<strong style={{ color: 'var(--purple)' }}>τ</strong>) para chegar à velocidade total!
                        </div>

                        <div className="interactive-two-column">
                            <div>
                                <canvas ref={circuitCanvasRef} className="interactive-lab-canvas" style={{ height: '240px' }} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('fonte', e)}>🔍 Fonte (V)</button>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('resistor', e)}>🔍 Resistor (R)</button>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('indutor', e)}>🔍 Indutor (L)</button>
                                </div>
                                <canvas ref={rlChartRef} style={{ width: '100%', height: '150px', borderRadius: '10px', background: 'rgba(4,9,15,0.7)', border: '1px solid var(--border)', display: 'block', marginTop: '14px' }} />
                            </div>

                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                    <button className={`circuit-control-toggle-btn ${s2On ? 'btn-inactive-state' : 'btn-active-state'}`} onClick={() => setS2On(!s2On)}>
                                        {s2On ? '⏹ Desliga a Fonte' : '▶ Liga a Fonte'}
                                    </button>
                                    <div className="circuit-response-time-badge">τ = {s2TauMs} ms</div>
                                </div>

                                <div className="tutorial-slider-controller">
                                    <div className="tutorial-slider-header-row">
                                        <span>Tensão (V)</span>
                                        <span className="value-span">{s2Voltage.toFixed(1)} V</span>
                                    </div>
                                    <input type="range" className="slider-input-cyan" min="0" max="32" step="0.5" value={s2Voltage} onChange={(e) => setS2Voltage(parseFloat(e.target.value))} />
                                </div>
                                <div className="tutorial-slider-controller">
                                    <div className="tutorial-slider-header-row">
                                        <span>Resistência (R)</span>
                                        <span className="value-span">{s2Resistance.toFixed(1)} Ω</span>
                                    </div>
                                    <input type="range" className="param-range-slider" min="5" max="100" step="0.5" value={s2Resistance} onChange={(e) => setS2Resistance(parseFloat(e.target.value))} />
                                </div>
                                <div className="tutorial-slider-controller">
                                    <div className="tutorial-slider-header-row">
                                        <span>Indutância (L)</span>
                                        <span className="value-span">{s2Inductance.toFixed(2)} H</span>
                                    </div>
                                    <input type="range" className="param-range-slider" min="0.05" max="3" step="0.05" value={s2Inductance} onChange={(e) => setS2Inductance(parseFloat(e.target.value))} />
                                </div>

                                <div className="formula-sheet-box">
                                    <div className="formula-sheet-label">Equações do Circuito RL</div>
                                    <div style={{ fontSize: '13px', lineHeight: '2' }}>
                                        I<sub>max</sub> = V / R<br />
                                        τ = L / R<br />
                                        I(t) = I<sub>max</sub> · (1 − e<sup>−t/τ</sup>)
                                    </div>
                                    <div className="formula-sheet-variables" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span style={{ color: 'var(--yellow)' }}>I<sub>max</sub> = {s2Imax} A</span>
                                        &nbsp;·&nbsp;
                                        <span style={{ color: 'var(--purple)' }}>τ = {s2TauMs} ms</span>
                                    </div>
                                    <div className="formula-sheet-result" style={{ fontSize: '18px' }}>
                                        I(t) = <span id="formula-s2-result">0.000</span> <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>A</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════ SEÇÃO 3: FORÇA MAGNÉTICA ════ */}
                <section className="tutorial-slide-section" id="s3">
                    <div className="tutorial-section-divider"></div>
                    <div className="tutorial-section-inner-block">
                        <div className="tutorial-eyebrow">
                            <div className="tutorial-eyebrow-line"></div>Lei de Maxwell · Joule · Seção 03<div className="tutorial-eyebrow-line"></div>
                        </div>
                        <h2 className="tutorial-section-title">A <span>Força</span> de Atração</h2>
                        <p className="tutorial-section-subtitle">A força que o eletroímã exerce sobre um objeto de ferro é proporcional ao quadrado da corrente — e inversamente proporcional ao quadrado da distância (entreferro).</p>
                        <div className="educational-simplified-note">
                            <span className="emoji-icon">🧲</span> <strong>Linguagem simples:</strong>
                            Se você dobrar a corrente, a força fica 4× mais forte (não só 2×)!
                            E se você afastar o objeto ao dobro, a força cai para ¼. É uma relação de quadrado!
                        </div>

                        <div className="interactive-two-column">
                            <div>
                                <canvas ref={forceCanvasRef} style={{ width: '100%', maxWidth: '320px', aspectRatio: '1', borderRadius: '12px', background: '#06111e', border: '1px solid var(--border)', display: 'block', margin: '0 auto' }} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('entreferro', e)}>🔍 Entreferro (g)</button>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('armadura', e)}>🔍 Objeto (Sapata)</button>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('joule', e)}>🔍 Efeito Joule</button>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                    <div className="maxwell-force-display-number">{s3Force.toFixed(1)}<span className="display-unit"> N</span></div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>Força de Atração Magnética</div>
                                </div>

                                <div className="tutorial-slider-controller">
                                    <div className="tutorial-slider-header-row">
                                        <span>Corrente (I)</span>
                                        <span className="value-span">{s3Current.toFixed(2)} A</span>
                                    </div>
                                    <input type="range" className="slider-input-cyan" min="0" max="5" step="0.01" value={s3Current} onChange={(e) => setS3Current(parseFloat(e.target.value))} />
                                </div>
                                <div className="tutorial-slider-controller">
                                    <div className="tutorial-slider-header-row">
                                        <span>Espiras (N)</span>
                                        <span className="value-span">{s3Turns} esp</span>
                                    </div>
                                    <input type="range" className="param-range-slider" min="50" max="1000" step="10" value={s3Turns} onChange={(e) => setS3Turns(parseInt(e.target.value))} />
                                </div>
                                <div className="tutorial-slider-controller">
                                    <div className="tutorial-slider-header-row">
                                        <span>Entreferro (g)</span>
                                        <span className="value-span">{s3Gap.toFixed(1)} mm</span>
                                    </div>
                                    <input type="range" className="param-range-slider" min="0.1" max="10" step="0.1" value={s3Gap} onChange={(e) => setS3Gap(parseFloat(e.target.value))} />
                                </div>

                                <div className="formula-sheet-box">
                                    <div className="formula-sheet-label">Força de Maxwell</div>
                                    <div style={{ fontSize: '14px', color: 'var(--cyan)' }}>F = μ₀ · (N·I)² · A / (2·g²)</div>
                                    <div className="formula-sheet-variables">μ₀ = 4π×10⁻⁷ T·m/A · A = 0.01 m² (área do núcleo)</div>
                                </div>

                                <div style={{ marginTop: '14px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Dissipação Térmica — Efeito Joule
                                    </div>
                                    <div className="formula-sheet-box" style={{ background: 'rgba(251,146,60,0.06)', borderColor: 'rgba(251,146,60,0.35)', color: 'var(--orange)', margin: 0 }}>
                                        <div style={{ fontSize: '14px' }}>P = R · I²</div>
                                        <div className="formula-sheet-result" style={{ color: 'var(--orange)', fontSize: '18px', marginTop: '6px' }}>
                                            {s3JoulePower.toFixed(1)} <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>W (calor)</span>
                                        </div>
                                    </div>
                                    <div className="heat-bar-track">
                                        <div className="heat-bar-fill" style={{ width: `${s3JoulePct}%` }} />
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', textAlign: 'right' }}>
                                        {Math.round(s3JoulePct)}% da potência máxima (ICEL 30V/5A limit)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════ SEÇÃO 4: EXPERIMENTO REAL ════ */}
                <section className="tutorial-slide-section" id="s4">
                    <div className="tutorial-section-divider"></div>
                    <div className="tutorial-section-inner-block">
                        <div className="tutorial-eyebrow">
                            <div className="tutorial-eyebrow-line"></div>Validação Experimental · Seção 04<div className="tutorial-eyebrow-line"></div>
                        </div>
                        <h2 className="tutorial-section-title">O <span>Experimento Real</span></h2>
                        <p className="tutorial-section-subtitle">Tudo que você viu até aqui foi testado fisicamente na bancada do IF Goiano, usando a fonte ICEL PS-3005 e o estator real de um freio de equipamento de Raio-X.</p>

                        <div className="interactive-two-column">
                            <div>
                                <canvas ref={benchCanvasRef} style={{ width: '100%', height: '260px', borderRadius: '12px', background: '#060d1a', border: '1px solid var(--border)', display: 'block' }} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('icel', e)}>🔍 Fonte ICEL PS-3005</button>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('estator', e)}>🔍 Estator (Eletroímã)</button>
                                    <button className="external-navigation-btn" onClick={(e) => triggerInspect('carga', e)}>🔍 Massa Ferromagnética</button>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: '14px' }}>
                                    Clique em cada resultado para ver o cálculo:
                                </div>

                                <div className="experiment-card-item validated-ok" onClick={(e) => triggerInspect('res-ohm', e)}>
                                    <div className="experiment-card-checkbox">☑️</div>
                                    <div>
                                        <div className="experiment-card-title">Lei de Ohm Validada</div>
                                        <div className="experiment-card-formula">R = V / I = 24 / I</div>
                                        <div className="experiment-card-readout">I = 0.632 A · R = 38 Ω</div>
                                    </div>
                                </div>
                                <div className="experiment-card-item validated-ok" onClick={(e) => triggerInspect('res-mmf', e)}>
                                    <div className="experiment-card-checkbox">☑️</div>
                                    <div>
                                        <div className="experiment-card-title">Força Magnetomotriz</div>
                                        <div className="experiment-card-formula">ℱ = N · I = 500 × 0.632</div>
                                        <div className="experiment-card-readout">ℱ = 316 A·espiras</div>
                                    </div>
                                </div>
                                <div className="experiment-card-item validated-ok" onClick={(e) => triggerInspect('res-joule', e)}>
                                    <div className="experiment-card-checkbox">☑️</div>
                                    <div>
                                        <div className="experiment-card-title">Efeito Joule (aquecimento)</div>
                                        <div className="experiment-card-formula">P = R · I² = 38 × (0.632)²</div>
                                        <div className="experiment-card-readout">P = 15.2 W</div>
                                    </div>
                                </div>
                                <div className="experiment-card-item validated-ok" onClick={(e) => triggerInspect('res-tau', e)}>
                                    <div className="experiment-card-checkbox">☑️</div>
                                    <div>
                                        <div className="experiment-card-title">Tempo de Resposta (τ)</div>
                                        <div className="experiment-card-formula">τ = L / R = 0.8 / 38</div>
                                        <div className="experiment-card-readout">τ = 21.1 ms</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════ SEÇÃO 5: REFERÊNCIAS ════ */}
                <section className="tutorial-slide-section" id="s5">
                    <div className="tutorial-section-divider"></div>
                    <div className="tutorial-section-inner-block" style={{ maxWidth: '760px' }}>
                        <div className="tutorial-eyebrow">
                            <div className="tutorial-eyebrow-line"></div>Referências · Seção 05<div className="tutorial-eyebrow-line"></div>
                        </div>
                        <h2 className="tutorial-section-title">Referências <span>Bibliográficas</span></h2>

                        <div className="academic-ref-item">
                            <div className="academic-ref-icon-badge">📘</div>
                            <div>
                                <div className="academic-ref-title-text">Fundamentos de Física, Volume 3: Eletromagnetismo</div>
                                <div className="academic-ref-details-text">HALLIDAY, D.; RESNICK, R.; WALKER, J. — 10ª ed. Rio de Janeiro: LTC, 2016.</div>
                            </div>
                        </div>
                        <div className="academic-ref-item">
                            <div className="academic-ref-icon-badge">📗</div>
                            <div>
                                <div className="academic-ref-title-text">Elementos de Eletromagnetismo</div>
                                <div className="academic-ref-details-text">SADIKU, M. N. O. — 5ª ed. Porto Alegre: Bookman, 2012.</div>
                            </div>
                        </div>

                        <div className="team-credits-card">
                            <div className="team-credits-left">
                                <div className="credits-inst">Instituto Federal Goiano · Física Eletromagnetismo</div>
                                <div className="credits-members">Mateus de Paula Rezende &amp; Felipe Gabriel Rodrigues</div>
                                <div className="credits-class">Relatório de Atividade Prática · Demonstração de Eletromagnetismo Industrial</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
