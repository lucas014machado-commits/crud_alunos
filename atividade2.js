const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Substitui pela tua senha do MySQL se for diferente
    database: 'crud_alunos'
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// Iniciar o servidor na porta 8083 (Exercício 5)
app.listen(8083, function() {
    console.log("Servidor rodando na url http://localhost:8083");
});

connection.query("SELECT * FROM alunos", function(err, results) {
    if (err) {
        console.log("Erro ao conectar ou consultar o banco: ", err);
    } else {
        console.log("Conexão bem-sucedida! Alunos encontrados no banco:", results);
    }
});

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/cadAluno.html");
});

app.post("/adicionar", function(req, res) {
    const nome = req.body.nome;
    const turma = req.body.turma;
    const idade = req.body.idade;
    const email = req.body.email;

    const values = [nome, turma, idade, email];
    const insert = "INSERT INTO alunos (nome, turma, idade, email) VALUES (?, ?, ?, ?)";

    connection.query(insert, values, function(err, result) {
        if (err) {
            console.error("Dados não inseridos", err);
            res.send("Erro ao cadastrar aluno");
        } else {
            console.log("Aluno inserido com sucesso!");
            res.redirect("/listar");
        }
    });
});

app.get("/listar", function(req, res) {
    const selectAll = "SELECT * FROM alunos";

    connection.query(selectAll, function(err, rows) {
        if (!err) {
            res.send(`<html>
                <head>
                    <title>Lista de Alunos</title>
                </head>
                <body>
                    <h1>Lista de Alunos Cadastrados</h1>
                    <table border="1">
                        <tr>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Turma</th>
                            <th>Idade</th>
                            <th>E-mail</th>
                        </tr>
                        ${rows.map(row => `
                        <tr>
                            <td>${row.id}</td>
                            <td>${row.nome}</td>
                            <td>${row.turma}</td>
                            <td>${row.idade} anos</td>
                            <td>${row.email}</td>
                        </tr>`).join('')}
                    </table>
                    <br><br>
                    <a href="/">Cadastrar novo aluno</a>
                </body>
            </html>`);
        } else {
            console.error("Erro ao listar os alunos", err);
            res.status(500).send("Erro ao listar os dados");
        }
    });
});