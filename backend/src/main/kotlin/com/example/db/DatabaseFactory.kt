package com.example.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.cdimascio.dotenv.dotenv
import io.ktor.server.application.*
import org.jetbrains.exposed.v1.jdbc.Database

fun Application.configureDatabases() {
    val dotenv = dotenv {
        ignoreIfMissing = true
    }

    val config = HikariConfig().apply {
        jdbcUrl = dotenv["DB_URL"]
        username = dotenv["DB_USER"]
        password = dotenv["DB_PASSWORD"]
        driverClassName = "org.postgresql.Driver"
        maximumPoolSize = 10
    }

    val dataSource = HikariDataSource(config)
    Database.connect(dataSource)
}