package com.example.db

import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.date
import org.jetbrains.exposed.v1.javatime.time

object Stations : Table("stations") {
    val stationId = integer("station_id").autoIncrement()
    val stationName = varchar("station_name", 250).nullable()
    override val primaryKey = PrimaryKey(stationId)
}

object OrderType : Table("order_type") {
    val orderTypeId = integer("order_type_id").autoIncrement()
    val orderType = varchar("order_type", 50).nullable()
    override val primaryKey = PrimaryKey(orderTypeId)
}

object Presenters : Table("presenters") {
    val presenterId = integer("presenter_id").autoIncrement()
    val presenterName = varchar("presenter_name", 250).nullable()
    val stationId = integer("station_id").references(Stations.stationId).nullable()
    override val primaryKey = PrimaryKey(presenterId)
}

object Ussd : Table("ussd") {
    val ussdId = integer("ussd_id").autoIncrement()
    val ussdCode = varchar("ussd_code", 50).nullable()
    override val primaryKey = PrimaryKey(ussdId)
}

object OrderLog : Table("order_log") {
    val orderId = integer("order_id").autoIncrement()
    val stationId = integer("station_id").references(Stations.stationId).nullable()
    val orderTypeId = integer("order_type_id").references(OrderType.orderTypeId).nullable()
    val amount = decimal("amount", 10, 2).nullable()
    val duration = integer("duration").nullable()
    val startDate = date("start_date").nullable()
    val endDate = date("end_date").nullable()
    val dailyOrderAmount = decimal("daily_order_amount", 10, 2).nullable()
    override val primaryKey = PrimaryKey(orderId)
}

object PresenterExpense : Table("presenter_expense") {
    val expenseId = integer("expense_id").autoIncrement()
    val presenterId = integer("presenter_id").references(Presenters.presenterId).nullable()
    val amount = decimal("amount", 10, 2).nullable()
    val paymentDate = date("payment_date").nullable()
    override val primaryKey = PrimaryKey(expenseId)
}

object DailyLog : Table("daily_log") {
    val logId = integer("log_id").autoIncrement()
    val ussdId = integer("ussd_id").references(Ussd.ussdId).nullable()
    val presenterId = integer("presenter_id").references(Presenters.presenterId).nullable()
    val earnings = decimal("earnings", 10, 2).nullable()
    val winnerPayment = decimal("winner_payment", 10, 2).nullable()
    val date = date("date").nullable()
    val startTime = time("start_time").nullable()
    val endTime = time("end_time").nullable()
    override val primaryKey = PrimaryKey(logId)
}