package com.example.routes

import com.example.db.UssdType
import com.example.models.UssdTypeForm
import com.example.models.UssdTypeResponse
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

fun Route.ussdTypeRoutes() {

    post("/ussd-types") {
        val form = call.receive<UssdTypeForm>()
        transaction {
            UssdType.insert {
                it[ussdType] = form.ussdType
            }
        }
        call.respond(HttpStatusCode.Created, "USSD type created")
    }

    get("/ussd-types") {
        val types = transaction {
            UssdType.selectAll().orderBy(UssdType.ussdTypeId to SortOrder.ASC).map {
                UssdTypeResponse(
                    ussdTypeId = it[UssdType.ussdTypeId],
                    ussdType = it[UssdType.ussdType]
                )
            }
        }
        call.respond(types)
    }

    get("/ussd-types/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@get
        }

        val type = transaction {
            UssdType.selectAll().where { UssdType.ussdTypeId eq id }.map {
                UssdTypeResponse(
                    ussdTypeId = it[UssdType.ussdTypeId],
                    ussdType = it[UssdType.ussdType]
                )
            }.singleOrNull()
        }

        if (type == null) {
            call.respond(HttpStatusCode.NotFound, "USSD type not found")
        } else {
            call.respond(type)
        }
    }

    put("/ussd-types/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@put
        }

        val form = call.receive<UssdTypeForm>()

        val updatedRows = transaction {
            UssdType.update({ UssdType.ussdTypeId eq id }) {
                it[ussdType] = form.ussdType
            }
        }

        if (updatedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "USSD type not found")
        } else {
            call.respond(HttpStatusCode.OK, "USSD type updated")
        }
    }

    delete("/ussd-types/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@delete
        }

        val deletedRows = transaction {
            UssdType.deleteWhere { UssdType.ussdTypeId eq id }
        }

        if (deletedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "USSD type not found")
        } else {
            call.respond(HttpStatusCode.OK, "USSD type deleted")
        }
    }
}