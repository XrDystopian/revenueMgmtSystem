package com.example
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import org.jetbrains.exposed.v1.exceptions.ExposedSQLException
import java.time.format.DateTimeParseException

fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<DateTimeParseException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                "Invalid date or time format: ${cause.message}"
            )
        }
        exception<NumberFormatException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                "Invalid number format: ${cause.message}"
            )
        }
        exception<ExposedSQLException> { call, cause ->
            call.respond(
                HttpStatusCode.Conflict,
                "This action couldn't be completed because related data still exists elsewhere in the system."
            )
        }
        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                "Unexpected server error. Please try again or contact support."
            )
        }
    }
}