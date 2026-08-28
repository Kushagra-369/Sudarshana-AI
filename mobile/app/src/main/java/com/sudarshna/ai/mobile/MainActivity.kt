package com.sudarshna.ai.mobile

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.util.Log

import androidx.activity.ComponentActivity
import android.content.res.Configuration
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException

class MainActivity : ComponentActivity() {


    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)

        Log.d(
            TAG,
            "Configuration changed: orientation=${newConfig.orientation}"
        )
    }

    private lateinit var webView: WebView

    private var googleSignInInProgress = false

    companion object {

        private const val TAG = "GOOGLE_SIGNIN"

        private const val RC_GOOGLE_SIGN_IN = 1001

        /*
         * IMPORTANT:
         *
         * This MUST be the WEB APPLICATION OAuth Client ID.
         *
         * NOT the Android Client ID.
         */
        private const val WEB_CLIENT_ID =
            "923952499756-55jd90vtj91m290barofpfdh6tj2d8hf.apps.googleusercontent.com"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        webView = WebView(this)

        webView.settings.apply {

            javaScriptEnabled = true

            domStorageEnabled = true

            allowFileAccess = true

            allowContentAccess = true
        }

        webView.webViewClient = WebViewClient()

        webView.addJavascriptInterface(
            GoogleAuthBridge(),
            "AndroidGoogleAuth"
        )

        webView.loadUrl(ApiConfig.WEB_URL)

        setContentView(webView)
    }


    // ============================================================
    // START GOOGLE SIGN IN
    // ============================================================

    private fun startNativeGoogleSignIn() {

        if (googleSignInInProgress) {
            android.util.Log.w(
                "GOOGLE_SIGNIN",
                "Google Sign-In is already in progress."
            )
            return
        }

        googleSignInInProgress = true

        val gso = GoogleSignInOptions.Builder(
            GoogleSignInOptions.DEFAULT_SIGN_IN
        )
            .requestIdToken(WEB_CLIENT_ID)
            .requestEmail()
            .build()

        val googleClient = GoogleSignIn.getClient(this, gso)

        android.util.Log.d(
            "GOOGLE_SIGNIN",
            "Starting Google Sign-In"
        )

        try {
            startActivityForResult(
                googleClient.signInIntent,
                RC_GOOGLE_SIGN_IN
            )
        } catch (e: Exception) {

            googleSignInInProgress = false

            android.util.Log.e(
                "GOOGLE_SIGNIN",
                "Could not launch Google Sign-In",
                e
            )

            sendGoogleError(
                "Unable to start Google Sign-In."
            )
        }
    }

    // ============================================================
    // GOOGLE RESULT
    // ============================================================

    @Deprecated("Deprecated Android API but still supported")
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

        // Sign-in request has finished
        googleSignInInProgress = false

        android.util.Log.d(
            "GOOGLE_SIGNIN",
            "Google Sign-In activity finished. resultCode=$resultCode"
        )

        val task = GoogleSignIn.getSignedInAccountFromIntent(data)

        try {

            val account = task.getResult(
                ApiException::class.java
            )

            android.util.Log.d(
                "GOOGLE_SIGNIN",
                "Google account received: ${account.email}"
            )

            val idToken = account.idToken

            if (idToken.isNullOrEmpty()) {

                android.util.Log.e(
                    "GOOGLE_SIGNIN",
                    "ID token is null or empty"
                )

                sendGoogleError(
                    "Google ID token was not received."
                )

                return
            }

            android.util.Log.d(
                "GOOGLE_SIGNIN",
                "Google ID token received successfully"
            )

            val escapedToken = idToken
                .replace("\\", "\\\\")
                .replace("'", "\\'")

            runOnUiThread {

                webView.evaluateJavascript(
                    """
                if (window.onNativeGoogleSuccess) {
                    window.onNativeGoogleSuccess('$escapedToken');
                }
                """.trimIndent(),
                    null
                )
            }

        } catch (e: ApiException) {

            android.util.Log.e(
                "GOOGLE_SIGNIN",
                "Google Sign-In failed. statusCode=${e.statusCode}",
                e
            )

            when (e.statusCode) {

                12501 -> {
                    sendGoogleError(
                        "Google Sign-In was cancelled."
                    )
                }

                12502 -> {
                    sendGoogleError(
                        "Google Sign-In is already in progress."
                    )
                }

                12500 -> {
                    sendGoogleError(
                        "Google Sign-In configuration failed."
                    )
                }

                else -> {
                    sendGoogleError(
                        "Google Sign-In failed: ${e.statusCode}"
                    )
                }
            }
        }
    }

    // ============================================================
    // SEND ERROR TO REACT
    // ============================================================

    private fun sendGoogleError(
        message: String
    ) {

        val escapedMessage =
            message
                .replace(
                    "\\",
                    "\\\\"
                )
                .replace(
                    "'",
                    "\\'"
                )


        runOnUiThread {

            webView.evaluateJavascript(
                """
                if (window.onNativeGoogleError) {
                    window.onNativeGoogleError('$escapedMessage');
                }
                """.trimIndent(),
                null
            )
        }
    }


    // ============================================================
    // JAVASCRIPT BRIDGE
    // ============================================================

    inner class GoogleAuthBridge {

        @JavascriptInterface
        fun startGoogleSignIn() {

            Log.d(
                TAG,
                "React requested native Google Sign-In."
            )

            runOnUiThread {

                startNativeGoogleSignIn()
            }
        }
    }
}