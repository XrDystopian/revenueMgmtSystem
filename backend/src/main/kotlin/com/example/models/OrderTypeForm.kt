package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class OrderTypeForm(
    val orderType: String
)

@Serializable
data class OrderTypeResponse(
    val orderTypeId: Int,
    val orderType: String?
)