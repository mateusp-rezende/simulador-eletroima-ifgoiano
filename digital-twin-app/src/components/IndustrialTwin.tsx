import React, { useEffect, useRef, useState } from 'react';

const DEFAULTS = { R: 38.0, L: 0.8, N: 500, g: 0.5 };

interface PhysicsState {
    R: number;
    L: number;
    N: number;
    g: number;
    targetV: number;
    I: number;
    rpm: number;
    maxRpm: number;
    motorTorque: number;
    history: Array<{ v: number; i: number; r: number; f: number }>;
    discRotAngle: number;
    fieldDash: number;
    tablePhase: number;
}

const COMPONENT_DB: Record<string, { title: string; material: string; param: string; desc: string }> = {
    coil: {
        title: 'Bobina Solenoide',
        material: 'Fio de Cobre Esmaltado (Cu AWG 24)',
        param: 'L = 0.8 H · N = 500 esp · R = 38 Ω',
        desc: 'Converte energia elétrica em campo magnético. A indução (L) impõe o atraso dI/dt = (V−R·I)/L, visível no gráfico. A Força Magnetomotriz ℰ = N·I define o fluxo que trava a mesa de Raio-X.'
    },
    core: {
        title: 'Carcaça do Estator',
        material: 'Aço SAE Alta Permeabilidade Magnética (μr ≈ 2000)',
        param: 'μr = 2000 · Relutância mínima',
        desc: 'Caminho de baixa relutância para o fluxo magnético. Canaliza as linhas de campo da bobina e as concentra sobre a armadura, maximizando a força de atração e garantindo a imobilidade total da mesa durante a emissão de radiação.'
    },
    pad: {
        title: 'Armadura • Sapata de Atrito',
        material: 'Aço Carbono SAE + Lona de Fricção (μk ≈ 0.45)',
        param: 'Curso: 0.5–5 mm · F = k(N·I)²/g²',
        desc: 'Peça móvel atraída eletromagneticamente. A força segue a Lei do Quadrado Inverso: dobrar o entreferro (g) reduz a força a ¼. O revestimento de fricção converte energia cinética em calor, parando a mesa.'
    },
    disc: {
        title: 'Disco do Freio (Rotor)',
        material: 'Liga Ferro-Cromo · Alta dissipação térmica',
        param: 'ω = RPM·2π/60 rad/s · τ = I·α',
        desc: 'Fixo ao mecanismo de translação da mesa de Raio-X. Gira livremente quando o freio está desenergizado. Ao ser pressionado pela armadura, o torque de frenagem τ = F·r·μ desacelera o sistema até imobilidade absoluta.'
    },
    shaft: {
        title: 'Eixo de Transmissão',
        material: 'Aço Inoxidável 17-4PH (Alta Resistência)',
        param: 'J = Momento de Inércia · α = τ/J [rad/s²]',
        desc: 'Transfere o movimento ao sistema de translação da mesa. O momento de inércia J determina a taxa de desaceleração α = τ/J. A imobilidade absoluta deste eixo é crítica durante a emissão de radiação ionizante.'
    },
    mesa: {
        title: 'Mesa de Exame (Tablier)',
        material: 'Fibra de Carbono + Estrutura em Liga de Alumínio',
        param: 'Curso: ±200 mm · v_max ≈ 0.35 m/s · Carga: 250 kg',
        desc: 'Plataforma de posicionamento do paciente. Desliza sobre guias lineares de baixo atrito. O freio eletromagnético garante posicionamento repetitível com precisão de ±0.1 mm — essencial para reprodutibilidade do exame.'
    },
    emissor: {
        title: 'Emissor de Raios X (Tubo Rx)',
        material: 'Cátodo de Tungstênio · Ânodo Rotativo de Molibdênio',
        param: '70–125 kV · 200–400 mA · Tempo: 1–80 ms',
        desc: 'Gera radiação ionizante por bremsstrahlung (travamento de elétrons). Qualquer movimento da mesa durante a exposição causa borramento (motion blur) e compromete o diagnóstico. Por isso o freio DEVE travar completamente antes do disparo.'
    },
    detector: {
        title: 'Detector Digital de Painel Plano (FPD)',
        material: 'Seleneto de Amórfio (a-Se) ou Iodeto de Césio (CsI)',
        param: 'Resolução: 3.5 lp/mm · DQE: 65%',
        desc: 'Converte fótons de raios X em sinal elétrico digital. Pixels de 85–200 μm. Qualquer desalinhamento entre emissor, objeto e detector reduz drasticamente a qualidade diagnóstica, justificando a precisão do sistema de frenagem.'
    },
    gantry: {
        title: 'Gantry • Coluna de Suporte',
        material: 'Aço SAE 1020 Zincado · Perfil Estrutural',
        param: 'Rigidez: > 50 kN/mm · Vibrações < 10 Hz amortecidas',
        desc: 'Estrutura mecânica que sustenta o braço do emissor e os trilhos da mesa. Projetado para rigidez máxima — vibrações na coluna se propagariam para a mesa e degradariam a imagem mesmo com o freio ativado.'
    }
};

export const IndustrialTwin: React.FC = () => {
    // Sliders state controlled by React
    const [sliderV, setSliderV] = useState(0);
    const [sliderR, setSliderR] = useState(DEFAULTS.R);
    const [sliderL, setSliderL] = useState(DEFAULTS.L);
    const [sliderN, setSliderN] = useState(DEFAULTS.N);
    const [sliderG, setSliderG] = useState(DEFAULTS.g);

    // Layout states
    const [macroState, setMacroState] = useState<'normal' | 'collapsed' | 'maximized'>('normal');
    const [detailState, setDetailState] = useState<'normal' | 'collapsed' | 'maximized'>('normal');

    // Component inspection popup state
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
    const [hudCoords, setHudCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Canvas refs
    const macroCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const liveChartRef = useRef<HTMLCanvasElement | null>(null);

    // Fast mutable physics state to keep animation loops at 60Hz
    const sysRef = useRef<PhysicsState>({
        R: DEFAULTS.R,
        L: DEFAULTS.L,
        N: DEFAULTS.N,
        g: DEFAULTS.g,
        targetV: 0,
        I: 0,
        rpm: 1500,
        maxRpm: 1500,
        motorTorque: 5,
        history: Array(100).fill(null).map(() => ({ v: 0, i: 0, r: 1500, f: 0 })),
        discRotAngle: 0,
        fieldDash: 0,
        tablePhase: 0
    });

    // Refs for DOM nodes to perform zero-latency updates outside React render cycle
    const valVoltageRef = useRef<HTMLSpanElement | null>(null);
    const valCurrentRef = useRef<HTMLSpanElement | null>(null);
    const valForceRef = useRef<HTMLSpanElement | null>(null);
    const valRPMRef = useRef<HTMLSpanElement | null>(null);
    const valMMFRef = useRef<HTMLSpanElement | null>(null);

    const barCurrentRef = useRef<HTMLDivElement | null>(null);
    const barForceRef = useRef<HTMLDivElement | null>(null);
    const barRPMRef = useRef<HTMLDivElement | null>(null);

    const subCurrentMaxRef = useRef<HTMLDivElement | null>(null);
    const statusBadgeRef = useRef<HTMLSpanElement | null>(null);
    const statusTextRef = useRef<HTMLSpanElement | null>(null);

    const fmeaContainerRef = useRef<HTMLDivElement | null>(null);
    const fmeaPanelRef = useRef<HTMLDivElement | null>(null);

    // Hardware SVG animations refs
    const uiDiscRef = useRef<HTMLDivElement | null>(null);
    const uiCoilRef = useRef<HTMLDivElement | null>(null);
    const uiPadRef = useRef<HTMLDivElement | null>(null);
    const uiField1Ref = useRef<HTMLDivElement | null>(null);
    const uiField2Ref = useRef<HTMLDivElement | null>(null);

    // Sync React slider values with Ref state
    useEffect(() => { sysRef.current.targetV = sliderV; }, [sliderV]);
    useEffect(() => { sysRef.current.R = sliderR; }, [sliderR]);
    useEffect(() => { sysRef.current.L = sliderL; }, [sliderL]);
    useEffect(() => { sysRef.current.N = sliderN; }, [sliderN]);
    useEffect(() => { sysRef.current.g = sliderG; }, [sliderG]);

    // Reset parameters handler
    const resetPhysics = () => {
        setSliderR(DEFAULTS.R);
        setSliderL(DEFAULTS.L);
        setSliderN(DEFAULTS.N);
        setSliderG(DEFAULTS.g);
    };

    // Component inspection click handler
    const inspectComponent = (id: string, clientX: number, clientY: number) => {
        setSelectedComponent(id);
        const margin = 12;
        const panelW = 308;
        const panelH = 280;
        let px = clientX + 18;
        let py = clientY - 20;

        if (px + panelW > window.innerWidth - margin) px = clientX - panelW - 12;
        if (py + panelH > window.innerHeight - margin) py = window.innerHeight - panelH - margin;
        if (py < margin) py = margin;

        setHudCoords({ x: px, y: py });
    };

    const closeHud = () => {
        setSelectedComponent(null);
    };

    // Physics & Canvas animation loops
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();
        let macroTableHistory: number[] = [];
        let activeFmeaKeys = '';

        const resizeCanvases = () => {
            const dpr = window.devicePixelRatio || 1;
            
            if (macroCanvasRef.current) {
                const cv = macroCanvasRef.current;
                cv.width = Math.round(cv.clientWidth * dpr);
                cv.height = Math.round(cv.clientHeight * dpr);
            }
            if (liveChartRef.current) {
                const cv = liveChartRef.current;
                const rect = cv.getBoundingClientRect();
                cv.width = Math.round(rect.width * dpr);
                cv.height = Math.round(rect.height * dpr);
            }
        };

        resizeCanvases();
        window.addEventListener('resize', resizeCanvases);

        const loop = (timestamp: number) => {
            if (document.hidden) {
                lastTime = timestamp;
                animationFrameId = requestAnimationFrame(loop);
                return;
            }
            let dt = (timestamp - lastTime) / 1000;
            if (dt > 0.1) dt = 0.016;
            lastTime = timestamp;

            const sys = sysRef.current;

            // ── STEP 1: RL circuit (analytical update to avoid stiff ODE instability)
            const I_final = sys.R > 0 ? (sys.targetV / sys.R) : 0;
            if (sys.R > 0) {
                const tau = sys.L / sys.R;
                sys.I = I_final + (sys.I - I_final) * Math.exp(-dt / tau);
            } else {
                sys.I += (sys.targetV / sys.L) * dt;
            }
            if (sys.I < 0) sys.I = 0;

            // ── STEP 2: Maxwell force (F ∝ (N·I)² / g²)
            const MMF = sys.N * sys.I;
            const g_norm = sys.g / DEFAULTS.g;
            const MMF_nom = DEFAULTS.N * (24 / DEFAULTS.R);
            let forcePercent = Math.pow(MMF / MMF_nom, 2) / Math.pow(g_norm, 2);
            forcePercent = Math.min(1, Math.max(0, forcePercent));

            // ── STEP 3: Kinematics
            let isLocked = false;
            let isBraking = false;
            if (forcePercent > 0.04) {
                sys.rpm -= forcePercent * 3500 * dt;
                if (sys.rpm < 0) sys.rpm = 0;
                isBraking = true;
            } else {
                sys.rpm += sys.motorTorque * 100 * dt;
                if (sys.rpm > sys.maxRpm) sys.rpm = sys.maxRpm;
            }
            if (sys.rpm === 0) {
                isLocked = true;
                isBraking = false;
            }

            // ── Detail visual positions
            sys.discRotAngle = (sys.discRotAngle + (sys.rpm / 60) * 360 * dt) % 360;
            sys.fieldDash = (sys.fieldDash + 1.5) % 100;

            // ── Table oscillation (for macro view)
            const tableHz = (sys.rpm / sys.maxRpm) * 0.22;
            sys.tablePhase += tableHz * 2 * Math.PI * dt;

            // ── Update Telemetry Elements directly
            if (valVoltageRef.current) valVoltageRef.current.innerHTML = `${sys.targetV.toFixed(1)}<span style="font-size:13px;color:var(--text-mid);font-weight:400;"> V</span>`;
            if (valCurrentRef.current) valCurrentRef.current.textContent = sys.I.toFixed(3);
            if (valForceRef.current) valForceRef.current.textContent = (forcePercent * 100).toFixed(0);
            if (valRPMRef.current) valRPMRef.current.textContent = Math.floor(sys.rpm).toString();
            if (valMMFRef.current) valMMFRef.current.textContent = MMF.toFixed(0);

            const maxI = sys.R > 0 ? (24 / sys.R) : 0;
            if (barCurrentRef.current) barCurrentRef.current.style.width = `${Math.min(100, (sys.I / (maxI || 1)) * 100)}%`;
            if (barForceRef.current) barForceRef.current.style.width = `${forcePercent * 100}%`;
            if (barRPMRef.current) barRPMRef.current.style.width = `${(sys.rpm / sys.maxRpm) * 100}%`;

            if (subCurrentMaxRef.current) subCurrentMaxRef.current.textContent = `Lim: ${maxI.toFixed(3)} A (V/R)`;

            if (statusBadgeRef.current && statusTextRef.current) {
                if (isLocked) {
                    statusBadgeRef.current.className = 'indicator-badge status-locked-style';
                    statusTextRef.current.textContent = 'Mesa Travada';
                } else if (isBraking) {
                    statusBadgeRef.current.className = 'indicator-badge status-braking-style';
                    statusTextRef.current.textContent = 'Frenagem Ativa';
                } else {
                    statusBadgeRef.current.className = 'indicator-badge status-free-style';
                    statusTextRef.current.textContent = 'Mesa em Movimento';
                }
            }

            // ── FMEA Checks
            const fmeaAlerts: Array<{ type: string; code: string; msg: string }> = [];
            if (sys.R > 60) fmeaAlerts.push({ type: 'warn', code: 'FMEA-01', msg: `R=${sys.R.toFixed(0)}Ω excessivo — aquecimento Joule. Corrente caiu ${((1 - 24 / sys.R / (24 / DEFAULTS.R)) * 100).toFixed(0)}% · Risco: freio escorregando.` });
            if (sys.R > 80) fmeaAlerts.push({ type: 'error', code: 'FMEA-02', msg: `CRÍTICO: R=${sys.R.toFixed(0)}Ω · I_max=${(24 / sys.R).toFixed(3)}A insuficiente. Mesa pode se mover com freio "ativo".` });
            if (sys.g > 2.0) fmeaAlerts.push({ type: 'warn', code: 'FMEA-03', msg: `Entreferro g=${sys.g.toFixed(1)}mm — desgaste crítico da lona. Força ÷${((sys.g / DEFAULTS.g) ** 2).toFixed(1)}x vs. nominal.` });
            if (sys.g > 3.5) fmeaAlerts.push({ type: 'error', code: 'FMEA-04', msg: `FALHA MECÂNICA: g=${sys.g.toFixed(1)}mm. Substituição imediata da lona necessária.` });
            if (sys.N < 150) fmeaAlerts.push({ type: 'warn', code: 'FMEA-05', msg: `N=${sys.N} espiras insuficientes. Torque de frenagem comprometido.` });
            if (forcePercent > 0.8 && sys.rpm > 800) fmeaAlerts.push({ type: 'warn', code: 'FMEA-06', msg: `Alta energia de frenagem: Q = ½·J·ω². Risco de sobreaquecimento do disco.` });

            const newFmeaKeys = fmeaAlerts.map(a => a.code).sort().join('|');
            if (newFmeaKeys !== activeFmeaKeys) {
                activeFmeaKeys = newFmeaKeys;
                if (fmeaPanelRef.current && fmeaContainerRef.current) {
                    fmeaPanelRef.current.innerHTML = '';
                    if (fmeaAlerts.length > 0) {
                        fmeaContainerRef.current.style.display = 'block';
                        fmeaAlerts.forEach(a => {
                            const d = document.createElement('div');
                            d.className = `fmea-warning-box fmea-${a.type}-style`;
                            d.innerHTML = `<span class="fmea-alert-icon">${a.type === 'error' ? '🚨' : '⚠️'}</span><div><strong>${a.code}</strong> — ${a.msg}</div>`;
                            fmeaPanelRef.current?.appendChild(d);
                        });
                    } else {
                        fmeaContainerRef.current.style.display = 'none';
                    }
                }
            }

            // ── SVG visual animation loops
            if (uiDiscRef.current) {
                if (sys.rpm > 0) {
                    const duration = 60 / sys.rpm;
                    uiDiscRef.current.style.animation = `spinning-disc ${duration}s linear infinite`;
                } else {
                    uiDiscRef.current.style.animation = 'none';
                }
            }
            if (uiCoilRef.current) {
                const glow = forcePercent * 20;
                uiCoilRef.current.style.boxShadow = `inset 0 0 15px rgba(0,0,0,0.8), 0 0 ${glow}px rgba(34, 211, 238, ${forcePercent * 0.8})`;
            }
            if (uiField1Ref.current) uiField1Ref.current.style.opacity = forcePercent.toString();
            if (uiField2Ref.current) uiField2Ref.current.style.opacity = (forcePercent * 0.7).toString();
            if (uiPadRef.current) {
                const padMovement = forcePercent * 18;
                uiPadRef.current.style.transform = `translateY(${padMovement}px)`;
            }

            // ── Draw Macro View
            if (macroCanvasRef.current) {
                const cv = macroCanvasRef.current;
                const mCtx = cv.getContext('2d');
                if (mCtx) {
                    const dpr = window.devicePixelRatio || 1;
                    const cw = cv.width / dpr;
                    const ch = cv.height / dpr;

                    mCtx.save();
                    mCtx.scale(dpr, dpr);
                    mCtx.clearRect(0, 0, cw, ch);

                    // Gantry column (left)
                    const colX = 20, colW = 36;
                    mCtx.fillStyle = '#0f1d33';
                    mCtx.fillRect(colX, 14, colW, ch - 28);
                    mCtx.strokeStyle = 'rgba(34,211,238,0.2)'; mCtx.lineWidth = 1;
                    mCtx.strokeRect(colX, 14, colW, ch - 28);
                    
                    // Column stripes
                    mCtx.fillStyle = 'rgba(34,211,238,0.06)';
                    for (let sy = 24; sy < ch - 28; sy += 18) {
                        mCtx.fillRect(colX + 3, sy, colW - 6, 2);
                    }

                    // Arm and Tube (support rails)
                    const tubeX = Math.round(cw * 0.42);
                    const armY = Math.round(ch * 0.3);
                    mCtx.fillStyle = '#0f1e35';
                    mCtx.fillRect(colX + colW, armY - 5, tubeX - (colX + colW) + 20, 10);
                    mCtx.strokeStyle = 'rgba(56,139,253,0.35)'; mCtx.strokeRect(colX + colW, armY - 5, tubeX - (colX + colW) + 20, 10);

                    // X-Ray Tube block
                    const tbW = 70, tbH = 44;
                    const tbX = tubeX - tbW / 2, tbY = armY - tbH - 4;
                    mCtx.fillStyle = '#091526';
                    mCtx.beginPath(); mCtx.roundRect(tbX, tbY, tbW, tbH, 4); mCtx.fill();
                    mCtx.strokeStyle = 'rgba(34,211,238,0.25)'; mCtx.lineWidth = 1;
                    mCtx.beginPath(); mCtx.roundRect(tbX, tbY, tbW, tbH, 4); mCtx.stroke();
                    mCtx.fillStyle = 'rgba(34,211,238,0.2)'; mCtx.font = '700 7px JetBrains Mono'; mCtx.textAlign = 'center';
                    mCtx.fillText('TUBO RX EMISSOR', tubeX, tbY + 12);
                    mCtx.fillStyle = 'rgba(77,95,115,0.7)'; mCtx.font = '6px JetBrains Mono';
                    mCtx.fillText('IFG-MED-300', tubeX, tbY + 24);

                    // Collimator aperture
                    mCtx.fillStyle = '#050c1a';
                    mCtx.fillRect(tbX + 14, armY - 3, tbW - 28, 7);
                    mCtx.strokeStyle = 'rgba(34,211,238,0.35)'; mCtx.lineWidth = 1;
                    mCtx.strokeRect(tbX + 14, armY - 3, tbW - 28, 7);

                    // Radiation cone
                    if (sys.targetV > 0.3) {
                        const ca = (sys.targetV / 24) * 0.07;
                        const coneBaseY = ch * 0.55 - 36;
                        const spread = (coneBaseY - (armY + 4)) * 0.38;
                        mCtx.beginPath();
                        mCtx.moveTo(tubeX - 18, armY + 4);
                        mCtx.lineTo(tubeX + 18, armY + 4);
                        mCtx.lineTo(tubeX + spread, coneBaseY);
                        mCtx.lineTo(tubeX - spread, coneBaseY);
                        mCtx.closePath();
                        mCtx.fillStyle = `rgba(34,211,238,${ca})`;
                        mCtx.fill();
                        mCtx.setLineDash([4, 4]);
                        mCtx.strokeStyle = `rgba(34,211,238,${ca * 2.5})`; mCtx.lineWidth = 0.8;
                        mCtx.stroke(); mCtx.setLineDash([]);
                    }

                    // Track / Linear rail system
                    const railLeft = colX + colW + 4;
                    const railRight = cw - 14;
                    const trackY = Math.round(ch * 0.55);
                    mCtx.fillStyle = '#172d4a';
                    mCtx.fillRect(railLeft, trackY - 6, railRight - railLeft, 6);
                    mCtx.fillStyle = 'rgba(100,160,220,0.28)';
                    mCtx.fillRect(railLeft, trackY - 6, railRight - railLeft, 1.5);
                    mCtx.fillStyle = '#172d4a';
                    mCtx.fillRect(railLeft, trackY + 4, railRight - railLeft, 6);
                    mCtx.fillStyle = 'rgba(5,12,26,0.9)';
                    mCtx.fillRect(railLeft, trackY - 1, railRight - railLeft, 5);

                    // End-stops
                    [[railLeft - 2, 8], [railRight - 6, 8]].forEach(([ex, ew]) => {
                        mCtx.fillStyle = '#0d1829';
                        mCtx.fillRect(ex, trackY - 16, ew, 34);
                        mCtx.strokeStyle = 'rgba(251,113,133,0.3)'; mCtx.lineWidth = 1;
                        mCtx.strokeRect(ex, trackY - 16, ew, 34);
                    });

                    mCtx.fillStyle = 'rgba(56,100,160,0.4)';
                    mCtx.font = '7px JetBrains Mono'; mCtx.textAlign = 'left';
                    mCtx.fillText('GUIA LINEAR · LM RAIL', railLeft + 6, trackY + 14);

                    // Motion ghost trail
                    const speedFactor = sys.rpm / sys.maxRpm;
                    const amplitude = Math.min(cw * 0.24, 120);
                    const tableCX = cw * 0.5;
                    const tableX = tableCX + amplitude * Math.sin(sys.tablePhase);
                    const tableW = 158, tableH = 34;
                    const tableTop = trackY - tableH - 2;

                    macroTableHistory.forEach((hx, idx) => {
                        const a = (idx / macroTableHistory.length) * 0.07 * speedFactor;
                        if (a < 0.004) return;
                        mCtx.fillStyle = `rgba(22,50,80,${a})`;
                        mCtx.beginPath(); mCtx.roundRect(hx - tableW / 2, tableTop, tableW, tableH, 4); mCtx.fill();
                    });
                    macroTableHistory.push(tableX);
                    if (macroTableHistory.length > 10) macroTableHistory.shift();

                    // Table platform
                    const tLeft = tableX - tableW / 2;
                    const tableBodyColor = isLocked ? '#0e1b2e' : '#162840';
                    mCtx.fillStyle = tableBodyColor;
                    mCtx.beginPath(); mCtx.roundRect(tLeft, tableTop, tableW, tableH, 4); mCtx.fill();

                    const topSurf = isLocked ? 'rgba(70,110,170,0.45)' : 'rgba(110,170,230,0.70)';
                    mCtx.fillStyle = topSurf;
                    mCtx.beginPath(); mCtx.roundRect(tLeft, tableTop, tableW, 7, [4, 4, 0, 0]); mCtx.fill();

                    // Sheen gradient
                    const sh = mCtx.createLinearGradient(tLeft, tableTop, tLeft + tableW, tableTop);
                    sh.addColorStop(0, 'rgba(255,255,255,0)');
                    sh.addColorStop(0.5, `rgba(255,255,255,${isLocked ? 0.03 : 0.08})`);
                    sh.addColorStop(1, 'rgba(255,255,255,0)');
                    mCtx.fillStyle = sh; mCtx.fillRect(tLeft, tableTop, tableW, 7);

                    const tb = isLocked ? 'rgba(251,113,133,0.75)' : (isBraking ? 'rgba(251,191,36,0.55)' : 'rgba(34,139,253,0.35)');
                    mCtx.strokeStyle = tb; mCtx.lineWidth = isLocked ? 1.5 : 1;
                    mCtx.beginPath(); mCtx.roundRect(tLeft, tableTop, tableW, tableH, 4); mCtx.stroke();

                    // Slide blocks
                    [[tLeft + 12, 8], [tLeft + tableW - 20, 8]].forEach(([sx, sw]) => {
                        mCtx.fillStyle = '#1e3a5f';
                        mCtx.fillRect(sx, trackY - 6, sw, 10);
                    });

                    mCtx.fillStyle = 'rgba(140,185,225,0.85)';
                    mCtx.font = '700 8px JetBrains Mono'; mCtx.textAlign = 'center';
                    mCtx.fillText('MESA DE EXAME', tableX, tableTop - 5);

                    // Brake housing
                    const bhW = 62, bhH = 22;
                    const bhX = tableX - bhW / 2, bhY = trackY + 4;
                    const bhBg = isLocked ? '#280a0c' : (isBraking ? '#231a06' : '#0a1422');
                    mCtx.fillStyle = bhBg;
                    mCtx.beginPath(); mCtx.roundRect(bhX, bhY, bhW, bhH, 3); mCtx.fill();
                    const bhBd = isLocked ? 'rgba(251,113,133,0.65)' : (isBraking ? 'rgba(251,191,36,0.5)' : 'rgba(167,139,250,0.3)');
                    mCtx.strokeStyle = bhBd; mCtx.lineWidth = 1;
                    mCtx.beginPath(); mCtx.roundRect(bhX, bhY, bhW, bhH, 3); mCtx.stroke();

                    const ledCol = isLocked ? '#fb7185' : (isBraking ? '#fbbf24' : '#34d399');
                    const ledPulse = isBraking ? (0.65 + 0.35 * Math.sin(Date.now() * 0.012)) : (isLocked ? (0.7 + 0.3 * Math.sin(Date.now() * 0.008)) : 1);
                    mCtx.fillStyle = ledCol;
                    mCtx.shadowColor = ledCol; mCtx.shadowBlur = 7 * ledPulse;
                    mCtx.beginPath(); mCtx.arc(bhX + bhW - 10, bhY + bhH / 2, 3.5, 0, Math.PI * 2); mCtx.fill();
                    mCtx.shadowBlur = 0;

                    const bhLabel = isLocked ? 'TRAVADO' : (isBraking ? 'FREANDO' : 'LIVRE');
                    mCtx.fillStyle = ledCol;
                    mCtx.font = '700 7px JetBrains Mono'; mCtx.textAlign = 'left';
                    mCtx.fillText(bhLabel, bhX + 7, bhY + 14);

                    // Zoom indicator lines
                    mCtx.setLineDash([2, 3]);
                    mCtx.strokeStyle = 'rgba(167,139,250,0.45)'; mCtx.lineWidth = 1;
                    mCtx.strokeRect(bhX - 5, bhY - 3, bhW + 10, bhH + 6);
                    mCtx.setLineDash([]);
                    mCtx.fillStyle = 'rgba(167,139,250,0.65)';
                    mCtx.font = '700 7px JetBrains Mono'; mCtx.textAlign = 'center';
                    mCtx.fillText('ZOOM ↓', tableX, bhY + bhH + 11);

                    // Motion direction arrow
                    if (speedFactor > 0.04 && !isLocked) {
                        const vel = Math.cos(sys.tablePhase);
                        const dir = vel >= 0 ? 1 : -1;
                        const aa = Math.min(1, speedFactor * 1.4);
                        const ay = tableTop + tableH / 2;
                        mCtx.strokeStyle = `rgba(34,211,238,${aa * 0.75})`; mCtx.lineWidth = 1.5;
                        mCtx.beginPath();
                        mCtx.moveTo(tableX + dir * (tableW / 2 + 3), ay);
                        mCtx.lineTo(tableX + dir * (tableW / 2 + 20), ay);
                        mCtx.stroke();
                        mCtx.fillStyle = `rgba(34,211,238,${aa * 0.75})`;
                        const ax = tableX + dir * (tableW / 2 + 22);
                        mCtx.beginPath();
                        mCtx.moveTo(ax, ay); mCtx.lineTo(ax - dir * 8, ay - 5); mCtx.lineTo(ax - dir * 8, ay + 5);
                        mCtx.closePath(); mCtx.fill();
                    }

                    // Position ruler
                    const rulerY = 12;
                    mCtx.strokeStyle = 'rgba(56,100,160,0.28)'; mCtx.lineWidth = 1;
                    mCtx.beginPath(); mCtx.moveTo(railLeft, rulerY); mCtx.lineTo(railRight, rulerY); mCtx.stroke();
                    for (let tx = railLeft; tx <= railRight; tx += 35) {
                        mCtx.beginPath(); mCtx.moveTo(tx, rulerY - 2); mCtx.lineTo(tx, rulerY + 2); mCtx.stroke();
                    }
                    mCtx.setLineDash([3, 3]);
                    mCtx.strokeStyle = 'rgba(34,211,238,0.12)';
                    mCtx.beginPath(); mCtx.moveTo(tableCX, rulerY + 4); mCtx.lineTo(tableCX, tableTop - 5); mCtx.stroke();
                    mCtx.setLineDash([]);
                    mCtx.fillStyle = '#22d3ee';
                    mCtx.shadowColor = 'rgba(34,211,238,0.6)'; mCtx.shadowBlur = 6;
                    mCtx.beginPath(); mCtx.arc(tableX, rulerY, 3.5, 0, Math.PI * 2); mCtx.fill();
                    mCtx.shadowBlur = 0;

                    // Detector flat panel
                    const dtW = 90, dtH = 12;
                    const dtX = tubeX - dtW / 2, dtY = ch - 18;
                    mCtx.fillStyle = '#0a1422';
                    mCtx.beginPath(); mCtx.roundRect(dtX, dtY, dtW, dtH, 2); mCtx.fill();
                    mCtx.strokeStyle = 'rgba(34,211,238,0.18)'; mCtx.lineWidth = 1;
                    mCtx.beginPath(); mCtx.roundRect(dtX, dtY, dtW, dtH, 2); mCtx.stroke();
                    mCtx.fillStyle = 'rgba(34,211,238,0.28)';
                    mCtx.font = '7px JetBrains Mono'; mCtx.textAlign = 'center';
                    mCtx.fillText('DETECTOR FPD', tubeX, dtY + 9);

                    // Velocity readout text
                    const vDisplay = (Math.abs(Math.cos(sys.tablePhase)) * speedFactor * 0.32).toFixed(2);
                    mCtx.fillStyle = 'rgba(77,95,115,0.65)';
                    mCtx.font = '9px JetBrains Mono'; mCtx.textAlign = 'right';
                    mCtx.fillText(`v = ${vDisplay} m/s`, cw - 16, ch - 6);

                    mCtx.restore();
                }
            }

            // ── Save History & Draw Telemetry Chart
            sys.history.push({ v: sys.targetV, i: sys.I, r: sys.rpm, f: forcePercent * 100 });
            if (sys.history.length > 100) sys.history.shift();

            if (liveChartRef.current) {
                const cv = liveChartRef.current;
                const cCtx = cv.getContext('2d');
                if (cCtx) {
                    const w = cv.width;
                    const h = cv.height;
                    const dpr = window.devicePixelRatio || 1;
                    const pad = 8 * dpr;

                    cCtx.clearRect(0, 0, w, h);
                    cCtx.fillStyle = 'rgba(5,12,26,0.6)';
                    cCtx.beginPath(); cCtx.roundRect(0, 0, w, h, 6 * dpr); cCtx.fill();

                    // Horizontal grids
                    cCtx.strokeStyle = 'rgba(255,255,255,0.04)'; cCtx.lineWidth = 1;
                    for (let i = 1; i < 4; i++) {
                        const y = pad + (i / 4) * (h - pad * 2);
                        cCtx.beginPath(); cCtx.moveTo(pad, y); cCtx.lineTo(w - pad, y); cCtx.stroke();
                    }

                    const pts = sys.history.length;
                    if (pts >= 2) {
                        const stepX = (w - pad * 2) / (pts - 1);
                        const plotLine = (fn: (item: { v: number; i: number; r: number; f: number }) => number, color: string, maxV: number, lw = 2) => {
                            cCtx.beginPath(); cCtx.strokeStyle = color;
                            cCtx.lineWidth = lw * dpr; cCtx.lineJoin = 'round'; cCtx.lineCap = 'round';
                            for (let i = 0; i < pts; i++) {
                                const val = fn(sys.history[i]);
                                const x = pad + i * stepX;
                                const y = h - pad - (Math.min(1, val / maxV) * (h - pad * 2));
                                if (i === 0) cCtx.moveTo(x, y); else cCtx.lineTo(x, y);
                            }
                            cCtx.stroke();
                            cCtx.globalAlpha = 0.22; cCtx.lineWidth = (lw + 3) * dpr;
                            cCtx.shadowColor = color; cCtx.shadowBlur = 6 * dpr; cCtx.stroke();
                            cCtx.globalAlpha = 1; cCtx.shadowBlur = 0;
                        };

                        plotLine(d => d.v, '#22d3ee', 25, 1.8);
                        plotLine(d => d.i * 10, '#fbbf24', 7, 1.8);
                        plotLine(d => d.r / 100, '#fb7185', 15, 1.8);
                        plotLine(d => d.f, '#a78bfa', 100, 1.5);

                        const last = sys.history[pts - 1];
                        [
                            { val: last.v, max: 25, c: '#22d3ee' },
                            { val: last.i * 10, max: 7, c: '#fbbf24' },
                            { val: last.r / 100, max: 15, c: '#fb7185' },
                            { val: last.f, max: 100, c: '#a78bfa' },
                        ].forEach(({ val, max, c }) => {
                            const x = w - pad;
                            const y = h - pad - (Math.min(1, val / max) * (h - pad * 2));
                            cCtx.beginPath(); cCtx.arc(x, y, 3.5 * dpr, 0, Math.PI * 2);
                            cCtx.fillStyle = c; cCtx.fill();
                        });
                    }
                }
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvases);
        };
    }, [macroState, detailState]);

    // Handle macro canvas clicks to inspect items
    const handleMacroCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (macroState === 'collapsed' || !macroCanvasRef.current) return;
        
        const canvas = macroCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const cw = canvas.width / dpr;
        const ch = canvas.height / dpr;
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Position coordinates mirroring the rendering coordinates
        const colX = 20, colW = 36;
        const tubeX = Math.round(cw * 0.42);
        const armY = Math.round(ch * 0.3);
        const tbW = 70, tbH = 44;
        const tbX = tubeX - tbW / 2, tbY = armY - tbH - 4;
        const amplitude = Math.min(cw * 0.24, 120);
        const tableCX = cw * 0.5;
        const tableX = tableCX + amplitude * Math.sin(sysRef.current.tablePhase);
        const tableW = 158, tableH = 34;
        const trackY = Math.round(ch * 0.55);
        const tableTop = trackY - tableH - 2;
        const bhW = 62, bhH = 22;
        const bhX = tableX - bhW / 2, bhY = trackY + 4;
        const dtW = 90, dtH = 12;
        const dtX = tubeX - dtW / 2, dtY = ch - 18;

        if (mx >= bhX - 4 && mx <= bhX + bhW + 4 && my >= bhY - 4 && my <= bhY + bhH + 16) {
            inspectComponent('disc', e.clientX, e.clientY);
            return;
        }
        if (mx >= tableX - tableW / 2 && mx <= tableX + tableW / 2 && my >= tableTop && my <= trackY + 4) {
            inspectComponent('mesa', e.clientX, e.clientY);
            return;
        }
        if (mx >= tbX - 4 && mx <= tbX + tbW + 4 && my >= tbY - 4 && my <= armY + 4) {
            inspectComponent('emissor', e.clientX, e.clientY);
            return;
        }
        if (mx >= dtX - 4 && mx <= dtX + dtW + 4 && my >= dtY - 4 && my <= dtY + dtH + 4) {
            inspectComponent('detector', e.clientX, e.clientY);
            return;
        }
        if (mx >= colX && mx <= colX + colW && my >= 14 && my <= ch - 14) {
            inspectComponent('gantry', e.clientX, e.clientY);
            return;
        }
        
        closeHud();
    };

    // Collapse actions toggle handler
    const togglePane = (paneId: 'macro' | 'detail', action: 'collapse' | 'maximize') => {
        if (paneId === 'macro') {
            if (action === 'collapse') {
                if (macroState === 'collapsed') {
                    setMacroState('normal');
                } else {
                    setMacroState('collapsed');
                    if (detailState === 'maximized') setDetailState('normal');
                }
            } else { // maximize
                if (macroState === 'maximized') {
                    setMacroState('normal');
                } else {
                    setMacroState('maximized');
                    setDetailState('collapsed');
                }
            }
        } else {
            if (action === 'collapse') {
                if (detailState === 'collapsed') {
                    setDetailState('normal');
                } else {
                    setDetailState('collapsed');
                    if (macroState === 'maximized') setMacroState('normal');
                }
            } else { // maximize
                if (detailState === 'maximized') {
                    setDetailState('normal');
                } else {
                    setDetailState('maximized');
                    setMacroState('collapsed');
                }
            }
        }
        
        // Dispatch window resize event to force canvases recalculation in the next tick
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 30);
    };

    return (
        <div className="workspace-grid" onClick={(e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.interactive-clickable-part') &&
                !target.closest('.hud-panel') &&
                !target.closest('.macro-canvas')) {
                closeHud();
            }
        }}>
            {/* ── LEFT SIMULATOR PANE ── */}
            <div className="sim-pane">
                {/* ┌─ Contexto Industrial Panel ── */}
                <div 
                    className={`macro-panel ${macroState === 'collapsed' ? 'collapsed' : ''} ${macroState === 'maximized' ? 'maximized' : ''}`}
                    style={{ display: detailState === 'maximized' ? 'none' : 'block' }}
                >
                    <div className="pane-tag">
                        <div className="ptdot" style={{ background: 'var(--cyan)' }}></div>
                        Contexto Industrial · Mesa de Diagnóstico em Operação
                    </div>
                    <div className="pane-actions">
                        <button 
                            onClick={() => togglePane('macro', 'collapse')} 
                            className="pane-btn" 
                            title={macroState === 'collapsed' ? "Expandir" : "Minimizar"}
                        >
                            {macroState === 'collapsed' ? '➕' : '➖'}
                        </button>
                        <button 
                            onClick={() => togglePane('macro', 'maximize')} 
                            className="pane-btn" 
                            title={macroState === 'maximized' ? "Restaurar" : "Tela Cheia"}
                        >
                            {macroState === 'maximized' ? '⧉' : '⛶'}
                        </button>
                    </div>
                    <canvas 
                        ref={macroCanvasRef} 
                        className="macro-canvas"
                        onClick={handleMacroCanvasClick}
                    />
                </div>

                {/* └─ Motor Fisico Detail Panel ── */}
                <div 
                    className={`detail-panel ${detailState === 'collapsed' ? 'collapsed' : ''} ${detailState === 'maximized' ? 'maximized' : ''}`}
                    style={{ display: macroState === 'maximized' ? 'none' : 'flex' }}
                >
                    <div className="pane-tag">
                        <div className="ptdot" style={{ background: 'var(--purple)' }}></div>
                        Motor Físico · Freio Eletromagnético · Detalhe
                    </div>
                    <div className="pane-actions">
                        <button 
                            onClick={() => togglePane('detail', 'collapse')} 
                            className="pane-btn" 
                            title={detailState === 'collapsed' ? "Expandir" : "Minimizar"}
                        >
                            {detailState === 'collapsed' ? '➕' : '➖'}
                        </button>
                        <button 
                            onClick={() => togglePane('detail', 'maximize')} 
                            className="pane-btn" 
                            title={detailState === 'maximized' ? "Restaurar" : "Tela Cheia"}
                        >
                            {detailState === 'maximized' ? '⧉' : '⛶'}
                        </button>
                    </div>

                    <div className="grid-bg-overlay"></div>

                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '80px',
                        fontSize: '11px',
                        background: 'rgba(34,211,238,0.12)',
                        border: '1px solid var(--border-hi)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: 'var(--cyan)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        fontWeight: 500
                    }}>
                        💡 Clique nos componentes para inspecionar
                    </div>

                    {/* Equations info Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        fontFamily: 'var(--mono)',
                        fontSize: '10px',
                        color: 'rgba(77,95,115,0.7)',
                        lineHeight: 1.9,
                        pointerEvents: 'none',
                        zIndex: 10
                    }}>
                        <div style={{ color: 'rgba(34,211,238,0.5)' }}>dI/dt = (V − R·I) / L</div>
                        <div>F<sub>mag</sub> ∝ (N·I)² / g²</div>
                        <div>τ<sub>brake</sub> = k·F<sub>mag</sub>·r<sub>pad</sub></div>
                    </div>

                    {/* Floating HUD popup */}
                    <div 
                        className={`hud-panel ${selectedComponent ? 'visible' : ''}`}
                        style={{
                            left: `${hudCoords.x}px`,
                            top: `${hudCoords.y}px`
                        }}
                    >
                        {selectedComponent && COMPONENT_DB[selectedComponent] && (
                            <>
                                <div className="hud-header-area">
                                    <div className="hud-crosshair-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round">
                                            <circle cx="12" cy="12" r="3" />
                                            <line x1="12" y1="2" x2="12" y2="7" />
                                            <line x1="12" y1="17" x2="12" y2="22" />
                                            <line x1="2" y1="12" x2="7" y2="12" />
                                            <line x1="17" y1="12" x2="22" y2="12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="hud-header-title-text">{COMPONENT_DB[selectedComponent].title}</div>
                                        <div className="hud-header-subtitle-text">Inspeção de Componente</div>
                                    </div>
                                </div>
                                <div className="hud-field-row">
                                    <div className="hud-field-label-text">Material Predominante</div>
                                    <div className="hud-field-value-text">{COMPONENT_DB[selectedComponent].material}</div>
                                </div>
                                <div className="hud-field-row">
                                    <div className="hud-field-label-text">Parâmetro Físico</div>
                                    <div className="hud-field-value-text">{COMPONENT_DB[selectedComponent].param}</div>
                                </div>
                                <div className="hud-field-row">
                                    <div className="hud-field-label-text">Função Estrutural / Física</div>
                                    <div className="hud-field-desc-text">{COMPONENT_DB[selectedComponent].desc}</div>
                                </div>
                                <button className="hud-close-btn" onClick={closeHud}>✕ Fechar Inspeção</button>
                            </>
                        )}
                    </div>

                    {/* Mechanical Visual Assembly wrapper */}
                    <div className="brake-assembly-wrapper">
                        {/* Electromagnet & Coil block */}
                        <div 
                            className={`electromagnet-coil-block interactive-clickable-part ${selectedComponent === 'core' ? 'part-selected-outline' : ''}`}
                            onClick={(e) => { e.stopPropagation(); inspectComponent('core', e.clientX, e.clientY); }}
                        >
                            <div style={{
                                fontSize: '10px',
                                color: '#94a3b8',
                                fontWeight: 700,
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em'
                            }}>
                                Estator / Bobina
                            </div>
                            
                            <div 
                                ref={uiCoilRef}
                                className={`copper-windings interactive-clickable-part ${selectedComponent === 'coil' ? 'part-selected-outline' : ''}`}
                                onClick={(e) => { e.stopPropagation(); inspectComponent('coil', e.clientX, e.clientY); }}
                            >
                                {/* Dashed flux lines */}
                                <div ref={uiField1Ref} className="magnetic-flux-line" style={{ width: '160px', height: '100px', left: '-30px', bottom: '-40px' }} />
                                <div ref={uiField2Ref} className="magnetic-flux-line" style={{ width: '220px', height: '140px', left: '-60px', bottom: '-60px' }} />
                            </div>

                            {/* Armature pad */}
                            <div 
                                ref={uiPadRef}
                                className={`armature-pad interactive-clickable-part ${selectedComponent === 'pad' ? 'part-selected-outline' : ''}`}
                                onClick={(e) => { e.stopPropagation(); inspectComponent('pad', e.clientX, e.clientY); }}
                            >
                                <div className="armature-pad-channel" />
                            </div>
                        </div>

                        {/* Shaft and rotating disc */}
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: '200px' }}>
                            <div 
                                className={`steel-shaft interactive-clickable-part ${selectedComponent === 'shaft' ? 'part-selected-outline' : ''}`}
                                onClick={(e) => { e.stopPropagation(); inspectComponent('shaft', e.clientX, e.clientY); }}
                            />
                            <div 
                                ref={uiDiscRef}
                                className={`rotor-disc interactive-clickable-part ${selectedComponent === 'disc' ? 'part-selected-outline' : ''}`}
                                onClick={(e) => { e.stopPropagation(); inspectComponent('disc', e.clientX, e.clientY); }}
                            />
                        </div>

                        {/* Hardware annotations labels */}
                        <div className="mechanical-label" style={{ right: '-192px', top: '40px' }}>
                            <div style={{ width: '48px', height: '1px', backgroundColor: '#64748b' }}></div>
                            <span>Eletroímã (Fixo)</span>
                        </div>
                        <div className="mechanical-label" style={{ left: '-192px', top: '160px' }}>
                            <span>Rotor (Eixo Móvel)</span>
                            <div style={{ width: '48px', height: '1px', backgroundColor: '#64748b' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT CONTROL SIDEBAR ── */}
            <div className="dashboard-sidebar">
                {/* 1. Voltage slider panel */}
                <div className="glass-panel">
                    <div className="panel-header-row">
                        <div className="badge-icon" style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.2)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <span className="label-text">Controle de Tensão</span>
                        <span ref={valVoltageRef} style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: 700, color: 'var(--cyan)' }}>
                            0.0<span style={{ fontSize: '13px', color: 'var(--text-mid)', fontWeight: 400 }}> V</span>
                        </span>
                    </div>
                    <div className="panel-body-area">
                        <input 
                            type="range" 
                            className="slider-input-cyan" 
                            min="0" 
                            max="24" 
                            step="0.1" 
                            value={sliderV}
                            onChange={(e) => setSliderV(parseFloat(e.target.value))}
                            style={{ '--pct': `${(sliderV / 24) * 100}%` } as React.CSSProperties}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                            <span>0V · Mesa Livre</span>
                            <span>24V · Travamento Máx</span>
                        </div>
                        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center' }}>
                            <span ref={statusBadgeRef} className="indicator-badge status-free-style">
                                <span className="status-dot"></span>
                                <span ref={statusTextRef}>Mesa em Movimento</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. FMEA Panel */}
                <div ref={fmeaContainerRef} className="glass-panel" style={{ display: 'none' }}>
                    <div className="panel-header-row">
                        <div className="badge-icon" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <span className="label-text" style={{ color: '#fbbf24' }}>FMEA · Diagnóstico de Falha</span>
                    </div>
                    <div ref={fmeaPanelRef} className="panel-body-area" style={{ paddingTop: '10px' }} />
                </div>

                {/* 3. Telemetry values grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="telemetry-card" style={{ borderLeft: '3px solid var(--yellow)' }}>
                        <div className="telemetry-label">Corrente Induzida (I)</div>
                        <div className="telemetry-value">
                            <span ref={valCurrentRef}>0.000</span>
                            <span className="val-unit">A</span>
                        </div>
                        <div className="progress-track-bar">
                            <div ref={barCurrentRef} className="progress-fill-bar" style={{ background: 'var(--yellow)', width: '0%' }} />
                        </div>
                        <div ref={subCurrentMaxRef} className="telemetry-subtitle">Lim: 0.63 A (V/R)</div>
                    </div>
                    
                    <div className="telemetry-card" style={{ borderLeft: '3px solid var(--purple)' }}>
                        <div className="telemetry-label">F. Magnética (Maxwell)</div>
                        <div className="telemetry-value">
                            <span ref={valForceRef}>0</span>
                            <span className="val-unit">%</span>
                        </div>
                        <div className="progress-track-bar">
                            <div ref={barForceRef} className="progress-fill-bar" style={{ background: 'var(--purple)', width: '0%' }} />
                        </div>
                        <div className="telemetry-subtitle">∝ (N·I)² / g²</div>
                    </div>

                    <div className="telemetry-card" style={{ borderLeft: '3px solid var(--rose)', gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div>
                                <div className="telemetry-label">Velocidade da Mesa (Cinemática)</div>
                                <div className="telemetry-value">
                                    <span ref={valRPMRef}>1500</span>
                                    <span className="val-unit">RPM</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="telemetry-label">F. Magnetomotriz</div>
                                <div className="telemetry-value" style={{ fontSize: '16px' }}>
                                    <span ref={valMMFRef}>0</span>
                                    <span className="val-unit">A·e</span>
                                </div>
                            </div>
                        </div>
                        <div className="progress-track-bar">
                            <div ref={barRPMRef} className="progress-fill-bar" style={{ background: 'var(--rose)', width: '100%' }} />
                        </div>
                    </div>
                </div>

                {/* 4. Parameters slider lab */}
                <div className="glass-panel">
                    <div className="panel-header-row">
                        <div className="badge-icon" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                            </svg>
                        </div>
                        <span className="label-text">Laboratório de Parâmetros</span>
                        <button 
                            onClick={resetPhysics}
                            style={{
                                marginLeft: 'auto',
                                padding: '4px 10px',
                                background: 'rgba(167,139,250,0.1)',
                                border: '1px solid rgba(167,139,250,0.25)',
                                borderRadius: '6px',
                                color: '#a78bfa',
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                cursor: 'pointer'
                            }}
                        >
                            Reset
                        </button>
                    </div>
                    <div className="panel-body-area">
                        <div className="lab-slider-row">
                            <div className="lab-slider-header">
                                <span className="lab-param-name">Resistência (R) <span style={{ color: 'var(--text-dim)', fontSize: '9px' }}>· Joule</span></span>
                                <span className="lab-param-value">{sliderR.toFixed(1)} Ω</span>
                            </div>
                            <input 
                                type="range" 
                                className="param-range-slider" 
                                min="10" 
                                max="100" 
                                step="0.5" 
                                value={sliderR}
                                onChange={(e) => setSliderR(parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="lab-slider-row">
                            <div className="lab-slider-header">
                                <span className="lab-param-name">Indutância (L) <span style={{ color: 'var(--text-dim)', fontSize: '9px' }}>· atraso t</span></span>
                                <span className="lab-param-value">{sliderL.toFixed(2)} H</span>
                            </div>
                            <input 
                                type="range" 
                                className="param-range-slider" 
                                min="0.05" 
                                max="3" 
                                step="0.05" 
                                value={sliderL}
                                onChange={(e) => setSliderL(parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="lab-slider-row">
                            <div className="lab-slider-header">
                                <span className="lab-param-name">Espiras (N) <span style={{ color: 'var(--text-dim)', fontSize: '9px' }}>· voltas</span></span>
                                <span className="lab-param-value">{sliderN} esp</span>
                            </div>
                            <input 
                                type="range" 
                                className="param-range-slider" 
                                min="50" 
                                max="1000" 
                                step="10" 
                                value={sliderN}
                                onChange={(e) => setSliderN(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="lab-slider-row" style={{ marginBottom: 0 }}>
                            <div className="lab-slider-header">
                                <span className="lab-param-name">Entreferro (g) <span style={{ color: 'var(--text-dim)', fontSize: '9px' }}>· desgaste</span></span>
                                <span className="lab-param-value">{sliderG.toFixed(2)} mm</span>
                            </div>
                            <input 
                                type="range" 
                                className="param-range-slider" 
                                min="0.1" 
                                max="5" 
                                step="0.05" 
                                value={sliderG}
                                onChange={(e) => setSliderG(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Telemetry Chart */}
                <div className="glass-panel">
                    <div className="panel-header-row">
                        <div className="badge-icon" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <span className="label-text">Telemetria · 100 Amostras</span>
                    </div>
                    <div className="panel-body-area" style={{ paddingBottom: '12px' }}>
                        <canvas ref={liveChartRef} style={{ width: '100%', height: '120px', display: 'block' }} />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-mid)' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)' }}></div>Tensão (V)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-mid)' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--yellow)' }}></div>Corrente ×10
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-mid)' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rose)' }}></div>RPM ÷100
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-mid)' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--purple)' }}></div>Força (%)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
