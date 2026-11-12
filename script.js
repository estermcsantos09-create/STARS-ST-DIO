// ====== CONFIGURAÇÃO ======
// Número de WhatsApp do estúdio (somente números, com país e DDD). Ex.: '5561999999999'
// Se ficar vazio, o formulário copia a mensagem e abre o Instagram para o cliente colar na conversa.
const WHATSAPP_NUMBER = '5561995963269';
const INSTAGRAM_URL = 'https://www.instagram.com/stllrtsdesigns/';
// ===========================

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Menu mobile ----------
const menuButton = $('.menu-toggle');
const navigation = $('.navigation');

function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
$$('a', navigation).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});

// ---------- Filtros do portfólio ----------
$$('.filter').forEach(button => {
  button.addEventListener('click', () => {
    $$('.filter').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    const category = button.dataset.filter;
    $$('.project-card').forEach(card => {
      card.classList.toggle('hidden', category !== 'todos' && card.dataset.category !== category);
    });
  });
});

// ---------- Ano do rodapé ----------
$('#year').textContent = new Date().getFullYear();

// ---------- Barra de progresso, cabeçalho e botão de topo ----------
const progress = $('#progress');
const header = $('#header');
const toTop = $('#to-top');
let ticking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  progress.style.transform = `scaleX(${ratio})`;
  header.classList.toggle('scrolled', window.scrollY > 10);
  toTop.classList.toggle('show', window.scrollY > 700);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

// ---------- Link ativo no menu ----------
const navLinks = $$('a[href^="#"]', navigation).filter(link => !link.classList.contains('nav-cta'));
const sectionMap = new Map(navLinks.map(link => [link.getAttribute('href').slice(1), link]));
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      sectionMap.get(entry.target.id)?.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sectionMap.forEach((_, id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

// ---------- Estrelinhas de fundo ----------
$$('.stars-layer').forEach(layer => {
  const count = Number(layer.dataset.sparkles) || 8;
  const symbols = ['✦', '✧', '✦', '·'];
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'sparkle';
    star.textContent = symbols[i % symbols.length];
    star.style.left = `${Math.random() * 96}%`;
    star.style.top = `${Math.random() * 92}%`;
    star.style.fontSize = `${10 + Math.random() * 18}px`;
    star.style.setProperty('--d', `${3 + Math.random() * 4}s`);
    star.style.setProperty('--delay', `${-Math.random() * 6}s`);
    layer.appendChild(star);
  }
});

// ---------- Parallax suave no hero ----------
const heroArt = $('#hero-art');
if (heroArt && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const depthItems = $$('[data-depth]', heroArt);
  window.addEventListener('pointermove', event => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    depthItems.forEach(item => {
      const depth = Number(item.dataset.depth);
      item.style.translate = `${x * depth}px ${y * depth}px`;
    });
  }, { passive: true });
}

// ---------- Aparecer ao rolar ----------
const revealTargets = $$('.section-heading, .service-card, .svc-card, .project-card, .process-steps > div, .intro-content, .faq-main, .contact-form');
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal');
    element.style.setProperty('--stagger', `${(index % 4) * 0.08}s`);
    observer.observe(element);
  });
}

// ---------- Pré-selecionar serviço ao clicar em cards/projetos ----------
const serviceSelect = $('#quote-form select[name="service"]');
$$('[data-service]').forEach(element => {
  element.addEventListener('click', () => {
    const wanted = element.dataset.service;
    const option = [...serviceSelect.options].find(item => item.text === wanted);
    if (option) serviceSelect.value = option.value;
  });
});

// ---------- Aviso rápido ----------
const toast = $('#toast');
let toastTimer;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove();
    return ok;
  }
}

// ---------- Formulário ----------
const form = $('#quote-form');
const formNote = $('#form-note');
const success = $('#form-success');
const successText = $('#success-text');
const successLink = $('#success-link');
const submitButton = $('button[type="submit"]', form);

formNote.textContent = WHATSAPP_NUMBER
  ? 'Sua mensagem será preparada para envio pelo WhatsApp.'
  : 'Sua mensagem será copiada e a conversa abrirá no Instagram.';

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    showToast('Preencha todos os campos para continuar.');
    return;
  }

  const data = new FormData(form);
  const message = [
    'Olá! Vim pelo site do Stars Studio e gostaria de solicitar um orçamento.',
    '',
    `Nome: ${String(data.get('name')).trim()}`,
    `E-mail: ${String(data.get('email')).trim()}`,
    `Serviço: ${data.get('service')}`,
    `Projeto: ${String(data.get('message')).trim()}`
  ].join('\n');

  submitButton.disabled = true;

  if (WHATSAPP_NUMBER) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    successLink.href = url;
    successText.textContent = 'Sua solicitação foi preparada. Se o WhatsApp não abriu, use o botão abaixo.';
    successLink.textContent = 'Abrir WhatsApp ↗';
    window.open(url, '_blank', 'noopener');
  } else {
    const copied = await copyText(message);
    successLink.href = INSTAGRAM_URL;
    successLink.textContent = 'Abrir Instagram ↗';
    successText.textContent = copied
      ? 'Sua mensagem foi copiada. Abra o Instagram, envie uma mensagem direta e cole o texto.'
      : 'Abra o Instagram e conte sua ideia por mensagem direta. Estamos esperando por ela.';
    window.open(INSTAGRAM_URL, '_blank', 'noopener');
  }

  form.hidden = true;
  success.hidden = false;
  success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  submitButton.disabled = false;
  form.reset();
});

// ---------- Vídeo de fundo: respeita "reduzir movimento" ----------
const heroVideo = $('#hero-video');
if (heroVideo) {
  if (reduceMotion) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  } else {
    heroVideo.play?.().catch(() => {});
  }
}
