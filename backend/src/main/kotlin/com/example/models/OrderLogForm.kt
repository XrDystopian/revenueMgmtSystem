package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class OrderLogForm(
    val stationId: Int,
    val orderTypeId: Int,
    val amount: String,
    val duration: Int,
    val startDate: String,
    val endDate: String,
    val dailyOrderAmount: String
)

@Serializable
data class OrderLogResponse(
    val orderId: Int,
    val stationId: Int?,
    val orderTypeId: Int?,
    val amount: String?,
    val duration: Int?,
    val startDate: String?,
    val endDate: String?,
    val dailyOrderAmount: String?
)