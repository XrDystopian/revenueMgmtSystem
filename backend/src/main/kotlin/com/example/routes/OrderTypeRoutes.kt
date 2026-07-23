package com.example.routes

import com.example.db.OrderType
import com.example.models.OrderTypeForm
import com.example.models.OrderTypeResponse
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

fun Route.orderTypeRoutes() {

    post("/order-types") {
        val form = call.receive<OrderTypeForm>()
        transaction {
            OrderType.insert {
                it[orderType] = form.orderType
            }
        }
        call.respond(HttpStatusCode.Created, "Order type created")
    }

    get("/order-types") {
        val types = transaction {
            OrderType.selectAll().map {
                OrderTypeResponse(
                    orderTypeId = it[OrderType.orderTypeId],
                    orderType = it[OrderType.orderType]
                )
            }
        }
        call.respond(types)
    }

    get("/order-types/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@get
        }

        val type = transaction {
            OrderType.selectAll().where { OrderType.orderTypeId eq id }.map {
                OrderTypeResponse(
                    orderTypeId = it[OrderType.orderTypeId],
                    orderType = it[OrderType.orderType]
                )
            }.singleOrNull()
        }

        if (type == null) {
            call.respond(HttpStatusCode.NotFound, "Order type not found")
        } else {
            call.respond(type)
        }
    }

    put("/order-types/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@put
        }

        val form = call.receive<OrderTypeForm>()

        val updatedRows = transaction {
            OrderType.update({ OrderType.orderTypeId eq id }) {
                it[orderType] = form.orderType
            }
        }

        if (updatedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Order type not found")
        } else {
            call.respond(HttpStatusCode.OK, "Order type updated")
        }
    }

    delete("/order-types/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@delete
        }

        val deletedRows = transaction {
            OrderType.deleteWhere { OrderType.orderTypeId eq id }
        }

        if (deletedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Order type not found")
        } else {
            call.respond(HttpStatusCode.OK, "Order type deleted")
        }
    }
}