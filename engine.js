const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');
const navOverlay = document.querySelector('nav-overlay');

function closeMenu() {
  if (menuToggle) menuToggle.classList.remove('active');
  if (nav) nav.classList.remove('open');
  if (navOverlay) navOverlay.classList.remove('show');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.classList.toggle('active');
    navOverlay.classList.toggle('show');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

if (navOverlay) {
  navOverlay.addEventListener('click', closeMenu);
}

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});


function throttle(fn, delay = 100) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}


function animateSkillBars() {
  const bars = document.querySelectorAll(".skill-bar-fill[data-width]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        if (bar.style.width === "0%" || !bar.style.width) {
          bar.style.width = bar.dataset.width;
        }
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(animateSkillBars, 200);
});


const words = ["Developer", "Engineer"];
let i = 0, j = 0, currentWord = '', isDeleting = false;

function type() {
  currentWord = words[i];
  const element = document.getElementById("typing");
  if (!element) return;

  if (!isDeleting) {
    element.textContent = currentWord.substring(0, j++);
    if (j > currentWord.length) {
      isDeleting = true;
      setTimeout(type, 1000);
      return;
    }
  } else {
    element.textContent = currentWord.substring(0, j--);
    if (j < 0) {
      isDeleting = false;
      i = (i + 1) % words.length;
    }
  }

  setTimeout(type, isDeleting ? 50 : 100);
}

type();


function animatePieChart(segments) {
  const pie = document.getElementById("pieChart");
  if (!pie) return;
  const duration = 1200;
  const startTime = performance.now();

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1);

    let gradientParts = [];
    let start = 0;

    segments.forEach(seg => {
      const animatedEnd = start + (seg.percent * progress);
      gradientParts.push(`${seg.color} ${start}% ${animatedEnd}%`);
      start += seg.percent;
    });

    pie.style.background = `conic-gradient(${gradientParts.join(",")})`;

    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}


const EMAIL_REGEX = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;

async function fetchGitHubStats() {
  const username = "mattospedrof";
  const CACHE_KEY = "gh_stats_data";
  const CACHE_TIME_KEY = "gh_stats_timestamp";
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;

  const now = Date.now();
  let lastUpdate = null, cachedData = null;

  try {
    lastUpdate = localStorage.getItem(CACHE_TIME_KEY);
    cachedData = localStorage.getItem(CACHE_KEY);
  } catch(e) {
    console.warn("localStorage indisponível:", e);
  }

  if (cachedData && lastUpdate && (now - lastUpdate < TWELVE_HOURS)) {
    console.log("Exibindo dados do cache (< 12h)");
    renderData(JSON.parse(cachedData));
    return;
  }

  console.log("Buscando novos dados da API...");

  try {
    const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const commitRes = await fetch(`https://api.github.com/search/commits?q=author:${username}`);

    if (!repoRes.ok || !commitRes.ok) throw new Error("Limite da API Github atingido.");

    const repos = await repoRes.json();
    const commitData = await commitRes.json();

    let langs = {};
    let lastCommitRepo = null;
    let lastCommitDate = null;

    repos.forEach(repo => {
      if (repo.language) {
        langs[repo.language] = (langs[repo.language] || 0) + 1;
      }

      const pushDate = new Date(repo.pushed_at);
      if (!lastCommitDate || pushDate > lastCommitDate) {
        lastCommitDate = pushDate;
        lastCommitRepo = repo.name;
      }
    });

    const finalData = {
      reposCount: repos.length,
      totalCommits: commitData.total_count || 0,
      lastRepo: lastCommitRepo,
      languages: langs
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(finalData));
      localStorage.setItem(CACHE_TIME_KEY, now.toString());
    } catch(e) {
      console.warn("Não foi possível salvar cache:", e);
    }

    renderData(finalData);

  } catch (error) {
    console.error("Erro ao buscar API:", error);
    if (cachedData) {
      renderData(JSON.parse(cachedData));
    } else {
      document.getElementById("statsInfo").innerHTML = `
        <p>⚠️ Dados indisponíveis no momento.</p>
        <p><a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" style="color:#1e90ff;">Visite o GitHub →</a></p>
      `;
    }
  }
}

function renderData(data) {
  document.getElementById("statsInfo").innerHTML = `
    <p>Repositórios: <strong>${data.reposCount}</strong></p>
    <p>Total de Commits: <strong>${data.totalCommits}</strong></p>
    <p>Último Projeto: <strong>${data.lastRepo || "N/A"}</strong></p>
  `;

  renderPieChart(data.languages);
}

const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    if (!centerTextPlugin._text) return;

    const { ctx, chartArea } = chart;
    const isMobile = window.innerWidth <= 768;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.font = isMobile ? "bold 18px Arial" : "bold 40px Arial";
    ctx.shadowColor = "#010d8b";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#00c3ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(centerTextPlugin._text, centerX, centerY);
    ctx.restore();
  }
};
centerTextPlugin._text = "";

function renderPieChart(languages) {
  const ctx = document.getElementById("languagesChart");
  if (!ctx) return;

  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const labels = Object.keys(languages);
  const values = Object.values(languages);
  const isMobile = window.innerWidth <= 768;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        borderWidth: 0,
        backgroundColor: [
          "#070b5d",
          "#E34F26",
          "#F37626",
          "#239120",
          "#e3eb0c",
          "#336791"
        ],
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      animation: {
        animateRotate: true,
        duration: 1800
      },
      plugins: {
        legend: {
          position: isMobile ? "bottom" : "right",
          labels: {
            color: "white",
            font: {
              size: isMobile ? 12 : 20
            },
            padding: isMobile ? 8 : 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((value / total) * 100).toFixed(1);
              centerTextPlugin._text = percent + "%";
              return `${context.label}: ${percent}%`;
            }
          }
        }
      },
      onHover: (event, chartElement) => {
        const canvas = event.chart.canvas;
        if (chartElement.length) {
          canvas.style.filter = "drop-shadow(0 0 15px #07668336)";
        } else {
          canvas.style.filter = "none";
          centerTextPlugin._text = "";
        }
      }
    },
    plugins: [centerTextPlugin]
  });
}

fetchGitHubStats();


let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const canvas = document.getElementById("languagesChart");
    if (!canvas) return;

    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    try {
      const cachedData = localStorage.getItem("gh_stats_data");
      if (cachedData) {
        const data = JSON.parse(cachedData);
        renderPieChart(data.languages);
      }
    } catch(e) {
      console.warn("Não foi possível recriar chart:", e);
    }
  }, 300);
});


const form = document.getElementById("contactForm");

document.getElementById("whatsappBtn").addEventListener("click", function(){
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  let text = `Olá, meu nome é ${name}.`;
  if (phone) text += `\nTelefone: ${phone}`;
  if (email) text += `\nEmail: ${email}`;
  text += `\n\n${message}`;

  const url = `https://wa.me/5567993349290?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  document.getElementById("contactForm").reset();
});

document.getElementById("emailBtn").addEventListener("click", function(){
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const message = document.getElementById("message").value;
  const subject = "Contato pelo site: ";
  const body = `Nome: ${name}\nEmail: ${email}\n${phone ? 'Telefone: ' + phone + '\n' : ''}\n${message}`;
  const url = `mailto:francobiomed@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.open(url, "_blank", "noopener,noreferrer");
  document.getElementById("contactForm").reset();
});

document.addEventListener("DOMContentLoaded", () => {

  const rules = {
    name: {
      validate: (v) => /^[A-Za-zÀ-ÿ\s]{3,30}$/.test(v.trim()),
      message: "Use apenas letras (3 a 30 caracteres)."
    },
    phone: {
      validate: (v) => v === "" || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(v),
      message: "Formato esperado: (99) 99999-9999."
    },
    email: {
      validate: (v) => EMAIL_REGEX.test(v.trim()),
      message: "Insira um e-mail válido. Ex: nome@email.com"
    },
    message: {
      validate: (v) => v.trim().length >= 10,
      message: "A mensagem deve ter pelo menos 10 caracteres."
    }
  };

  function setFieldState(input, isValid) {
    input.classList.remove("field-valid", "field-invalid");
    if (input.value === "" && !input.dataset.touched) return;

    input.classList.add(isValid ? "field-valid" : "field-invalid");

    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("field-error-msg")) {
      errorEl = document.createElement("span");
      errorEl.classList.add("field-error-msg");
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }

    if (!isValid) {
      errorEl.textContent = rules[input.id]?.message || "Campo inválido.";
      errorEl.style.display = "block";
    } else {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    }
  }

  Object.keys(rules).forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.addEventListener("input", () => {
      setFieldState(input, rules[fieldId].validate(input.value));
    });

    input.addEventListener("blur", () => {
      input.dataset.touched = "true";
      if (input.required && input.value.trim() === "") {
        input.classList.add("field-invalid");
        let errorEl = input.nextElementSibling;
        if (!errorEl || !errorEl.classList.contains("field-error-msg")) {
          errorEl = document.createElement("span");
          errorEl.classList.add("field-error-msg");
          input.parentNode.insertBefore(errorEl, input.nextSibling);
        }
        errorEl.textContent = "Este campo é obrigatório.";
        errorEl.style.display = "block";
      } else {
        setFieldState(input, rules[fieldId].validate(input.value));
      }
    });
  });

  const form = document.getElementById("contactForm");
  if (form) {
    const originalReset = form.reset.bind(form);
    form.reset = function() {
      originalReset();
      form.querySelectorAll(".field-valid, .field-invalid").forEach(el => {
        el.classList.remove("field-valid", "field-invalid");
        delete el.dataset.touched;
      });
      form.querySelectorAll(".field-error-msg").forEach(el => el.remove());
    };
  }

});


document.addEventListener("DOMContentLoaded", () => {

  const phoneInput = document.getElementById("phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", function(e) {
      let value = e.target.value.replace(/\D/g, "");

      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d+)/, "($1) $2");
      } else if (value.length > 0) {
        value = value.replace(/(\d+)/, "($1");
      }

      e.target.value = value;
    });
  }

});


document.addEventListener("DOMContentLoaded", () => {

  const reveals = document.querySelectorAll(".reveal");

  function revealOnScroll() {
    const windowHeight = window.innerHeight;

    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < windowHeight - 100) {
        element.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", throttle(revealOnScroll, 80));
  revealOnScroll();

});
