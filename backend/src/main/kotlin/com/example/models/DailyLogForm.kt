package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class DailyLogForm(
    val ussdId: Int,
    val presenterId: Int,
    val earnings: String,
    val winnerPayment: String,
    val date: String,
    val startTime: String,
    val endTime: String
)

@Serializable
data class DailyLogResponse(
    val logId: Int,
    val ussdId: Int?,
    val presenterId: Int?,
    val earnings: String?,
    val winnerPayment: String?,
    val date: String?,
    val startTime: String?,
    val endTime: String?
)