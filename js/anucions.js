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
    const { titulo, subtitulo, descricao, localizacao, horarios, id } = anuncioObj;
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

    <div class="horarios">
    <i class="fa-solid fa-calendar"></i>
    <span>${horarios}</span>
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
    const horarioInput = form.horarios.value;

    if (!titulo || !subtitulo || !descricao || !localizacao || !horarioInput) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    // Converter formato ISO para DD/MM, HHhMMmin
    const data = new Date(horarioInput);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");
    const horarioFormatado = `${dia}/${mes}, ${horas}h${minutos}min`;

    const id = Date.now().toString();

    const novoAnuncio = {
        id,
        titulo,
        subtitulo,
        descricao,
        localizacao,
        horarios: horarioFormatado
    };

    const anuncios = carregarAnuncios();
    anuncios.unshift(novoAnuncio);

    salvarAnuncios(anuncios);
    renderizarAnuncios();
    form.reset();
});


// Carrega e exibe os anúncios no carregamento da página
renderizarAnuncios();
