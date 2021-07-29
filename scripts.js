//Tema
let darkMode = localStorage.getItem("darkMode");




//!Construção do Modal
const Modal = {
    open() {
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close() {
        document.querySelector(".modal-overlay").classList.remove("active");
    },
};

//!Armazenamento dos itens 
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
            []
    },

    set(transactions) {
        localStorage.setItem(
            "dev.finances:transactions", JSON.stringify(transactions))
    }
};
//!Dark Theme 
const Theme = {
    enable() {
        document.body.classList.add("darkmode");
        localStorage.setItem("darkMode", "enabled");
        document.getElementById("theme_icon").src = "./assets/theme-dark.svg";
        //document.querySelector(".background").src = "./assets/background-shape-dark.svg";
        //ocument.querySelector(".svg-down").src = "./assets/down-dark.svg";
    },

    disable() {
        document.body.classList.remove("darkmode");
        localStorage.setItem("darkMode", "null");
        document.getElementById("theme_icon").src = "./assets/theme-light.svg";
        //document.querySelector(".svg-down").src = "./assets/down";
    },

    click() {
        let darkMode = localStorage.getItem("darkMode");

        if (darkMode !== "enabled") {
            this.enable();
        } else {
            this.disable();
        }
    },
};

//!Regras de negócio do Transaction
const Transaction = {
    //Criando um atalho
    all: Storage.get(),

    //Adicionar uma transação a tela
    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        let income = 0;

        //pegar todas as transações
        //para cada  transação,
        Transaction.all.forEach((transaction) => {
            //se maior que zero
            if (transaction.amount > 0) {
                //somar a uma variavel e retornar variavel
                income += transaction.amount;
            }
        });
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        return expense;
    },

    total() {
        //soma da entrada - a saida
        return Transaction.incomes() + Transaction.expenses();
    },
};

//!Substituir os dados do html,
const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        //A cada transação que receber ele vai verificar se é verdadeiro ou falso
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
       
        <td class="description">${transaction.description}</td>
        <td class="quantity">${transaction.quantity}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
        </td>
      
      `;
        return html;
    },
    //Trabalha com a funcionalidade de uplodar os valores na tela
    //FORMATAÇÃO NA TELA WORKING
    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
            Transaction.incomes()
        );
        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
            Transaction.expenses()
        );
        document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
            Transaction.total()
        );
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    },
};

//!Formatação dos conteudos.
const Utils = {
    formatAmount(value) {
        value = value * 100;
        return Math.round(value);
    },
    formatDate(date) {
        const splittedDate = date.split("-");
        return ` ${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
        return signal + value;
    },
};

//!Todas as funcionalidades do Formulario para captura dos dados.
const Form = {
    description: document.querySelector("input#description"),
    quantity: document.querySelector("input#quantity"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: Form.description.value,
            quantity: Form.quantity.value,
            amount: Form.amount.value,
            date: Form.date.value,
        };
    },

    validateFields() {
        const { description, amount, date, quantity } = Form.getValues();

        if (
            description.trim() === "" ||
            quantity.trim() ==="" || 
            amount.trim() === "" ||
            date.trim() === "" 
        ) {
            throw new Error("Por favor, preencha todos os campos");
        }
    },
    formatValues() {
        let { description, amount, date, quantity } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);
        
        

        return {
            description,
            quantity,
            amount,
            date,
        };
    },




    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            //Verificar se todas as informações foram preenchidas
            Form.validateFields();
            //Formatar os dados para salvar.
            const transaction = Form.formatValues();
            //Salvar
            Transaction.add(transaction)
            //Apagar dados do formulario
            Form.clearFields();
            //Modal feche
            Modal.close();
        } catch (error) {
            alert(error.message);
        }
    },
};

//!Execução do programa
const App = {
    init() {
        //Para cada transação que tem dentro das transações, roda uma funcionalidade.
        Transaction.all.forEach(DOM.addTransaction);
        //Atualizando os cartões
        DOM.updateBalance();
        //Atualizando o local storage
        Storage.set(Transaction.all)


        //Theme
        if (darkMode === "enabled") {
            Theme.enable();
            document.getElementById("theme_icon").src = "./assets/theme-dark.svg";
        }


    },
    reload() {
        DOM.clearTransactions();
        App.init();
    },
};

const Csv = {

    exportCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }

        var jsonObject = JSON.stringify(items);

        var csv = Csv.convertToCSV(jsonObject);

        var exportedFilename = fileTitle + ".csv" || "export.csv";


        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, exportedFilename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) {
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilename);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    },
    convertToCSV(objArray) {
        var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
        var str = "";
         
        for(var i = 0; i < array.length; i++) {
            var line = "";
            for(var index in array[i]){
                if(line != "") line += ",";

                line += array[i][index];
            }
            str += line + "\r\n";
        }
      return str;
    },

    download() {
        var headers = {
            description: "Nome".replace(/,/g, ""),
            quantity: "Quantidade",
            amount: "Valor",
            date: "Data",
        };

        itemsNotFormatted = Storage.get();

        var itemsFormatted = [];


     itemsNotFormatted.forEach((item) => {
         itemsFormatted.push({
             description: item.description,
             quantity: item.quantity,
          amount: `R$ ${item.amount}`,
          date: item.date,

       });


     });
   var fileTitle = "Minhas Transações - DevFinances";

   Csv.exportCSVFile(headers, itemsFormatted, fileTitle);

    },
};

App.init();
