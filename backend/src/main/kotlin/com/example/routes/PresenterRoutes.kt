package com.example.routes

import com.example.db.Presenters
import com.example.models.PresenterForm
import com.example.models.PresenterResponse
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

fun Route.presenterRoutes() {

    post("/presenters") {
        val form = call.receive<PresenterForm>()
        transaction {
            Presenters.insert {
                it[presenterName] = form.presenterName
                it[stationId] = form.stationId
            }
        }
        call.respond(HttpStatusCode.Created, "Presenter created")
    }

    get("/presenters") {
        val presenters = transaction {
            Presenters.selectAll().map {
                PresenterResponse(
                    presenterId = it[Presenters.presenterId],
                    presenterName = it[Presenters.presenterName],
                    stationId = it[Presenters.stationId]
                )
            }
        }
        call.respond(presenters)
    }

    get("/presenters/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@get
        }

        val presenter = transaction {
            Presenters.selectAll().where { Presenters.presenterId eq id }.map {
                PresenterResponse(
                    presenterId = it[Presenters.presenterId],
                    presenterName = it[Presenters.presenterName],
                    stationId = it[Presenters.stationId]
                )
            }.singleOrNull()
        }

        if (presenter == null) {
            call.respond(HttpStatusCode.NotFound, "Presenter not found")
        } else {
            call.respond(presenter)
        }
    }

    put("/presenters/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@put
        }

        val form = call.receive<PresenterForm>()

        val updatedRows = transaction {
            Presenters.update({ Presenters.presenterId eq id }) {
                it[presenterName] = form.presenterName
                it[stationId] = form.stationId
            }
        }

        if (updatedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Presenter not found")
        } else {
            call.respond(HttpStatusCode.OK, "Presenter updated")
        }
    }

    delete("/presenters/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@delete
        }

        val deletedRows = transaction {
            Presenters.deleteWhere { Presenters.presenterId eq id }
        }

        if (deletedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Presenter not found")
        } else {
            call.respond(HttpStatusCode.OK, "Presenter deleted")
        }
    }
}