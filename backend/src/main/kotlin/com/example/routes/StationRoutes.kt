package com.example.routes

import com.example.db.Stations
import com.example.models.StationForm
import com.example.models.StationResponse
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

fun Route.stationRoutes() {

    post("/stations") {
        val form = call.receive<StationForm>()
        transaction {
            Stations.insert {
                it[stationName] = form.stationName
            }
        }
        call.respond(HttpStatusCode.Created, "Station created")
    }

    get("/stations") {
        val stations = transaction {
            Stations.selectAll().map {
                StationResponse(
                    stationId = it[Stations.stationId],
                    stationName = it[Stations.stationName]
                )
            }
        }
        call.respond(stations)
    }

    get("/stations/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@get
        }

        val station = transaction {
            Stations.selectAll().where { Stations.stationId eq id }.map {
                StationResponse(
                    stationId = it[Stations.stationId],
                    stationName = it[Stations.stationName]
                )
            }.singleOrNull()
        }

        if (station == null) {
            call.respond(HttpStatusCode.NotFound, "Station not found")
        } else {
            call.respond(station)
        }
    }

    put("/stations/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@put
        }

        val form = call.receive<StationForm>()

        val updatedRows = transaction {
            Stations.update({ Stations.stationId eq id }) {
                it[stationName] = form.stationName
            }
        }

        if (updatedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Station not found")
        } else {
            call.respond(HttpStatusCode.OK, "Station updated")
        }
    }

    delete("/stations/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@delete
        }

        val deletedRows = transaction {
            Stations.deleteWhere { Stations.stationId eq id }
        }

        if (deletedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Station not found")
        } else {
            call.respond(HttpStatusCode.OK, "Station deleted")
        }
    }
}