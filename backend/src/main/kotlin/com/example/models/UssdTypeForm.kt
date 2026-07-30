package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class UssdTypeForm(
    val ussdType: String
)

@Serializable
data class UssdTypeResponse(
    val ussdTypeId: Int,
    val ussdType: String?
)