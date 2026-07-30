package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class UssdForm(
    val ussdCode: String,
    val ussdTypeId: Int?
)

@Serializable
data class UssdResponse(
    val ussdId: Int,
    val ussdCode: String?,
    val ussdTypeId: Int?
)