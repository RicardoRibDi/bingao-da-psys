const quotes = [
    //Prass
    "Mestre",
    "Xirú",
    "Joinha do Prass",

    //Mauricio
    "Maumau Carente",
	"Maurício interrompeu alguém",
    "Sons de Maurício",

    //Gabriel
    "Beleza beleza",

    //Gabriela
    "LUAN GAMEPLAYS",

    //Nickzinho
    "É",
    "Nickzinho ligou a câmera",

    //Lucas
    "Lucas atrasado na daily",

    //Machado
    "Bom dia Machado",

    //Sampaio
    "Sampaio já foi?",
	"Gato do Sampaio",
    "Flashbang no Sampaio",

    //Geral
    "WSS",
	"Aeromot",
	"TAM",
    "Compesa",
    "CEDAE",
	"Arania",
	"CELEC",
    "Flexaero",

	"Espero que estejam todos bem",
    "Tu tá mutado",

	"Passa pra mim (E variações)",
    "Eu já fui",
    "Chamou quem já foi",
    "Chamou quem já foi 2x",
    "Cheguei meio atrasado",
	"Falta alguém?",
	"Fui o último?",
    "Da minha parte é isso",

    "Gaspareto",
	//"D'artagnan",
    "Gabrielzinho",
    "Variações de Micaelle",
    "Japa",
    "Chama o Laércio",
    "Precisar de ajuda é só chamar",

	"Internet Instável",
	"Desligou a câmera",
    "Passo pra quem não foi",
	"Rotina de Estudos (E variações)",
    "Papo de corrida",
    "Pra quem trabalha funciona",
    "Reforma tributária",
    "Xingar o ambiente/alguém IFS",
    "Migué pra não falar",
    "Alguém teve que sair no meio da daily",
    "Que barbada",
    "Alguém bebeu café",
    "VAP",
    "Tá ligado",
    //"Ríder",
    "Falar de estimativa",
    "Falei com o Milton  ( ͡° ͜ʖ ͡°)"
];

// Frases com variacoes
const startedDaily = ["Fernanda", "Gabriel", "Maurício"];
const dailyTime = ["30-","30+","40+"];


const bingoSound = new Audio("audio/bingo.mp3");
const toggle = document.getElementById("toggleDarkMode");

let gameFinished = false;

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    toggle.checked = true;
}

toggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );
});

function generateCard() {
    gameFinished = false;

    const bingoCard = document.getElementById("bingoCard");
    bingoCard.innerHTML = "";
    bingoCard.style.display = "grid";

    // Randomizar frases
    const quoteStartedDaily = startedDaily[Math.floor(Math.random() * startedDaily.length)] + " iniciou a daily";
    const quoteDailyTime = "Daily " + dailyTime[Math.floor(Math.random() * dailyTime.length)] + " mins";

    const allQuotes = [...quotes, quoteStartedDaily, quoteDailyTime];

    const randomizedQuotes = [...allQuotes]
    .sort(() => Math.random() - 0.5)
    .slice(0, 25);

    const size = 5;
    const center = Math.floor(size / 2); // Célula do mamaco

    randomizedQuotes.forEach((quote, index) => {
        const div = document.createElement("div");
        div.classList.add("cell");

        const row = Math.floor(index / size);
        const column = index % size;

        div.dataset.row = row;
        div.dataset.column = column;

        if (row === center && column === center) {
            div.classList.add("mamaco", "marked");
            div.innerHTML = '<img src="img/ApesTogetherStrong.png" alt="Apes Together Strong" style="max-width: 100%;">'
        } else {
            div.textContent = quote;
            div.addEventListener("click", () => {
                if (gameFinished) return;

                div.classList.toggle("marked");
                verifyBingo();
            });
        }
        bingoCard.appendChild(div);
    });
}

// Win condition
/*
    Varre a matriz verificando cada célula marcada.

    Quando encontra uma célular marcada, incrementa o contador para aquela linha/coluna.
    Array row verifica se existem 5 adjacentes marcador horizontalmente.
    Array column verifica se existem 5 adjacentes marcador verticalmente.
    Ex.: Linhas ou Colunas => [0,0,0,5,0] => Bingo

    Variável diagonalMain é incrementada a cada ocorrência em que a row/column sejam iguais.
        [0,0] [x,x] [x,x] [x,x] [x,x]
        [x,x] [1,1] [x,x] [x,x] [x,x]
        [x,x] [x,x] [2,2] [x,x] [x,x]
        [x,x] [x,x] [x,x] [3,3] [x,x]
        [x,x] [x,x] [x,x] [x,x] [4,4]
    Variável diagonalSec é incrementada a cada ocorrência em que a soma de row/column resultam em tamanho da matriz - 1.
        [x,x] [x,x] [x,x] [x,x] [0,4]
        [x,x] [x,x] [x,x] [1,3] [x,x]
        [x,x] [x,x] [2,2] [x,x] [x,x]
        [x,x] [3,1] [x,x] [x,x] [x,x]
        [4,0] [x,x] [x,x] [x,x] [x,x]
    Qualquer uma das duas = 5 => Bingo
*/
function verifyBingo() {
    if (gameFinished) return;

    const cells = document.querySelectorAll(".cell.marked");

    const rows = Array(5).fill(0);
    const columns = Array(5).fill(0);

    const size = 5;

    let diagonalMain = 0;
    let diagonalSec = 0;

    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const column = parseInt(cell.dataset.column);

        rows[row]++;
        columns[column]++;

        if (row == column) {
            diagonalMain++;
        }

        if (row + column == size - 1) {
            diagonalSec++;
        }
    });

    if (rows.includes(5) || columns.includes(5) || diagonalMain === size || diagonalSec === size) {
        gameFinished = true;

        bingoSound.currentTime = 0;
        bingoSound.play();

        setTimeout(() => {
            alert("!BINGO!");
        }, 50);
    }
}