/* ==========================================================================
   BRASIL RAIZ — script principal
   Tudo em português: nomes de função, variáveis e comentários.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  inicializarMenu();
  inicializarParallax();
  inicializarRevelacaoAoRolar();
  inicializarSliderDeValores();
  inicializarSlideshowDeEventos();
});

/* --------------------------------------------------------------------
   MENU MOBILE
   -------------------------------------------------------------------- */
function inicializarMenu() {
  var botao = document.getElementById('navToggle');
  var menu = document.getElementById('nav');
  if (!botao || !menu) return;

  botao.addEventListener('click', function () {
    var estaAberto = menu.classList.toggle('is-open');
    botao.setAttribute('aria-expanded', estaAberto ? 'true' : 'false');
  });

  // fecha o menu ao clicar em um link (útil no celular)
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('is-open');
      botao.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------
   EFEITO PARALLAX (somente rolagem)
   Qualquer elemento com [data-speed] se move verticalmente numa
   velocidade diferente da rolagem da página, criando sensação de
   profundidade. Puro scroll — sem reação ao mouse.

   IMPORTANTE: o deslocamento é calculado em relação à posição da
   PRÓPRIA seção no documento — não ao scrollY absoluto da página.
   Se usássemos o scrollY puro, uma seção lá embaixo (como Eventos)
   já herdaria um scroll acumulado enorme antes mesmo de entrar na
   tela, empurrando o fundo para fora da margem de segurança do CSS
   e expondo a borda dele (o "corte" na cor de fundo). Ancorando o
   cálculo na posição de cada seção, o deslocamento fica sempre
   pequeno e prático — não importa a que altura da página ela esteja.
   -------------------------------------------------------------------- */
function inicializarParallax() {
  var elementosParallax = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
  if (elementosParallax.length === 0) return;

  // pra cada elemento, guarda a seção/contêiner que serve de referência
  var itens = elementosParallax.map(function (elemento) {
    var referencia = elemento.closest('section') || elemento.parentElement || elemento;
    return { elemento: elemento, referencia: referencia };
  });

  var precisaAtualizar = false;

  function atualizarParallax() {
    var alturaJanela = window.innerHeight;

    itens.forEach(function (item) {
      var velocidade = parseFloat(item.elemento.getAttribute('data-speed')) || 0;

      // getBoundingClientRect().top já é relativo à janela visível,
      // então não acumula com o tamanho da página — fica sempre
      // limitado a valores próximos da altura da tela.
      var posicaoNaTela = item.referencia.getBoundingClientRect().top;
      var distanciaDoCentro = posicaoNaTela - (alturaJanela / 2);
      var deslocamento = distanciaDoCentro * velocidade;

      // translate3d força aceleração por GPU e evita transforms acumulados:
      // aqui sempre DEFINIMOS o valor novo (não somamos ao anterior).
      item.elemento.style.transform = 'translate3d(0, ' + deslocamento.toFixed(1) + 'px, 0)';
    });

    precisaAtualizar = false;
  }

  function pedirAtualizacao() {
    if (!precisaAtualizar) {
      precisaAtualizar = true;
      window.requestAnimationFrame(atualizarParallax);
    }
  }

  window.addEventListener('scroll', pedirAtualizacao, { passive: true });
  window.addEventListener('resize', pedirAtualizacao);
  atualizarParallax();
}

/* --------------------------------------------------------------------
   REVELAÇÃO SUAVE AO ROLAR A PÁGINA
   Um único tipo de entrada, aplicado com moderação às seções.
   -------------------------------------------------------------------- */
function inicializarRevelacaoAoRolar() {
  var secoes = document.querySelectorAll('.sobre, .valores, .eventos, .cta');
  if (secoes.length === 0) return;

  // sem suporte a IntersectionObserver: mostra tudo direto, sem quebrar o layout
  if (!('IntersectionObserver' in window)) {
    secoes.forEach(function (secao) { secao.classList.add('reveal--visivel'); });
    return;
  }

  secoes.forEach(function (secao) { secao.classList.add('reveal'); });

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('reveal--visivel');
        observador.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  secoes.forEach(function (secao) { observador.observe(secao); });

  // rede de segurança: se por algum motivo uma seção nunca disparar o
  // observador (ex.: já está visível ao carregar a página), revela sozinha.
  window.setTimeout(function () {
    secoes.forEach(function (secao) { secao.classList.add('reveal--visivel'); });
  }, 2500);
}

/* --------------------------------------------------------------------
   SLIDE-CARD DE VALORES
   Carrossel simples de cards com setas e indicadores (dots).
   -------------------------------------------------------------------- */
function inicializarSliderDeValores() {
  var trilho = document.getElementById('valoresTrack');
  var botaoAnterior = document.getElementById('valoresPrev');
  var botaoProximo = document.getElementById('valoresNext');
  var containerDots = document.getElementById('valoresDots');
  if (!trilho || !botaoAnterior || !botaoProximo) return;

  var cartoes = Array.prototype.slice.call(trilho.children);
  var indiceAtual = 0;

  function cartoesPorTela() {
    return window.innerWidth >= 720 ? 3 : 1;
  }

  function totalDePaginas() {
    return Math.max(1, cartoes.length - cartoesPorTela() + 1);
  }

  function criarDots() {
    containerDots.innerHTML = '';
    for (var i = 0; i < totalDePaginas(); i++) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Ir para valor ' + (i + 1));
      dot.addEventListener('click', function (indice) {
        return function () { irParaIndice(indice); };
      }(i));
      containerDots.appendChild(dot);
    }
    atualizarDots();
  }

  function atualizarDots() {
    var dots = containerDots.querySelectorAll('button');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === indiceAtual);
    });
  }

  function irParaIndice(indice) {
    var maximo = totalDePaginas() - 1;
    indiceAtual = Math.min(Math.max(indice, 0), maximo);
    var porcentagem = (100 / cartoesPorTela()) * indiceAtual;
    trilho.style.transform = 'translateX(-' + porcentagem + '%)';
    atualizarDots();
  }

  botaoAnterior.addEventListener('click', function () { irParaIndice(indiceAtual - 1); });
  botaoProximo.addEventListener('click', function () { irParaIndice(indiceAtual + 1); });

  // suporte a arraste no celular (touch)
  var posicaoInicialX = null;
  trilho.addEventListener('touchstart', function (evento) {
    posicaoInicialX = evento.touches[0].clientX;
  }, { passive: true });

  trilho.addEventListener('touchend', function (evento) {
    if (posicaoInicialX === null) return;
    var diferenca = evento.changedTouches[0].clientX - posicaoInicialX;
    if (diferenca > 40) irParaIndice(indiceAtual - 1);
    if (diferenca < -40) irParaIndice(indiceAtual + 1);
    posicaoInicialX = null;
  });

  window.addEventListener('resize', function () {
    criarDots();
    irParaIndice(0);
  });

  criarDots();
  irParaIndice(0);
}

/* --------------------------------------------------------------------
   SLIDESHOW DE EVENTOS REALIZADOS
   Passa automaticamente entre os eventos, com controles manuais e
   pausa quando o mouse está sobre a área.
   -------------------------------------------------------------------- */
function inicializarSlideshowDeEventos() {
  var viewport = document.getElementById('eventosViewport');
  var botaoAnterior = document.getElementById('eventosPrev');
  var botaoProximo = document.getElementById('eventosNext');
  var containerDots = document.getElementById('eventosDots');
  if (!viewport || !botaoAnterior || !botaoProximo) return;

  var slides = Array.prototype.slice.call(viewport.querySelectorAll('.slide'));
  var indiceAtual = 0;
  var tempoDeTroca = 6000;
  var temporizador = null;

  function criarDots() {
    containerDots.innerHTML = '';
    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Ir para o evento ' + (i + 1));
      dot.addEventListener('click', function () {
        mostrarSlide(i);
        reiniciarAutoplay();
      });
      containerDots.appendChild(dot);
    });
  }

  function mostrarSlide(indice) {
    slides[indiceAtual].classList.remove('is-active');
    indiceAtual = (indice + slides.length) % slides.length;
    slides[indiceAtual].classList.add('is-active');

    var dots = containerDots.querySelectorAll('button');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === indiceAtual);
    });
  }

  function proximoSlide() { mostrarSlide(indiceAtual + 1); }
  function slideAnterior() { mostrarSlide(indiceAtual - 1); }

  function iniciarAutoplay() {
    temporizador = window.setInterval(proximoSlide, tempoDeTroca);
  }
  function pararAutoplay() {
    window.clearInterval(temporizador);
  }
  function reiniciarAutoplay() {
    pararAutoplay();
    iniciarAutoplay();
  }

  botaoProximo.addEventListener('click', function () { proximoSlide(); reiniciarAutoplay(); });
  botaoAnterior.addEventListener('click', function () { slideAnterior(); reiniciarAutoplay(); });

  viewport.addEventListener('mouseenter', pararAutoplay);
  viewport.addEventListener('mouseleave', iniciarAutoplay);

  criarDots();
  mostrarSlide(0);
  iniciarAutoplay();
}