# Roteiro de Apresentação — Eletroímã Industrial
### Freio Eletromagnético de Raio-X · 10 minutos · 2 apresentadores

> Troque `[seu nome]` e `[nome do colega]` pelos nomes reais. Os papéis "VOCÊ" e "COLEGA" são só pra organizar — decidam entre vocês quem fica com qual, e mantenham fixo durante o ensaio pra não se perderem na hora.

---

## Antes de entrar na sala (checklist de palco)

- [ ] Eletroímã já montado e cabeado **antes** da sua vez — não gastem tempo de apresentação conectando garra jacaré.
- [ ] Fonte ICEL ligada na tomada, com o dial em 0V até o momento certo do Bloco 3.
- [ ] **Truque do aquecimento:** se der, liguem a bobina em ~24V por 5–10 min *antes* da apresentação (durante o setup, ou enquanto outro grupo apresenta) e desliguem antes de começar. Assim, na hora do Efeito Joule, a carcaça já está quente de verdade — sem precisar esperar minutos ao vivo, que vocês não têm.
- [ ] Notebook no projetor, já testado, com duas abas abertas: simulador interativo e gêmeo digital (não procurem arquivo na hora).
- [ ] Sliders dos simuladores pré-ajustados nos valores que vocês vão mostrar (corrente em 0,632A, por exemplo) — evita ficar arrastando slider procurando o número certo em público.
- [ ] Alguém de olho no tempo (celular ou relógio visível).
- [ ] Façam pelo menos um ensaio completo em voz alta, cronometrando. Demo ao vivo sempre parece mais rápida na cabeça do que sai na prática.

---

## Divisão de tempo

| Bloco | Janela | Duração | Quem fala | Conteúdo |
|---|---|---|---|---|
| 1. Abertura | 0:00–0:40 | 40s | Você | Apresentação + objetivo |
| 2. Contexto físico | 0:40–2:00 | 1min20 | Colega | Lei de Ampère, ℱ = N·I |
| 3. Demo física ao vivo | 2:00–5:30 | 3min30 | Os dois | Eletroímã real + fonte ICEL |
| 4. Simuladores na tela | 5:30–7:30 | 2min | Os dois | Tutorial interativo + gêmeo digital |
| 5. Resultados e conclusão | 7:30–9:10 | 1min40 | Os dois | Recap das leis validadas |
| 6. Encerramento | 9:10–9:40 | 30s | Você | Agradecimento |

Soma: 9min40 — sobram ~20s de margem dentro do limite de 10 minutos. Ritmo de fala calculado pra ~130 palavras/minuto, conversacional, sem pressa.

---

## Roteiro detalhado

### Bloco 1 — Abertura `0:00–0:40`

**AÇÃO:** eletroímã sobre a bancada, já montado, fonte desligada (0V). Os dois de pé, ao lado do equipamento, de frente pra turma.

**VOCÊ:**
> "Boa tarde, professor e colegas. Eu sou [seu nome] e esse é [nome do colega]. Hoje a gente vai mostrar como funciona um eletroímã industrial — não só na teoria, mas ao vivo: isso aqui é o estator real de um freio eletromagnético de um equipamento de raio-X. A gente vai ligar ele, travar essa massa de metal usando só campo magnético, e depois mostrar no simulador que a gente construiu o que está acontecendo por dentro, que o olho não vê."

---

### Bloco 2 — Contexto físico rápido `0:40–2:00`

**AÇÃO (Colega):** aponte para a bobina visível no eletroímã, sem ligar a fonte ainda.

**COLEGA:**
> "Dentro desse eletroímã tem uma bobina de fio de cobre com 500 voltas, enrolada num núcleo de ferro laminado. A ideia é a Lei de Ampère: cada volta de corrente cria um campinho magnético, e a soma das 500 voltas vira uma força chamada força magnetomotriz — a fórmula é só N vezes I, número de espiras vezes corrente. Sem corrente, esse núcleo não atrai nada, ele não é ímã permanente. Só liga quando a corrente passa. E quanto mais corrente, mais forte o campo — vamos ver isso ao vivo agora."

*(Esse é o bloco mais "teórico" — falem mais devagar aqui, tem folga de tempo.)*

---

### Bloco 3 — Demo física ao vivo `2:00–5:30` (o coração da apresentação)

**3a. Teste a frio** `2:00–2:20`
**AÇÃO (Colega):** encoste a massa de metal no núcleo, fonte ainda em 0V. Solte.

**COLEGA:**
> "Repara: sem corrente, nada acontece. Solta na mão. Esse núcleo não puxa nada por conta própria."

**3b. Ligando a fonte** `2:20–3:00`
**AÇÃO (Você):** gire o potenciômetro de tensão da ICEL lentamente, de 0 até ~24V, aproximando a massa.

**VOCÊ:**
> "Agora eu vou subir a tensão devagar. Olhem o metal: quanto mais eu subo, mais corrente passa pela bobina, e mais forte ele puxa."

**3c. Lei de Ohm em tempo real** `3:00–3:40`
**AÇÃO (Colega):** aponte para o display da fonte.

**COLEGA:**
> "Olhando o display: a fonte está mostrando 24 volts e 0,63 ampères. Aplicando a Lei de Ohm, R igual a V dividido por I, dá uns 38 ohms — a resistência real da nossa bobina, medida ao vivo, sem multímetro, só com os números da própria fonte."

**3d. Efeito Joule** `3:40–4:20`
**AÇÃO (Você):** toque a carcaça (já pré-aquecida pelo truque do checklist).

**VOCÊ:**
> "Encostem aqui na carcaça. Ela esquentou. Isso é o Efeito Joule — a corrente passando pelo cobre gera calor, P igual a R vezes I ao quadrado. Em equipamento industrial isso é levado a sério, porque esse calor precisa ser dissipado, senão derrete o isolamento do fio."

**3e. Reduzindo a corrente** `4:20–5:00`
**AÇÃO (Você):** abaixe o dial de tensão de volta. Mostre a massa ficando mais fácil de soltar.

**COLEGA:**
> "E se a gente abaixar a tensão de novo... vejam que a força cai muito mais rápido do que a corrente. Não é proporcional — é relação de quadrado."

**3f. Gancho para a Lei de Maxwell** `5:00–5:30`

**VOCÊ:**
> "Essa relação de quadrado é a Lei de Maxwell pra força de atração magnética — e é exatamente isso que a gente programou no nosso simulador. Vamos mostrar."

---

### Bloco 4 — Simuladores na tela `5:30–7:30`

**AÇÃO:** troquem para o projetor, abram o simulador interativo (aba já preparada).

**VOCÊ:**
> "Esse simulador roda as mesmas equações que vocês acabaram de ver na bancada, mas mostra o que o olho não consegue ver."

**AÇÃO (Você):** ajuste o slider de corrente para 0,632A — o valor real medido.

> "Olhem a força magnetomotriz aqui: 316 ampère-espiras — exatamente o que a gente calculou com os dados reais da fonte."

**AÇÃO (Colega):** mude para o gráfico do circuito RL (Seção 2 do simulador).

**COLEGA:**
> "Esse gráfico mostra por que a corrente não sobe instantaneamente quando ligamos a fonte — a bobina tem indutância, e isso atrasa a subida da corrente. Esse atraso se chama constante de tempo, tau, e pra essa bobina é de 21 milissegundos."

**AÇÃO (Você):** abra a segunda aba, o gêmeo digital industrial. Aumente o slider de resistência simulando desgaste.

**COLEGA:**
> "E essa parte é a mais interessante pra aplicação industrial: a gente simulou uma falha. Se a resistência da bobina sobe — por desgaste ou superaquecimento — o sistema avisa, em tempo real, que a capacidade máxima de corrente cai, e o freio pode passar a escorregar. É exatamente o tipo de diagnóstico que se faz num gêmeo digital: testar falhas sem quebrar o equipamento real."

---

### Bloco 5 — Resultados e conclusão `7:30–9:10`

**VOCÊ:**
> "Resumindo o que validamos hoje: a Lei de Ohm, com R de 38 ohms medido ao vivo; a força magnetomotriz, N vezes I; o Efeito Joule, com a carcaça esquentando de verdade; e o atraso da corrente pela indutância, os 21 milissegundos que vocês viram no gráfico."

**COLEGA:**
> "E usamos justamente esse eletroímã porque ele não é um brinquedo — é o estator real de um freio de equipamento de raio-X. Esse tipo de freio trava mecanismos pesados usando exatamente os princípios que vocês acabaram de ver: corrente cria campo, campo cria força, força trava o sistema. E com o gêmeo digital, a gente consegue simular falhas — desgaste, sobreaquecimento — sem nunca precisar quebrar o equipamento real pra aprender com isso."

---

### Bloco 6 — Encerramento `9:10–9:40`

**VOCÊ:**
> "Era isso. Eletromagnetismo não fica só na fórmula do quadro — a gente trouxe ele pra bancada e pro código. Obrigado!"

---

## Números para ter na ponta da língua

| Grandeza | Valor | De onde vem |
|---|---|---|
| R (resistência da bobina) | ≈ 38 Ω | V/I = 24/0,632 |
| N (espiras) | 500 | bobina real |
| I (corrente no experimento) | 0,632 A | display da fonte |
| ℱ (força magnetomotriz) | 316 A·espiras | N × I |
| P (potência dissipada) | 15,2 W | R × I² |
| τ (constante de tempo) | 21,1 ms | L/R = 0,8/38 |

---

## Se algo der errado (plano B)

Massa não é atraída ou atração fraca: o entreferro (distância núcleo–metal) provavelmente está grande. Aproveitem e digam em voz alta "vou aproximar mais, porque a força cai com o quadrado da distância" — transforma o imprevisto numa demonstração da própria lei física.

Fonte não liga ou display não mostra nada: confiram o cabo de força sem entrar em pânico; se não resolver em uns 10 segundos, pulem pro simulador e digam "vamos ver no simulador o que esperaríamos ver ao vivo" — não é o ideal, mas a apresentação segue.

Projetor falha: o Bloco 3 (demo física) já sustenta a apresentação por si só. Encurtem o Bloco 4 para uma frase descrevendo o que o simulador mostraria.

---

## Se estiverem passando do tempo

Cortem nesta ordem, do menos pro mais essencial:

1. Bloco 2 — resumam em uma frase: "é a Lei de Ampère, N vezes I: mais corrente, mais campo."
2. Bloco 4, a parte do gráfico RL/tau — pulem direto pro gêmeo digital e pra falha simulada.
3. Bloco 3e (reduzir corrente) — só mencionem que a força cai com o quadrado, sem refazer ao vivo.

Nunca cortem: o teste a frio (3a), a leitura do display com a Lei de Ohm (3c), e a conclusão (Bloco 5) — são o que comprova que é um experimento real, não só uma simulação bonita.
