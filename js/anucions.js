const form = document.getElementById("formAnuncio");
const anunciosContainer = document.querySelector(".anuncios-container");

function salvarAnuncios(anuncios) {
    localStorage.setItem("anuncios", JSON.stringify(anuncios));
}

function carregarAnuncios() {
    const anunciosStr = localStorage.getItem("anuncios");
    if (!anunciosStr) return [];
    try {
        return JSON.parse(anunciosStr);
    } catch {
        return [];
    }
}

function criaAnuncioElemento(anuncioObj) {
    const { titulo, subtitulo, descricao, localizacao, id } = anuncioObj;
    const article = document.createElement("article");
    article.classList.add("anuncio");
    article.dataset.id = id;

    article.innerHTML = `
    <h2 class="titulo">${titulo}</h2>
    <h3 class="subtitulo">${subtitulo}</h3>
    <p class="descricao">${descricao}</p>
    <div class="localizacao">
      <i class="fa-solid fa-location-dot"></i>
      <span>${localizacao}</span>
    </div>
    <button class="btn-apagar" title="Apagar anúncio">
      <i class="fa-solid fa-trash"></i>
    </button>
  `;

    // Evento apagar
    const btnApagar = article.querySelector(".btn-apagar");
    btnApagar.addEventListener("click", () => {
        if (confirm("Quer mesmo apagar esse anúncio?")) {
            apagarAnuncio(id);
        }
    });

    return article;
}

function renderizarAnuncios() {
    anunciosContainer.innerHTML = "";
    const anuncios = carregarAnuncios();
    anuncios.forEach((anuncio) => {
        const elem = criaAnuncioElemento(anuncio);
        anunciosContainer.appendChild(elem);
    });
}

function apagarAnuncio(id) {
    let anuncios = carregarAnuncios();
    anuncios = anuncios.filter((anuncio) => anuncio.id !== id);
    salvarAnuncios(anuncios);
    renderizarAnuncios();
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = form.titulo.value.trim();
    const subtitulo = form.subtitulo.value.trim();
    const descricao = form.descricao.value.trim();
    const localizacao = form.localizacao.value.trim();

    if (!titulo || !subtitulo || !descricao || !localizacao) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    // Criar ID único simples
    const id = Date.now().toString();

    const novoAnuncio = { id, titulo, subtitulo, descricao, localizacao };

    const anuncios = carregarAnuncios();
    anuncios.unshift(novoAnuncio); // adiciona no início

    salvarAnuncios(anuncios);
    renderizarAnuncios();
    form.reset();
});

// Carrega e exibe os anúncios no carregamento da página
renderizarAnuncios();
