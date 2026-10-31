(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.DIAK_CONFIG || {};
  const whatsapp = String(config.whatsapp || '').replace(/\D/g, '');
  const validWhatsapp = /^\d{12,15}$/.test(whatsapp);
  const email = String(config.email || '').trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const instagram = String(config.instagram || '').trim();
  const validInstagram = /^https:\/\/(www\.)?instagram\.com\/[\w.\/-]+\/?$/i.test(instagram);
  const waUrl = (message = '') => `https://wa.me/${whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  const mailUrl = message => `mailto:${email}?subject=${encodeURIComponent('Uma ideia para a DIAK')}&body=${encodeURIComponent(message)}`;
  const arrow = '<svg class="icon" aria-hidden="true"><use href="#i-diagonal"/></svg>';

  $('#year').textContent = String(new Date().getFullYear());
  const socialTargets = { whatsapp: validWhatsapp ? waUrl() : '', email: validEmail ? `mailto:${email}` : '', instagram: validInstagram ? instagram : '' };
  $$('[data-social]').forEach(link => {
    const target = socialTargets[link.dataset.social];
    link.hidden = !target;
    if (target) link.href = target;
  });
  const directContact = $('#direct-whatsapp');
  if (validWhatsapp) directContact.href = waUrl();
  else if (validEmail) {
    directContact.href = `mailto:${email}`;
    directContact.innerHTML = `Me envie um e-mail ${arrow}`;
    directContact.removeAttribute('target');
  } else directContact.parentElement.hidden = true;
  $$('[data-product-contact]').forEach(link => {
    const message = 'Olá, Müller! Vi o ConectaCell no site da DIAK e gostaria de conhecer melhor o sistema de gestão de ordens de serviço.';
    if (validWhatsapp) link.href = waUrl(message);
    else if (validEmail) link.href = mailUrl(message);
    else { link.href = '#diagnostico'; link.removeAttribute('target'); }
  });

  // Navegação e foco continuam nativos; o menu é independente das animações.
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const closeMenu = (restoreFocus = false) => {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.hidden = !opening;
    document.body.classList.toggle('menu-open', opening);
  });
  $$('a', mobileMenu).forEach(link => link.addEventListener('click', () => closeMenu()));
  $('.brand').addEventListener('click', () => closeMenu());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true);
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 740) closeMenu(); }, { passive: true });

  // Movimento opcional: respeita a preferência do sistema e tem controle próprio.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let motionPaused = reducedMotion.matches;
  let motionOverride = false;
  const motionToggle = $('#motion-toggle');
  const stage = $('.orbit-stage');
  const magneticButtons = $$('.magnetic');
  let motionCallback = () => {};
  const resetStage = () => {
    ['--rx', '--ry', '--px', '--py'].forEach(prop => stage.style.removeProperty(prop));
  };
  const updateMotion = () => {
    document.documentElement.classList.toggle('motion-paused', motionPaused);
    motionToggle.setAttribute('aria-pressed', String(motionPaused));
    $('#motion-label').textContent = motionPaused ? 'Ativar animações' : 'Pausar animações';
    if (motionPaused) { resetStage(); magneticButtons.forEach(button => button.style.removeProperty('transform')); }
    motionCallback();
  };
  motionToggle.addEventListener('click', () => { motionOverride = true; motionPaused = !motionPaused; updateMotion(); });
  reducedMotion.addEventListener?.('change', event => { if (!motionOverride) { motionPaused = event.matches; updateMotion(); } });
  updateMotion();

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -18px 0px' });
    $$('[data-reveal]').forEach(element => revealObserver.observe(element));
    document.documentElement.classList.add('js-enabled');
    const navLinks = $$('.desktop-nav a');
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -60% 0px' });
    $$('main section[id]').forEach(section => sectionObserver.observe(section));
  }

  const header = $('.site-header');
  const readingProgress = $('.reading-progress');
  const floatingContact = $('.floating-contact');
  let scrollPending = false;
  const updateScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    readingProgress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 35);
    const diagnosticRect = $('#diagnostico').getBoundingClientRect();
    const diagnosticOnScreen = diagnosticRect.top < window.innerHeight * .8 && diagnosticRect.bottom > 0;
    floatingContact.classList.toggle('visible', y > 450 && !diagnosticOnScreen);
    scrollPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  $$('.spotlight').forEach(card => card.addEventListener('pointermove', event => {
    if (motionPaused) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--sx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--sy', `${event.clientY - rect.top}px`);
  }, { passive: true }));
  magneticButtons.forEach(button => {
    button.addEventListener('pointermove', event => {
      if (motionPaused || !finePointer.matches) return;
      const rect = button.getBoundingClientRect();
      const x = Math.max(-4, Math.min(4, (event.clientX - rect.left - rect.width / 2) * .05));
      const y = Math.max(-3, Math.min(3, (event.clientY - rect.top - rect.height / 2) * .08));
      button.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
    button.addEventListener('pointerleave', () => button.style.removeProperty('transform'));
  });

  // Visual procedural: órbitas 3D, partículas e iluminação, sem bibliotecas externas.
  (() => {
    const canvas = $('#orbit-canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0, frameId = 0, visible = true, angle = 0, lastFrame = 0;
    let pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
    const TAU = Math.PI * 2;
    const project = (x, y, z, rotation) => {
      const cos = Math.cos(rotation), sin = Math.sin(rotation);
      const x1 = x * cos - z * sin;
      const z1 = x * sin + z * cos;
      const tilt = .34 + easedY * .28;
      const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
      const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
      const perspective = 750 / (750 + z2);
      return { x: width / 2 + x1 * perspective, y: height / 2 + y2 * perspective, z: z2, scale: perspective };
    };
    const path3D = (points, rotation, color, lineWidth = .65) => {
      ctx.beginPath();
      points.forEach((point, index) => {
        const p = project(...point, rotation);
        if (index) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };
    const render = () => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const r = Math.min(width * .38, height * .4, 192);
      const rotation = angle * .16 + easedX * .38;
      for (let m = 0; m < 7; m++) {
        const longitude = m / 7 * Math.PI;
        const points = [];
        for (let s = 0; s <= 64; s++) {
          const t = s / 64 * TAU;
          points.push([Math.cos(t) * r * Math.cos(longitude), Math.sin(t) * r, Math.cos(t) * r * Math.sin(longitude)]);
        }
        path3D(points, rotation, m % 2 ? 'rgba(65,137,238,.14)' : 'rgba(102,189,255,.23)');
      }
      for (let l = -2; l <= 2; l++) {
        const latitude = l * .39;
        const points = [];
        for (let s = 0; s <= 64; s++) {
          const t = s / 64 * TAU;
          points.push([Math.cos(t) * r * Math.cos(latitude), r * Math.sin(latitude), Math.sin(t) * r * Math.cos(latitude)]);
        }
        path3D(points, rotation, 'rgba(88,154,234,.16)');
      }
      for (let n = 0; n < 35; n++) {
        const t = n * 2.399963;
        const y = 1 - n / 34 * 2;
        const ring = Math.sqrt(1 - y * y);
        const p = project(Math.cos(t) * ring * r, y * r, Math.sin(t) * ring * r, rotation);
        const alpha = Math.max(.15, Math.min(.9, .5 - p.z / (r * 3)));
        ctx.fillStyle = `rgba(135,206,255,${alpha})`;
        ctx.shadowColor = '#66bfff';
        ctx.shadowBlur = n % 4 === 0 ? 8 : 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, (n % 4 === 0 ? 2.1 : 1.15) * p.scale, 0, TAU); ctx.fill();
      }
      ctx.shadowBlur = 0;
      for (let j = 0; j < 3; j++) {
        const t = angle * (.25 + j * .06) + j * 2.1;
        const p = project(Math.cos(t) * r * 1.16, Math.sin(t) * r * .65, Math.sin(t) * r * .8, rotation + j * .5);
        ctx.fillStyle = '#d3efff'; ctx.shadowColor = '#50acff'; ctx.shadowBlur = 13;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, TAU); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#62baff44'; ctx.lineWidth = .7;
        ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, TAU); ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };
    const frame = timestamp => {
      frameId = 0;
      if (motionPaused || !visible || document.hidden) return;
      if (timestamp - lastFrame >= 28) {
        angle += Math.min((timestamp - lastFrame) / 1000, .05);
        lastFrame = timestamp;
        easedX += (pointerX - easedX) * .055;
        easedY += (pointerY - easedY) * .055;
        render();
      }
      frameId = requestAnimationFrame(frame);
    };
    const sync = () => {
      if (frameId) { cancelAnimationFrame(frameId); frameId = 0; }
      if (motionPaused) { easedX = 0; easedY = 0; }
      render();
      if (!motionPaused && visible && !document.hidden) { lastFrame = performance.now(); frameId = requestAnimationFrame(frame); }
    };
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    };
    stage.addEventListener('pointermove', event => {
      if (motionPaused) return;
      const rect = stage.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
      stage.style.setProperty('--ry', `${pointerX * 13}deg`);
      stage.style.setProperty('--rx', `${pointerY * -9}deg`);
      stage.style.setProperty('--px', `${pointerX * 8}px`);
      stage.style.setProperty('--py', `${pointerY * 6}px`);
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; resetStage(); });
    stage.addEventListener('pointerup', event => { if (event.pointerType === 'touch') { pointerX = 0; pointerY = 0; resetStage(); } }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize', resize, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(stage);
    document.addEventListener('visibilitychange', sync);
    motionCallback = sync;
    resize(); sync();
  })();

  // Demonstração de produto: apenas dados fictícios, sem persistência ou métricas reais.
  const exampleOrders = [
    { id: '001', client: 'Ana Martins', model: 'Celular A', brand: 'Marca A', issue: 'Avaliação de tela', status: 'Em análise', className: '', date: 'Exemplo de entrada' },
    { id: '002', client: 'Lucas Almeida', model: 'Celular B', brand: 'Marca B', issue: 'Troca de bateria', status: 'Em reparo', className: '', date: 'Exemplo de entrada' },
    { id: '003', client: 'Camila Santos', model: 'Celular C', brand: 'Marca C', issue: 'Conector de carga', status: 'Aguardando peça', className: 'waiting', date: 'Exemplo de entrada' },
    { id: '004', client: 'Ana Martins', model: 'Celular D', brand: 'Marca D', issue: 'Revisão de software', status: 'Concluída', className: 'ready', date: 'Exemplo de entrada' }
  ];
  const exampleClients = [
    { id: '001', name: 'Ana Martins', devices: '02 aparelhos', orders: '02 atendimentos' },
    { id: '002', name: 'Lucas Almeida', devices: '01 aparelho', orders: '01 atendimento' },
    { id: '003', name: 'Camila Santos', devices: '01 aparelho', orders: '01 atendimento' }
  ];
  const tabNames = { orders: 'Ordens de serviço', clients: 'Clientes', devices: 'Aparelhos' };
  let activeTab = 'orders';
  let ongoingOnly = false;
  const stat = (label, value, dot = false) => `<div><span>${label}</span><strong>${value}${dot ? '<span class="stat-indicator"></span>' : ''}</strong></div>`;
  const renderDemo = () => {
    const table = $('#demo-table');
    $('#demo-title').textContent = tabNames[activeTab];
    $('#demo-breadcrumb-label').textContent = activeTab === 'orders' ? 'ATENDIMENTOS' : tabNames[activeTab].toLocaleUpperCase('pt-BR');
    $('#demo-panel').setAttribute('aria-labelledby', `tab-${activeTab}`);
    const filter = $('#demo-filter');
    filter.hidden = activeTab !== 'orders';
    filter.setAttribute('aria-pressed', String(ongoingOnly));
    filter.innerHTML = `${ongoingOnly ? 'Mostrar todas' : 'Em andamento'} <span>⌄</span>`;
    $$('.demo-tab').forEach(button => {
      const selected = button.dataset.demoTab === activeTab;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    let count;
    if (activeTab === 'orders') {
      const orders = exampleOrders.filter(order => !ongoingOnly || order.status !== 'Concluída');
      count = orders.length;
      $('#demo-stats').innerHTML = stat('Atendimentos', '04') + stat('Em andamento', '03', true) + stat('Concluídos', '01');
      $('#demo-table-label').textContent = ongoingOnly ? 'Atendimentos em andamento' : 'Atendimentos recentes';
      table.innerHTML = '<thead><tr><th scope="col">O.S.</th><th scope="col">Cliente / aparelho</th><th scope="col">Status</th></tr></thead><tbody>' + orders.map(order => `<tr><td><button type="button" class="record-button" data-record="${order.id}" aria-label="Ver ordem de serviço de exemplo ${order.id}">#${order.id}</button></td><td><strong>${order.client}</strong><small>${order.model} · ${order.issue}</small></td><td><span class="status-badge ${order.className}">${order.status}</span></td></tr>`).join('') + '</tbody>';
    } else if (activeTab === 'clients') {
      count = exampleClients.length;
      $('#demo-stats').innerHTML = stat('Clientes', '03') + stat('Aparelhos', '04') + stat('Atendimentos', '04');
      $('#demo-table-label').textContent = 'Clientes cadastrados';
      table.innerHTML = '<thead><tr><th scope="col">ID</th><th scope="col">Cliente</th><th scope="col">Histórico</th></tr></thead><tbody>' + exampleClients.map(client => `<tr><td>#${client.id}</td><td><strong>${client.name}</strong><small>${client.devices}</small></td><td>${client.orders}</td></tr>`).join('') + '</tbody>';
    } else {
      count = exampleOrders.length;
      $('#demo-stats').innerHTML = stat('Aparelhos', '04') + stat('Proprietários', '03') + stat('Vinculados a O.S.', '04');
      $('#demo-table-label').textContent = 'Aparelhos cadastrados';
      table.innerHTML = '<thead><tr><th scope="col">ID</th><th scope="col">Aparelho</th><th scope="col">Proprietário</th></tr></thead><tbody>' + exampleOrders.map(order => `<tr><td>#${order.id}</td><td><strong>${order.model}</strong><small>${order.brand}</small></td><td>${order.client}</td></tr>`).join('') + '</tbody>';
    }
    $('#demo-count').textContent = `${count} registros de exemplo`;
  };
  $$('.demo-tab').forEach((button, index, buttons) => {
    button.addEventListener('click', () => { activeTab = button.dataset.demoTab; renderDemo(); });
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus(); buttons[next].click();
    });
  });
  $('#demo-filter').addEventListener('click', () => { ongoingOnly = !ongoingOnly; renderDemo(); });
  const recordDialog = $('#record-dialog');
  $('#demo-table').addEventListener('click', event => {
    const trigger = event.target.closest('[data-record]');
    if (!trigger) return;
    const record = exampleOrders.find(order => order.id === trigger.dataset.record);
    if (!record) return;
    $('#record-title').textContent = `Ordem de serviço #${record.id}`;
    const fields = [['Cliente', record.client], ['Aparelho', `${record.brand} · ${record.model}`], ['Solicitação', record.issue], ['Situação', record.status]];
    $('#record-content').innerHTML = `<dl>${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
    recordDialog.showModal();
  });
  $('#close-dialog').addEventListener('click', () => recordDialog.close());
  $('#dialog-done').addEventListener('click', () => recordDialog.close());
  recordDialog.addEventListener('click', event => {
    if (event.target !== recordDialog) return;
    const rect = recordDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) recordDialog.close();
  });
  renderDemo();

  // Perguntas guiadas: tudo fica na memória da página até a ação explícita de compartilhar.
  const form = $('#diagnostic-form');
  const steps = $$('.wizard-step', form);
  const progressItems = $$('.wizard-progress li');
  const nextButton = $('#step-next');
  const backButton = $('#step-back');
  const submitButton = $('#prepare-message');
  const formError = $('#form-error');
  const result = $('#diagnostic-result');
  let currentStep = 0;
  const selectedValue = name => $(`input[name="${name}"]:checked`, form)?.value || '';
  const selectedPains = () => $$('input[name="desafios"]:checked', form).map(input => input.value);
  const clearError = () => {
    formError.hidden = true;
    formError.textContent = '';
    $$('[aria-invalid]', form).forEach(input => input.removeAttribute('aria-invalid'));
    steps.forEach(step => step.removeAttribute('aria-describedby'));
  };
  const stepError = (message, target) => {
    formError.textContent = message; formError.hidden = false;
    steps[currentStep].setAttribute('aria-describedby', 'form-error');
    if (target) { target.setAttribute('aria-invalid', 'true'); target.focus({ preventScroll: true }); }
    return false;
  };
  const validateStep = () => {
    clearError();
    if (currentStep === 0 && !selectedValue('segmento')) return stepError('Selecione uma opção para apresentar seu negócio.', $('input[name="segmento"]', form));
    if (currentStep === 1 && !selectedPains().length) return stepError('Selecione pelo menos um desafio para continuar.', $('input[name="desafios"]', form));
    if (currentStep === 2 && !selectedValue('prioridade')) return stepError('Escolha o que você quer melhorar primeiro.', $('input[name="prioridade"]', form));
    if (currentStep === 3 && !$('#nome').value.trim()) return stepError('Informe seu nome para preparar a mensagem.', $('#nome'));
    return true;
  };
  const showStep = (index, focus = true) => {
    currentStep = Math.min(steps.length - 1, Math.max(0, index));
    clearError();
    steps.forEach((step, stepIndex) => {
      const active = stepIndex === currentStep;
      step.hidden = !active;
      step.disabled = !active;
      if (active && focus) { const legend = $('legend', step); legend.tabIndex = -1; legend.focus({ preventScroll: true }); }
    });
    progressItems.forEach((item, itemIndex) => {
      item.classList.toggle('is-done', itemIndex < currentStep);
      if (itemIndex === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    $('#step-counter').innerHTML = `${String(currentStep + 1).padStart(2, '0')} <span>/ 04</span>`;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    backButton.hidden = currentStep === 0;
    $('#step-hint').hidden = currentStep !== 0;
    if (focus) {
      const cardTop = $('.diagnostic-card').getBoundingClientRect().top;
      if (cardTop < 65) $('.diagnostic-card').scrollIntoView({ block: 'start', behavior: motionPaused ? 'instant' : 'smooth' });
    }
    updateScroll();
  };
  nextButton.addEventListener('click', () => { if (validateStep()) showStep(currentStep + 1); });
  backButton.addEventListener('click', () => showStep(currentStep - 1));
  form.addEventListener('change', clearError);
  form.addEventListener('input', clearError);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateStep()) return;
    if (currentStep < steps.length - 1) { showStep(currentStep + 1); return; }
    const name = $('#nome').value.trim();
    const business = $('#empresa').value.trim();
    const notes = $('#detalhes').value.trim();
    const segment = selectedValue('segmento');
    const pains = selectedPains();
    const priority = selectedValue('prioridade');
    const lines = [
      `Olá, Müller! Meu nome é ${name}. Conheci a DIAK pelo site e gostaria de conversar.`,
      '', ...(business ? [`Negócio / projeto: ${business}`] : []),
      `Minha área: ${segment}`, `Meus desafios: ${pains.join('; ')}`, `Minha prioridade: ${priority}`,
      ...(notes ? ['', `Mais detalhes: ${notes}`] : []), '',
      'Podemos conversar sobre uma solução que faça sentido para minha rotina?'
    ];
    const message = lines.join('\n');
    $('#message-output').value = message;
    const suggestions = {
      'Ganhar tempo': 'Podemos começar entendendo quais tarefas se repetem e avaliar o que pode ser simplificado ou automatizado.',
      'Organizar a operação': 'Podemos começar mapeando onde estão suas informações e como reuni-las em um fluxo mais simples.',
      'Melhorar o atendimento': 'Podemos olhar para a jornada de cada atendimento e identificar onde uma ferramenta pode facilitar o acompanhamento.',
      'Validar uma ideia': 'Podemos definir o problema principal e pensar em uma primeira versão útil para testar com quem vai usar.'
    };
    $('#result-suggestion').textContent = `${suggestions[priority]} Este é um ponto de partida para nossa conversa.`;
    const send = $('#send-message');
    if (validWhatsapp) { send.href = waUrl(message); send.innerHTML = `Abrir no WhatsApp ${arrow}`; send.hidden = false; }
    else if (validEmail) { send.href = mailUrl(message); send.innerHTML = `Abrir e-mail ${arrow}`; send.hidden = false; send.removeAttribute('target'); }
    else send.hidden = true;
    form.hidden = true;
    result.hidden = false;
    $('.wizard-progress').hidden = true;
    $('#step-counter').innerHTML = 'PRONTO <span>✓</span>';
    $('#result-title').focus({ preventScroll: true });
    $('#copy-feedback').textContent = '';
    const top = $('.diagnostic-card').getBoundingClientRect().top;
    if (top < 70) $('.diagnostic-card').scrollIntoView({ block: 'start', behavior: motionPaused ? 'instant' : 'smooth' });
    updateScroll();
  });
  $('#edit-answers').addEventListener('click', () => {
    result.hidden = true;
    form.hidden = false;
    $('.wizard-progress').hidden = false;
    showStep(0);
  });
  $('#copy-message').addEventListener('click', async () => {
    const output = $('#message-output');
    const feedback = $('#copy-feedback');
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(output.value);
      else {
        output.focus(); output.select();
        if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
      }
      feedback.textContent = 'Mensagem copiada. Agora você pode compartilhá-la.';
    } catch {
      output.focus(); output.select();
      feedback.textContent = 'Selecione e copie a mensagem acima para compartilhá-la.';
    }
  });
  $$('[data-diagnostic-pain]').forEach(link => link.addEventListener('click', () => {
    const target = $$('input[name="desafios"]', form).find(input => input.value === link.dataset.diagnosticPain);
    if (target) target.checked = true;
    if (!result.hidden) {
      result.hidden = true; form.hidden = false; $('.wizard-progress').hidden = false;
    }
    showStep(0, false);
  }));
  showStep(0, false);
})();
