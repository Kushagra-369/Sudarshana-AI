package com.sudarshna.ai.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.sudarshna.ai.mobile.ui.theme.SudarshnaAIMobileTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            SudarshnaAIMobileTheme {
                LoginScreen()
            }
        }
    }
}

@Composable
fun LoginScreen() {

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {

        Text(
            text = "SUDARSHANA-AI",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "DEFENCE INTELLIGENCE SYSTEM",
            style = MaterialTheme.typography.bodySmall
        )

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = {

                scope.launch {

                    try {
                        loading = true
                        message = ""

                        val response = ApiService.login(
                            email = email,
                            password = password
                        )

                        message = response.toString()

                    } catch (e: Exception) {
                        message = e.message ?: "Login failed"
                    } finally {
                        loading = false
                    }
                }
            },
            enabled = !loading &&
                    email.isNotBlank() &&
                    password.isNotBlank(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                if (loading) "Signing in..."
                else "SIGN IN"
            )
        }

        if (message.isNotBlank()) {

            Spacer(modifier = Modifier.height(16.dp))

            Text(text = message)
        }
    }
}