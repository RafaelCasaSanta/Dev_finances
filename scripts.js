const Modal = {
    open() {
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close() {
        document.querySelector(".modal-overlay").classList.remove("active");
    },
};

//Armazenamento dos itens 
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
            []

    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
};


//Preciso somar as entradas
//depois somar as saidas
//remover das entradas o valor das saidas
//assim teremos o resultado final
const Transaction = {
    //Criando um atalho
    all: Storage.get(),

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
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
        </td>
      
      `;
        return html;
    },

    //Trabalha com a funcionalidade de uplodar os valores na tela
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

//Formatação dos conteudos.
const Utils = {
    formatAmount(value) {
        value = Number(value) * 100;
        return value;
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

//Todas as funcionalidades do Formulario
const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        };
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (
            description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === ""
        ) {
            throw new Error("Por favor, preencha todos os campos");
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
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
            Transaction.add(transaction);
            //Apagar dados do formulario
            Form.clearFields();
            //Modal feche
            Modal.close();
        } catch (error) {
            alert(error.message);
        }
    },
};


const App = {
    init() {
        //Para cada transação que tem dentro das transações, roda uma funcionalidade.
        Transaction.all.forEach(DOM.addTransaction);

        //Atualizando os cartões
        DOM.updateBalance();
        //Atualizando o local storage
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    },
};

App.init();





/* [
    {
      description: "Luz",
      amount: -50000,
      date: "21/01/2021",
    },
    {
      description: "Criação de website",
      amount: 200000,
      date: "20/01/2021",
    },
    {
      description: "Internet",
      amount: -22000,
      date: "10/01/2021",
    },
    {
      description: "App",
      amount: 200000,
      date: "10/01/2021",
    },
  ],
 */