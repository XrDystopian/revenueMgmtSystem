package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class StationForm(
    val stationName: String
)

@Serializable
data class StationResponse(
    val stationId: Int,
    val stationName: String?
)