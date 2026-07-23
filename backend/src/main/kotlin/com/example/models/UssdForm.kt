package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class UssdForm(
    val ussdCode: String
)

@Serializable
data class UssdResponse(
    val ussdId: Int,
    val ussdCode: String?
)