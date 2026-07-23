package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class PresenterForm(
    val presenterName: String,
    val stationId: Int
)

@Serializable
data class PresenterResponse(
    val presenterId: Int,
    val presenterName: String?,
    val stationId: Int?
)