var darkMode = localStorage.getItem("darkMode");
var Modal = {
    open: function () {
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close: function () {
        document.querySelector(".modal-overlay").classList.remove("active");
    }
};
var LocalStorage = {
    get: function () {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
            [];
    },
    set: function (transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
        console.log("estou aqui");
    }
};
var Theme = {
    enable: function () {
        document.body.classList.add("darkmode");
        localStorage.setItem("darkMode", "enabled");
        document.getElementById("theme_icon").src = "./assets/theme-dark.svg";
        //document.querySelector(".background").src = "./assets/background-shape-dark.svg";
        //ocument.querySelector(".svg-down").src = "./assets/down-dark.svg";
    },
    disable: function () {
        document.body.classList.remove("darkmode");
        localStorage.setItem("darkMode", "null");
        document.getElementById("theme_icon").src = "./assets/theme-light.svg";
        //document.querySelector(".svg-down").src = "./assets/down";
    },
    click: function () {
        var darkMode = localStorage.getItem("darkMode");
        if (darkMode !== "enabled") {
            this.enable();
        }
        else {
            this.disable();
        }
    }
};
var Transaction = {
    //Criando um atalho
    all: LocalStorage.get(),
    //Adicionar uma transação a tela
    add: function (transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },
    remove: function (index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },
    incomes: function () {
        var income = 0;
        //pegar todas as transações
        //para cada  transação,
        Transaction.all.forEach(function (transaction) {
            //se maior que zero
            if (transaction.amount > 0) {
                //somar a uma variavel e retornar variavel
                income += transaction.amount;
            }
        });
        return income;
    },
    expenses: function () {
        var expense = 0;
        Transaction.all.forEach(function (transaction) {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        return expense;
    },
    total: function () {
        //soma da entrada - a saida
        return Transaction.incomes() + Transaction.expenses();
    }
};
var DOM = {
    transactionsContainer: document.querySelector(".data-table tbody"),
    addTransaction: function (transaction, index) {
        var tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction: function (transaction, index) {
        //A cada transação que receber ele vai verificar se é verdadeiro ou falso
        var CSSclass = transaction.amount > 0 ? "income" : "expense";
        var amount = Utils.formatCurrency(transaction.amount);
        var html = "\n\n        <td class=\"description\">" + transaction.description + "</td>\n        <td class=\"quantity\">" + transaction.quantity + "</td>\n        <td class=\"" + CSSclass + "\">" + amount + "</td>\n        <td class=\"date\">" + transaction.date + "</td>\n        <td>\n            <button class=\"exclude-transation-item\">\n                <img onclick=\"Transaction.remove(" + index + ")\" src=\"./assets/minus.svg\" alt=\"Remover transa\u00E7\u00E3o\" />\n            </button>\n        </td>\n    \n    ";
        return html;
    },
    //Trabalha com a funcionalidade de uplodar os valores na tela
    //FORMATAÇÃO NA TELA WORKING
    updateBalance: function () {
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total());
    },
    clearTransactions: function () {
        DOM.transactionsContainer.innerHTML = "";
    }
};
var Utils = {
    formatAmount: function (value) {
        value = value * 100;
        return Math.round(value);
    },
    formatDate: function (date) {
        var splittedDate = date.split("-");
        return " " + splittedDate[2] + "/" + splittedDate[1] + "/" + splittedDate[0];
    },
    formatCurrency: function (value) {
        var signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        return signal + value;
    }
};
var Form = {
    description: document.querySelector("input#description"),
    quantity: document.querySelector("input#quantity"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    getValues: function () {
        return {
            description: Form.description.value,
            quantity: Form.quantity.value,
            amount: Form.amount.value,
            date: Form.date.value
        };
    },
    validateFields: function () {
        var _a = Form.getValues(), description = _a.description, amount = _a.amount, date = _a.date, quantity = _a.quantity;
        if (description.trim() === "" ||
            quantity.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        }
    },
    formatValues: function () {
        var _a = Form.getValues(), description = _a.description, amount = _a.amount, date = _a.date, quantity = _a.quantity;
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return {
            description: description,
            quantity: quantity,
            amount: amount,
            date: date
        };
    },
    clearFields: function () {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },
    submit: function (event) {
        event.preventDefault();
        try {
            //Verificar se todas as informações foram preenchidas
            Form.validateFields();
            //Formatar os dados para salvar.
            var transaction = Form.formatValues();
            //Salvar
            Transaction.add(transaction);
            //Apagar dados do formulario
            Form.clearFields();
            //Modal feche
            Modal.close();
        }
        catch (error) {
            alert(error.message);
        }
    }
};
var App = {
    init: function () {
        //Para cada transação que tem dentro das transações, roda uma funcionalidade.
        Transaction.all.forEach(DOM.addTransaction);
        //Atualizando os cartões
        DOM.updateBalance();
        //Atualizando o local storage
        LocalStorage.set(Transaction.all);
        //Theme
        if (darkMode === "enabled") {
            Theme.enable();
            document.getElementById("theme_icon").src = "./assets/theme-dark.svg";
        }
    },
    reload: function () {
        DOM.clearTransactions();
        App.init();
    }
};
var Csv = {
    exportCSVFile: function (headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }
        var jsonObject = JSON.stringify(items);
        var csv = Csv.convertToCSV(jsonObject);
        var exportedFilename = fileTitle + ".csv" || "export.csv";
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, exportedFilename);
        }
        else {
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
    convertToCSV: function (objArray) {
        var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
        var str = "";
        for (var i = 0; i < array.length; i++) {
            var line = "";
            for (var index in array[i]) {
                if (line != "")
                    line += ";";
                line += array[i][index];
            }
            str += line + "\r\n";
        }
        return str;
    },
    download: function () {
        var headers = {
            description: "Nome".replace(/,/g, ""),
            quantity: "Quantidade",
            amount: "Valor",
            date: "Data"
        };
        var itemsNotFormatted = LocalStorage.get();
        var itemsFormatted = [];
        itemsNotFormatted.forEach(function (item) {
            itemsFormatted.push({
                description: item.description,
                quantity: item.quantity,
                amount: "R$ " + item.amount + " ",
                date: item.date
            });
        });
        var fileTitle = "Minhas Transações - DevFinances";
        Csv.exportCSVFile(headers, itemsFormatted, fileTitle);
    }
};
App.init();
