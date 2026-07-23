package com.example.routes

import com.example.db.Ussd
import com.example.models.UssdForm
import com.example.models.UssdResponse
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

fun Route.ussdRoutes() {

    post("/ussd") {
        val form = call.receive<UssdForm>()
        transaction {
            Ussd.insert {
                it[ussdCode] = form.ussdCode
            }
        }
        call.respond(HttpStatusCode.Created, "USSD code created")
    }

    get("/ussd") {
        val codes = transaction {
            Ussd.selectAll().map {
                UssdResponse(
                    ussdId = it[Ussd.ussdId],
                    ussdCode = it[Ussd.ussdCode]
                )
            }
        }
        call.respond(codes)
    }

    get("/ussd/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@get
        }

        val code = transaction {
            Ussd.selectAll().where { Ussd.ussdId eq id }.map {
                UssdResponse(
                    ussdId = it[Ussd.ussdId],
                    ussdCode = it[Ussd.ussdCode]
                )
            }.singleOrNull()
        }

        if (code == null) {
            call.respond(HttpStatusCode.NotFound, "USSD code not found")
        } else {
            call.respond(code)
        }
    }

    put("/ussd/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@put
        }

        val form = call.receive<UssdForm>()

        val updatedRows = transaction {
            Ussd.update({ Ussd.ussdId eq id }) {
                it[ussdCode] = form.ussdCode
            }
        }

        if (updatedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "USSD code not found")
        } else {
            call.respond(HttpStatusCode.OK, "USSD code updated")
        }
    }

    delete("/ussd/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@delete
        }

        val deletedRows = transaction {
            Ussd.deleteWhere { Ussd.ussdId eq id }
        }

        if (deletedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "USSD code not found")
        } else {
            call.respond(HttpStatusCode.OK, "USSD code deleted")
        }
    }
}