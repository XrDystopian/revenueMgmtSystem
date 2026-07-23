package com.example.routes

import com.example.db.PresenterExpense
import com.example.models.PresenterExpenseForm
import com.example.models.PresenterExpenseResponse
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.v1.core.*
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.jetbrains.exposed.v1.jdbc.update
import java.math.BigDecimal
import java.time.LocalDate

fun Route.presenterExpenseRoutes() {

    post("/presenter-expenses") {
        val form = call.receive<PresenterExpenseForm>()
        transaction {
            PresenterExpense.insert {
                it[presenterId] = form.presenterId
                it[amount] = BigDecimal(form.amount)
                it[paymentDate] = LocalDate.parse(form.paymentDate)
            }
        }
        call.respond(HttpStatusCode.Created, "Presenter expense created")
    }

    get("/presenter-expenses") {
        val expenses = transaction {
            PresenterExpense.selectAll().map {
                PresenterExpenseResponse(
                    expenseId = it[PresenterExpense.expenseId],
                    presenterId = it[PresenterExpense.presenterId],
                    amount = it[PresenterExpense.amount]?.toString(),
                    paymentDate = it[PresenterExpense.paymentDate]?.toString()
                )
            }
        }
        call.respond(expenses)
    }

    get("/presenter-expenses/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@get
        }

        val expense = transaction {
            PresenterExpense.selectAll().where { PresenterExpense.expenseId eq id }.map {
                PresenterExpenseResponse(
                    expenseId = it[PresenterExpense.expenseId],
                    presenterId = it[PresenterExpense.presenterId],
                    amount = it[PresenterExpense.amount]?.toString(),
                    paymentDate = it[PresenterExpense.paymentDate]?.toString()
                )
            }.singleOrNull()
        }

        if (expense == null) {
            call.respond(HttpStatusCode.NotFound, "Presenter expense not found")
        } else {
            call.respond(expense)
        }
    }

    put("/presenter-expenses/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@put
        }

        val form = call.receive<PresenterExpenseForm>()

        val updatedRows = transaction {
            PresenterExpense.update({ PresenterExpense.expenseId eq id }) {
                it[presenterId] = form.presenterId
                it[amount] = BigDecimal(form.amount)
                it[paymentDate] = LocalDate.parse(form.paymentDate)
            }
        }

        if (updatedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Presenter expense not found")
        } else {
            call.respond(HttpStatusCode.OK, "Presenter expense updated")
        }
    }

    delete("/presenter-expenses/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@delete
        }

        val deletedRows = transaction {
            PresenterExpense.deleteWhere { PresenterExpense.expenseId eq id }
        }

        if (deletedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Presenter expense not found")
        } else {
            call.respond(HttpStatusCode.OK, "Presenter expense deleted")
        }
    }
}