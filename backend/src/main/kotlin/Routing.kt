package com.example

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.example.routes.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Hello, World!")
        }
        get("/json/kotlinx-serialization") {
            call.respond(mapOf("hello" to "world"))
        }
        orderLogRoutes()
        stationRoutes()
        orderTypeRoutes()
        ussdRoutes()
        presenterRoutes()
        presenterExpenseRoutes()
        dailyLogRoutes()
    }
}