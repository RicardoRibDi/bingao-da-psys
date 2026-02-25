const quotes = [
    "É",
    "Mestre",
    "Xirú",
	"Fui o último?",
	"Arania",
	"Falta alguém?",
	"CELEC",
	"Espero que estejam todos bem",
	"Eu já fui",
	"Gaspareto",
	"Bom dia Machado",
	"WSS",
	"D'artagnan",
	"Passa pra mim (E variações)",
	"Maumau Carente",
    "Tu tá mutado",
	"Internet Instável",
	"Desligou a câmera",
	"Cu do gato do Sampaio",
	"Maurício interrompeu alguém",
    "Sons de Maurício",
    "Passo pra quem não foi",
    "Japa",
	"Rotina de Estudos (E variações)",
	"Aeromot",
	"TAM",
    "Daily 30+ min",
    "Daily 30- min",
    "Daily 40+ min",
    "Papo de corrida",
    "Chama o Laércio",
    "Pra quem trabalha funciona",
    "Reforma tributária",
    "Beleza beleza",
    "Compesa",
    "Xingar o ambiente/alguém IFS",
    "LUAN GAMEPLAYS",
    "Ríder",
    "Precisar de ajuda é só chamar",
    "Joinha do Prass",
    "Nickzinho ligou a câmera",
    "Gabrielzinho",
    "Variações de Micaelle",
    "Migué pra não falar",
    "Chamou quem já foi",
    "Chamou quem já foi 2x",
    "Cheguei meio atrasado",
    "Alguém teve que sair no meio da daily",
    "Que barbada",
    "Maurício iniciou a daily",
    "Fernanda iniciou a daily",
    "Gabriel iniciou a daily",
    "Alguém bebeu café"
];

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
    const randomizedQuotes = quotes
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