// DX Marcenaria - interações
const navbar = document.querySelector('.dx-navbar');

function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll);
handleNavbarScroll();

// Fecha o menu mobile ao clicar em um link
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    const menu = document.querySelector('#menuPrincipal');
    const bsCollapse = bootstrap.Collapse.getInstance(menu);

    if (bsCollapse) {
      bsCollapse.hide();
    }
  });
});

// Animação suave de entrada
const revealElements = document.querySelectorAll(
  '.premium-card, .environment-card, .portfolio-item, .timeline-step, .section-title, .section-text'
);

revealElements.forEach((element) => element.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

revealElements.forEach((element) => observer.observe(element));

// Formulário: monta mensagem para WhatsApp
const form = document.querySelector('.contact-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const fields = form.querySelectorAll('input, textarea');
  const nome = fields[0].value.trim();
  const telefone = fields[1].value.trim();
  const ambiente = fields[2].value.trim();
  const mensagem = fields[3].value.trim();

  const texto = `Olá, sou ${nome}. Gostaria de solicitar um projeto com a DX Marcenaria.%0A%0AWhatsApp: ${telefone}%0AAmbiente: ${ambiente}%0ADetalhes: ${mensagem}`;

  // Troque pelo número real da DX Marcenaria com DDI + DDD.
  window.open(`https://wa.me/5500000000000?text=${texto}`, '_blank');
});
