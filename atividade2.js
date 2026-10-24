const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
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

// Rota principal (Menu)
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/cadAluno.html");
});

// Formulário de Cadastro
// Rota para exibir o formulário de cadastro
app.get("/cadastrar-form", function(req, res) {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Cadastrar Aluno</title>
    </head>
    <body>
        <h1>Cadastro de Novo Aluno</h1>
        <form action="/adicionar" method="POST">
            <label for="nome">Nome do Aluno:</label><br>
            <input type="text" id="nome" name="nome" required><br><br>

            <label for="turma">Turma:</label><br>
            <input type="text" id="turma" name="turma" required><br><br>

            <label for="idade">Idade:</label><br>
            <input type="number" id="idade" name="idade" required><br><br>

            <label for="email">E-mail:</label><br>
            <input type="email" id="email" name="email" required><br><br>

            <button type="submit">Cadastrar aluno</button>
        </form>
        <br>
        <a href="/">Voltar ao menu</a>
    </body>
    </html>
    `);
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
                            <th>Ações</th>
                        </tr>
                        ${rows.map(row => `
                        <tr>
                            <td>${row.id}</td>
                            <td>${row.nome}</td>
                            <td>${row.turma}</td>
                            <td>${row.idade} anos</td>
                            <td>${row.email}</td>
                            <td>
                                <a href="/deletar/${row.id}">Deletar</a> | 
                                <a href="/atualizar-form/${row.id}">Alterar</a>
                            </td>
                        </tr>`).join('')}
                    </table>
                    <br><br>
                    <a href="/">Voltar ao menu</a>
                </body>
            </html>`);
        } else {
            console.error("Erro ao listar os alunos", err);
            res.status(500).send("Erro ao listar os dados");
        }
    });
});

// Formulário de Exclusão por Código (Exercício 19)
app.get("/deletar-form", function(req, res) {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Excluir Aluno</title>
    </head>
    <body>
        <h1>Exclusão de Alunos</h1>
        <form action="/excluir-aluno" method="POST">
            <label for="codigo">Código do aluno:</label><br><br>
            <input type="number" id="codigo" name="codigo" required><br><br>
            
            <input type="submit" value="Excluir aluno">
        </form>
        <br><br>
        <a href="/listar">Listar alunos</a> | <a href="/">Voltar ao menu</a>
    </body>
    </html>
    `);
});

// Rota POST Exclusão por Código com Mensagem (Exercício 20)
app.post("/excluir-aluno", function(req, res) {
    const codigo = req.body.codigo;
    const deleteQuery = "DELETE FROM alunos WHERE id = ?";

    connection.query(deleteQuery, [codigo], function(err, result) {
        if (!err) {
            res.send(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Exclusão Realizada</title>
            </head>
            <body>
                <h1>Operação realizada com sucesso. Aluno excluído!</h1>
                <br>
                <a href="/deletar-form">Excluir outro</a> | <a href="/listar">Listar alunos</a> | <a href="/">Voltar ao menu</a>
            </body>
            </html>
            `);
        } else {
            console.error("Erro ao excluir aluno", err);
            res.status(500).send("Erro ao excluir aluno!");
        }
    });
});

app.get("/busca", function(req, res) {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Pesquisar Aluno</title>
    </head>
    <body>
        <h1>Pesquisa de Alunos</h1>
        <form action="/pesquisar" method="POST">
            <label for="codigo">Código do aluno:</label><br><br>
            <input type="number" id="codigo" name="codigo" required><br><br>
            
            <input type="submit" value="Pesquisar">
        </form>
        <br><br>
        <a href="/listar">Listar todos os alunos</a> | <a href="/">Voltar ao menu</a>
    </body>
    </html>
    `);
});

app.post("/pesquisar", function(req, res) {
    const codigo = req.body.codigo;
    const query = "SELECT * FROM alunos WHERE id = ?";

    connection.query(query, [codigo], function(err, results) {
        if (!err) {
            if (results.length > 0) {
                const aluno = results[0];
                res.send(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <title>Resultado da Pesquisa</title>
                </head>
                <body>
                    <h1>Aluno Encontrado</h1>
                    <p><strong>Código:</strong> ${aluno.id}</p>
                    <p><strong>Nome:</strong> ${aluno.nome}</p>
                    <p><strong>Turma:</strong> ${aluno.turma}</p>
                    <p><strong>Idade:</strong> ${aluno.idade} anos</p>
                    <p><strong>E-mail:</strong> ${aluno.email}</p>
                    <br>
                    <a href="/busca">Nova Pesquisa</a> | <a href="/">Voltar ao menu</a>
                </body>
                </html>
                `);
            } else {
                res.send(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <title>Resultado da Pesquisa</title>
                </head>
                <body>
                    <h1>Aluno não encontrado.</h1>
                    <br>
                    <a href="/busca">Tentar novamente</a> | <a href="/">Voltar ao menu</a>
                </body>
                </html>
                `);
            }
        } else {
            console.error("Erro ao pesquisar aluno: ", err);
            res.status(500).send("Erro ao realizar a pesquisa");
        }
    });
});

app.get("/deletar/:id", function(req, res) {
    const idDoAluno = req.params.id;
    const deleteAluno = "DELETE FROM alunos WHERE id = ?";

    connection.query(deleteAluno, [idDoAluno], function(err, result) {
        if (!err) {
            console.log("Aluno excluído com sucesso");
            res.redirect("/listar");
        } else {
            console.error("Erro ao excluir aluno", err);
            res.status(500).send("Erro ao excluir aluno!");
        }
    });
});

app.get("/atualizar-form/:id", function(req, res) {
    const id = req.params.id;
    const selectAluno = "SELECT * FROM alunos WHERE id = ?";

    connection.query(selectAluno, [id], function(err, result) {
        if (!err && result.length > 0) {
            const aluno = result[0];

            res.send(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Atualizar Aluno</title>
            </head>
            <body>
                <h1>Atualizar Cadastro de Aluno</h1>
                <form action="/atualizar/${id}" method="POST">
                    <label for="nome">Nome</label><br>
                    <input type="text" id="nome" name="nome" value="${aluno.nome}" required><br><br>

                    <label for="turma">Turma</label><br>
                    <input type="text" id="turma" name="turma" value="${aluno.turma}" required><br><br>

                    <label for="idade">Idade</label><br>
                    <input type="number" id="idade" name="idade" value="${aluno.idade}" required><br><br>

                    <label for="email">E-mail</label><br>
                    <input type="email" id="email" name="email" value="${aluno.email}" required><br><br>

                    <div style="margin-top: 25px; margin-bottom: 15px;">
                        <input type="submit" value="Atualizar">
                    </div>
                    <div>
                        <a href="/listar">Cancelar</a>
                    </div>
                    <div style="margin-top: 8px;">
                        <a href="/listar">Listar alunos</a>
                    </div>
                </form>
            </body>
            </html>`);
        } else {
            console.log("Erro ao obter dados do aluno", err);
            res.status(500).send("Erro ao obter dados do aluno");
        }
    });
});

app.post("/atualizar/:id", function(req, res) {
    const update = "UPDATE alunos SET nome = ?, turma = ?, idade = ?, email = ? WHERE id = ?";
    const nome = req.body.nome;
    const turma = req.body.turma;
    const idade = req.body.idade;
    const email = req.body.email;
    const id = req.params.id;

    connection.query(update, [nome, turma, idade, email, id], function(err, result) {
        if (!err) {
            console.log("Dados atualizados com sucesso!");
            res.redirect("/listar");
        } else {
            console.log("Erro ao atualizar", err);
            res.status(500).send("Erro ao atualizar!");
        }
    });
});