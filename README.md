# Frannkz Tech — Portfólio Pessoal

Portfólio pessoal de Pedro Franco, Backend Developer especializado em Python, automações e APIs.

🔗 **[frannkz-tech.vercel.app](https://frannkz-tech.vercel.app)**

---

## Seções

- **Hero** — Apresentação com efeito de digitação animada e ícones orbitais
- **Especialidades** — Cards de tecnologias com barras de proficiência animadas
- **Projetos** — Principais projetos com links para o GitHub
- **GitHub Insights** — Estatísticas e gráfico de linguagens em tempo real via API
- **Contato** — Formulário com validação em tempo real e envio por WhatsApp ou Email

---

## Tecnologias

**Frontend**
- HTML5
- CSS3 — animações, scroll reveal, layout responsivo (mobile-first)
- JavaScript (Vanilla ES6+)
- Chart.js — gráfico de linguagens (doughnut chart com plugin customizado)

**Integrações**
- GitHub REST API — busca repositórios, commits e linguagens em tempo real
- localStorage — cache de 12h para evitar limite de requisições da API
- WhatsApp API (`wa.me`) — envio de mensagens direto pelo formulário
- mailto — alternativa de contato por e-mail
- Google Fonts — fonte Inter

**Deploy**
- Vercel
- Open Graph — preview de link no WhatsApp, Telegram e redes sociais

---

## Funcionalidades técnicas

- **Typing effect** — alterna entre "Developer" e "Engineer" com animação de cursor
- **Gráfico responsivo** — legenda reposicionada automaticamente entre desktop (`right`) e mobile (`bottom`), com recriação ao redimensionar a janela
- **Skill bars** — animadas via Intersection Observer ao entrar na viewport
- **Validação em tempo real** — feedback visual (verde/vermelho) campo a campo com mensagens de erro
- **Máscara de telefone** — formatação automática `(99) 99999-9999` durante a digitação
- **Cache inteligente** — dados do GitHub armazenados por 12h com fallback para modo anônimo e Safari ITP
- **Scroll reveal** — elementos aparecem suavemente ao rolar a página

---

## Estrutura

```
/
├── index.html
├── style.css
├── engine.js
└── media/
```

---

## Como rodar localmente

```bash
git clone https://github.com/mattospedrof/frannkz-tech
cd frannkz-tech
```

Abra o `index.html` com o Live Server do VS Code ou qualquer servidor local.

> **Dica:** O Live Server pode exibir o site em escala ligeiramente diferente do deploy. Use `Ctrl+Shift+-` para ajustar o zoom do browser a ~80% e ter uma visualização fiel ao ambiente de produção.

---

© 2026 Frannkz Tech • By Pedro Franco