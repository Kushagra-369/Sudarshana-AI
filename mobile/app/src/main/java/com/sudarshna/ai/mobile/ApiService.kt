package com.sudarshna.ai.mobile

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object ApiService {

    suspend fun login(
        email: String,
        password: String
    ): JSONObject = withContext(Dispatchers.IO) {

        val url = URL("${ApiConfig.BASE_URL}/login")

        val connection = url.openConnection() as HttpURLConnection

        connection.requestMethod = "POST"
        connection.setRequestProperty(
            "Content-Type",
            "application/json"
        )
        connection.doOutput = true

        val body = JSONObject().apply {
            put("email", email)
            put("password", password)
        }

        connection.outputStream.use {
            it.write(body.toString().toByteArray())
        }

        val responseCode = connection.responseCode

        val responseStream =
            if (responseCode in 200..299)
                connection.inputStream
            else
                connection.errorStream

        val response = responseStream
            ?.bufferedReader()
            ?.use { it.readText() }
            ?: "{}"

        connection.disconnect()

        if (responseCode !in 200..299) {
            throw Exception(
                JSONObject(response).optString(
                    "message",
                    "Login failed"
                )
            )
        }

        JSONObject(response)
    }
}