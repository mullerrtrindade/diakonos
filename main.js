(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');
  const config = window.DIAK_CONFIG || {};
  const whatsapp = String(config.whatsapp || '').replace(/\D/g, '');
  const email = String(config.email || '').trim();
  const instagram = String(config.instagram || '').trim();

  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-menu');
  const closeMenu = () => {
    if (!menu || !mobileNav) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
    mobileNav.hidden = true;
    document.body.classList.remove('menu-is-open');
  };
  menu?.addEventListener('click', () => {
    const opening = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(opening));
    menu.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
    mobileNav.hidden = !opening;
    document.body.classList.toggle('menu-is-open', opening);
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 880) closeMenu(); });

  document.querySelector('#year').textContent = String(new Date().getFullYear());

  const links = document.querySelector('#direct-links');
  const safeInstagram = /^https:\/\/((www\.)?instagram\.com)\//i.test(instagram);
  const safeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (links) {
    if (whatsapp.length >= 12 && whatsapp.length <= 15) {
      const a = document.createElement('a');
      a.href = `https://wa.me/${whatsapp}`;
      a.textContent = 'WhatsApp ↗';
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      links.append(a);
    }
    if (safeEmail) {
      const a = document.createElement('a');
      a.href = `mailto:${email}`;
      a.textContent = 'E-mail ↗';
      links.append(a);
    }
    if (safeInstagram) {
      const a = document.createElement('a');
      a.href = instagram;
      a.textContent = 'Instagram ↗';
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      links.append(a);
    }
    links.hidden = !links.children.length;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -18px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(node => observer.observe(node));
  } else document.querySelectorAll('[data-reveal]').forEach(node => node.classList.add('is-visible'));

  const form = document.querySelector('#briefing-form');
  const feedback = document.querySelector('#form-feedback');
  const preview = document.querySelector('#contact-message-preview');
  const output = document.querySelector('#message-output');
  const btn = document.querySelector('#contact-submit');
  const btnLabel = document.querySelector('#submit-text');
  if (btnLabel && whatsapp.length >= 12 && whatsapp.length <= 15) btnLabel.textContent = 'Enviar pelo WhatsApp';
  else if (btnLabel && safeEmail) btnLabel.textContent = 'Enviar por e-mail';

  const showFeedback = msg => { feedback.textContent = msg; feedback.hidden = false; };
  const copy = async value => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    // Fallback compatível com visualização local em browsers antigos.
    output.focus(); output.select();
    return document.execCommand('copy');
  };
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const nome = document.querySelector('#nome').value.trim();
    const empresa = document.querySelector('#empresa').value.trim();
    const tipo = document.querySelector('#tipo').value;
    const desafio = document.querySelector('#desafio').value.trim();
    if (!nome || !desafio) return;
    const msg = `Olá, DIAK! Meu nome é ${nome}.\n${empresa ? `Empresa/projeto: ${empresa}\n` : ''}Assunto: ${tipo}\n\nMeu desafio:\n${desafio}\n\nGostaria de conversar sobre uma possível solução.`;
    output.value = msg;
    if (whatsapp.length >= 12 && whatsapp.length <= 15) {
      showFeedback('Abrindo o WhatsApp com a mensagem preenchida. Confira e confirme o envio.');
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
      preview.hidden = false;
    } else if (safeEmail) {
      showFeedback('Abrindo seu aplicativo de e-mail. Confira e confirme o envio.');
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Novo contato — DIAK: ${tipo}`)}&body=${encodeURIComponent(msg)}`;
      preview.hidden = false;
    } else {
      preview.hidden = false;
      try {
        const copied = await copy(msg);
        showFeedback(copied ? 'Mensagem copiada! Configure o WhatsApp ou e-mail da DIAK no arquivo config.js para permitir o envio direto pelo site.' : 'Mensagem preparada. Use o botão abaixo para copiá-la.');
      } catch {
        showFeedback('Mensagem preparada. Selecione e copie o texto abaixo.');
      }
    }
  });
  document.querySelector('#copy-message')?.addEventListener('click', async () => {
    try {
      const success = await copy(output.value);
      showFeedback(success ? 'Mensagem copiada para a área de transferência.' : 'Selecione o texto para copiar.');
    } catch {
      showFeedback('Não foi possível copiar automaticamente. Selecione o texto para copiar.');
    }
  });
})();
