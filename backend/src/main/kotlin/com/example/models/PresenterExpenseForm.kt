package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class PresenterExpenseForm(
    val presenterId: Int,
    val amount: String,
    val paymentDate: String
)

@Serializable
data class PresenterExpenseResponse(
    val expenseId: Int,
    val presenterId: Int?,
    val amount: String?,
    val paymentDate: String?
)