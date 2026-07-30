package com.example.routes

import com.example.db.OrderLog
import com.example.models.OrderLogForm
import com.example.models.OrderLogResponse
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

fun Route.orderLogRoutes() {

    post("/order-logs") {
        val form = call.receive<OrderLogForm>()
        transaction {
            OrderLog.insert {
                it[stationId] = form.stationId
                it[amount] = BigDecimal(form.amount)
                it[duration] = form.duration
                it[startDate] = LocalDate.parse(form.startDate)
                it[endDate] = LocalDate.parse(form.endDate)
                it[dailyOrderAmount] = BigDecimal(form.dailyOrderAmount)
            }
        }
        call.respond(HttpStatusCode.Created, "Order log created")
    }

    get("/order-logs") {
        val orders = transaction {
            OrderLog.selectAll().orderBy(OrderLog.orderId to SortOrder.ASC).map {
                OrderLogResponse(
                    orderId = it[OrderLog.orderId],
                    stationId = it[OrderLog.stationId],
                    amount = it[OrderLog.amount]?.toString(),
                    duration = it[OrderLog.duration],
                    startDate = it[OrderLog.startDate]?.toString(),
                    endDate = it[OrderLog.endDate]?.toString(),
                    dailyOrderAmount = it[OrderLog.dailyOrderAmount]?.toString()
                )
            }
        }
        call.respond(orders)
    }

    get("/order-logs/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@get
        }

        val order = transaction {
            OrderLog.selectAll().where { OrderLog.orderId eq id }.map {
                OrderLogResponse(
                    orderId = it[OrderLog.orderId],
                    stationId = it[OrderLog.stationId],
                    amount = it[OrderLog.amount]?.toString(),
                    duration = it[OrderLog.duration],
                    startDate = it[OrderLog.startDate]?.toString(),
                    endDate = it[OrderLog.endDate]?.toString(),
                    dailyOrderAmount = it[OrderLog.dailyOrderAmount]?.toString()
                )
            }.singleOrNull()
        }

        if (order == null) {
            call.respond(HttpStatusCode.NotFound, "Order log not found")
        } else {
            call.respond(order)
        }
    }

    put("/order-logs/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@put
        }

        val form = call.receive<OrderLogForm>()

        val updatedRows = transaction {
            OrderLog.update({ OrderLog.orderId eq id }) {
                it[stationId] = form.stationId
                it[amount] = BigDecimal(form.amount)
                it[duration] = form.duration
                it[startDate] = LocalDate.parse(form.startDate)
                it[endDate] = LocalDate.parse(form.endDate)
                it[dailyOrderAmount] = BigDecimal(form.dailyOrderAmount)
            }
        }

        if (updatedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Order log not found")
        } else {
            call.respond(HttpStatusCode.OK, "Order log updated")
        }
    }

    delete("/order-logs/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@delete
        }

        val deletedRows = transaction {
            OrderLog.deleteWhere { OrderLog.orderId eq id }
        }

        if (deletedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Order log not found")
        } else {
            call.respond(HttpStatusCode.OK, "Order log deleted")
        }
    }
}