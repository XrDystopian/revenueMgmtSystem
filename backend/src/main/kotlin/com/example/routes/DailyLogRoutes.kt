package com.example.routes

import com.example.db.DailyLog
import com.example.models.DailyLogForm
import com.example.models.DailyLogResponse
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
import java.time.LocalTime

fun Route.dailyLogRoutes() {

    post("/daily-logs") {
        val form = call.receive<DailyLogForm>()
        transaction {
            DailyLog.insert {
                it[ussdId] = form.ussdId
                it[presenterId] = form.presenterId
                it[earnings] = BigDecimal(form.earnings)
                it[winnerPayment] = BigDecimal(form.winnerPayment)
                it[date] = LocalDate.parse(form.date)
                it[startTime] = LocalTime.parse(form.startTime)
                it[endTime] = LocalTime.parse(form.endTime)
            }
        }
        call.respond(HttpStatusCode.Created, "Daily log created")
    }

    get("/daily-logs") {
        val logs = transaction {
            DailyLog.selectAll().map {
                DailyLogResponse(
                    logId = it[DailyLog.logId],
                    ussdId = it[DailyLog.ussdId],
                    presenterId = it[DailyLog.presenterId],
                    earnings = it[DailyLog.earnings]?.toString(),
                    winnerPayment = it[DailyLog.winnerPayment]?.toString(),
                    date = it[DailyLog.date]?.toString(),
                    startTime = it[DailyLog.startTime]?.toString(),
                    endTime = it[DailyLog.endTime]?.toString()
                )
            }
        }
        call.respond(logs)
    }

    get("/daily-logs/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@get
        }

        val log = transaction {
            DailyLog.selectAll().where { DailyLog.logId eq id }.map {
                DailyLogResponse(
                    logId = it[DailyLog.logId],
                    ussdId = it[DailyLog.ussdId],
                    presenterId = it[DailyLog.presenterId],
                    earnings = it[DailyLog.earnings]?.toString(),
                    winnerPayment = it[DailyLog.winnerPayment]?.toString(),
                    date = it[DailyLog.date]?.toString(),
                    startTime = it[DailyLog.startTime]?.toString(),
                    endTime = it[DailyLog.endTime]?.toString()
                )
            }.singleOrNull()
        }

        if (log == null) {
            call.respond(HttpStatusCode.NotFound, "Daily log not found")
        } else {
            call.respond(log)
        }
    }

    put("/daily-logs/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@put
        }

        val form = call.receive<DailyLogForm>()

        val updatedRows = transaction {
            DailyLog.update({ DailyLog.logId eq id }) {
                it[ussdId] = form.ussdId
                it[presenterId] = form.presenterId
                it[earnings] = BigDecimal(form.earnings)
                it[winnerPayment] = BigDecimal(form.winnerPayment)
                it[date] = LocalDate.parse(form.date)
                it[startTime] = LocalTime.parse(form.startTime)
                it[endTime] = LocalTime.parse(form.endTime)
            }
        }

        if (updatedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Daily log not found")
        } else {
            call.respond(HttpStatusCode.OK, "Daily log updated")
        }
    }

    delete("/daily-logs/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return@delete
        }

        val deletedRows = transaction {
            DailyLog.deleteWhere { DailyLog.logId eq id }
        }

        if (deletedRows == 0) {
            call.respond(HttpStatusCode.NotFound, "Daily log not found")
        } else {
            call.respond(HttpStatusCode.OK, "Daily log deleted")
        }
    }
}