// =============================
// Typing Effect
// =============================
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


// =============================
// Animated Pie
// =============================
function animatePieChart(segments) {
  const pie = document.getElementById("pieChart");
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


async function fetchGitHubStats() {
  const username = "mattospedrof";
  const CACHE_KEY = "gh_stats_data";
  const CACHE_TIME_KEY = "gh_stats_timestamp";
  const TWELVE_HOURS = 12 * 60 * 60 * 1000; // Milissegundos

  const now = Date.now();
  const lastUpdate = localStorage.getItem(CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);

  // 1. Verifica se temos cache válido
  if (cachedData && lastUpdate && (now - lastUpdate < TWELVE_HOURS)) {
    console.log("Exibindo dados do cache (Atualizado há menos de 12h)");
    renderData(JSON.parse(cachedData));
    return;
  }

  console.log("Cache expirado ou inexistente. Buscando novos dados da API...");

  try {
    // Buscamos os repositórios (1 requisição)
    const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    
    // Buscamos o total de commits globais (1 requisição via Search API)
    const commitRes = await fetch(`https://api.github.com/search/commits?q=author:${username}`);

    if (!repoRes.ok || !commitRes.ok) throw new Error("Limite da API atingido");

    const repos = await repoRes.json();
    const commitData = await commitRes.json();

    let langs = {};
    let lastCommitRepo = null;
    let lastCommitDate = null;

    repos.forEach(repo => {
      if (repo.language) {
        langs[repo.language] = (langs[repo.language] || 0) + 1;
      }
      // Usamos pushed_at para evitar entrar em cada repo
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

    // Salva no LocalStorage
    localStorage.setItem(CACHE_KEY, JSON.stringify(finalData));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());

    renderData(finalData);

  } catch (error) {
    console.error("Erro ao buscar API:", error);
    if (cachedData) renderData(JSON.parse(cachedData)); // Fallback para cache antigo se a API falhar
  }
}

function renderData(data) {
  // Atualiza as Estatísticas
  document.getElementById("statsInfo").innerHTML = `
    <p>Repositórios: <strong>${data.reposCount}</strong></p>
    <p>Total de Commits: <strong>${data.totalCommits}</strong></p>
    <p>Último Projeto: <strong>${data.lastRepo || "N/A"}</strong></p>
  `;

  renderPieChart(data.languages); 
}

function renderPieChart(languages) {

  const ctx = document.getElementById("languagesChart");

  const labels = Object.keys(languages);
  const values = Object.values(languages);

  const isMobile = window.innerWidth <= 768;
  let centerText = "";

  const centerTextPlugin = {
    id: "centerText",

    beforeDraw(chart) {

      if (!centerText) return;

      const {ctx, chartArea} = chart;

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();

      // Fonte menor no mobile para caber dentro do donut
      ctx.font = isMobile ? "bold 18px Arial" : "bold 40px Arial";
      ctx.shadowColor = "#010d8b";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#00c3ff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(centerText, centerX, centerY);

      ctx.restore();
    }
  };

  new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: labels,
      datasets: [{
        data: values,
        borderWidth: 0,
        backgroundColor: [
          "#3776AB",
          "#E34F26",
          "#F37626",
          "#239120",
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
              const total = context.dataset.data.reduce((a,b)=>a+b,0);

              const percent = ((value/total)*100).toFixed(1);

              centerText = percent + "%";

              return `${context.label}: ${percent}%`;
            }
          }
        }

      },

      onHover: (event, chartElement) => {

        const canvas = event.chart.canvas;

        if(chartElement.length){
          canvas.style.filter = "drop-shadow(0 0 15px #07668336)";
        }else{
          canvas.style.filter = "none";
          centerText = "";
        }

      }

    },

    plugins: [centerTextPlugin]

  });
}

fetchGitHubStats();

// =============================
// WhatsApp Redirect
// =============================
document.getElementById("contactForm").addEventListener("submit", function(e){
  e.preventDefault();
  const text = "Olá, gostaria de saber mais sobre seus serviços.";
  const url = `https://wa.me/5567993349290?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
});


// =============================
// Scroll Reveal Universal
// =============================
document.addEventListener("DOMContentLoaded", () => {

  const reveals = document.querySelectorAll(".reveal");

  function revealOnScroll(){
    const windowHeight = window.innerHeight;

    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;

      if(elementTop < windowHeight - 100){
        element.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();

});