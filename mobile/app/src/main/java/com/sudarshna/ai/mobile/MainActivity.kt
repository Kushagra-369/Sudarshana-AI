package com.sudarshna.ai.mobile

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    companion object {
        private const val RC_GOOGLE_SIGN_IN = 1001

        // IMPORTANT:
        // Put your WEB APPLICATION OAuth Client ID here.
        // NOT the Android Client ID.
        private const val WEB_CLIENT_ID =
            "923952499756-55jd90vtj91m290barofpfdh6tj2d8hf.apps.googleusercontent.com"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true

        webView.webViewClient = WebViewClient()

        webView.addJavascriptInterface(
            GoogleAuthBridge(),
            "AndroidGoogleAuth"
        )

        webView.loadUrl(ApiConfig.WEB_URL)

        setContentView(webView)
    }

    private fun startNativeGoogleSignIn() {

        val gso = GoogleSignInOptions.Builder(
            GoogleSignInOptions.DEFAULT_SIGN_IN
        )
            .requestIdToken(WEB_CLIENT_ID)
            .requestEmail()
            .build()

        val googleClient =
            GoogleSignIn.getClient(this, gso)

        startActivityForResult(
            googleClient.signInIntent,
            RC_GOOGLE_SIGN_IN
        )
    }

    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: android.content.Intent?
    ) {
        super.onActivityResult(
            requestCode,
            resultCode,
            data
        )

        if (requestCode != RC_GOOGLE_SIGN_IN) {
            return
        }

        val task =
            GoogleSignIn.getSignedInAccountFromIntent(data)

        try {

            val account = task.getResult(
                ApiException::class.java
            )

            val idToken = account.idToken

            if (idToken == null) {
                sendGoogleError(
                    "Google ID token was not received."
                )
                return
            }

            // Send the Google ID token to React
            val escapedToken =
                idToken
                    .replace("\\", "\\\\")
                    .replace("'", "\\'")

            runOnUiThread {

                webView.evaluateJavascript(
                    """
                    window.onNativeGoogleSuccess &&
                    window.onNativeGoogleSuccess('$escapedToken');
                    """.trimIndent(),
                    null
                )
            }

        } catch (e: ApiException) {

            android.util.Log.e(
                "GOOGLE_SIGNIN",
                "Google Sign-In failed",
                e
            )

            sendGoogleError(
                "Google Sign-In failed: ${e.statusCode}"
            )
        }
    }

    private fun sendGoogleError(message: String) {

        val escapedMessage =
            message
                .replace("\\", "\\\\")
                .replace("'", "\\'")

        runOnUiThread {

            webView.evaluateJavascript(
                """
                window.onNativeGoogleError &&
                window.onNativeGoogleError('$escapedMessage');
                """.trimIndent(),
                null
            )
        }
    }

    inner class GoogleAuthBridge {

        @JavascriptInterface
        fun startGoogleSignIn() {
            runOnUiThread {
                startNativeGoogleSignIn()
            }
        }
    }
}