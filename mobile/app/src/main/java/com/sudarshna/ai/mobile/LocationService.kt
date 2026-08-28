package com.sudarshna.ai.mobile

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.IBinder
import android.util.Log

import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat

import com.google.android.gms.location.*

import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class LocationService : Service() {

    companion object {
        const val ACTION_START = "START_LOCATION"
        const val ACTION_STOP = "STOP_LOCATION"

        private const val CHANNEL_ID = "location_channel"
        private const val NOTIFICATION_ID = 1001

        private const val TAG = "LIVE_LOCATION"
    }

    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private val locationRequest =
        LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            10_000L
        )
            .setMinUpdateIntervalMillis(5_000L)
            .setWaitForAccurateLocation(false)
            .build()

    private val locationCallback =
        object : LocationCallback() {

            override fun onLocationResult(
                result: LocationResult
            ) {

                for (location in result.locations) {

                    val latitude = location.latitude
                    val longitude = location.longitude
                    val accuracy = location.accuracy

                    Log.d(
                        TAG,
                        "LAT=$latitude LNG=$longitude ACC=$accuracy"
                    )

                    sendLocationToBackend(
                        latitude,
                        longitude,
                        accuracy
                    )
                }
            }
        }

    override fun onCreate() {
        super.onCreate()

        fusedLocationClient =
            LocationServices.getFusedLocationProviderClient(this)

        createNotificationChannel()
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        when (intent?.action) {

            ACTION_START -> {
                startLocationTracking()
            }

            ACTION_STOP -> {
                stopLocationTracking()
            }
        }

        return START_STICKY
    }

    private fun startLocationTracking() {

        if (
            ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {

            Log.e(
                TAG,
                "Location permission not granted"
            )

            stopSelf()
            return
        }

        val notification: Notification =
            NotificationCompat.Builder(
                this,
                CHANNEL_ID
            )
                .setContentTitle("Sudarshana-AI")
                .setContentText(
                    "Live location sharing is active"
                )
                .setSmallIcon(
                    android.R.drawable.ic_menu_mylocation
                )
                .setOngoing(true)
                .setPriority(
                    NotificationCompat.PRIORITY_LOW
                )
                .build()

        startForeground(
            NOTIFICATION_ID,
            notification
        )

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            mainLooper
        )

        Log.d(
            TAG,
            "Location tracking STARTED"
        )
    }

    private fun sendLocationToBackend(
        latitude: Double,
        longitude: Double,
        accuracy: Float
    ) {

        val token =
            getSharedPreferences(
                "SudarshanaPrefs",
                MODE_PRIVATE
            )
                .getString(
                    "authToken",
                    null
                )

        if (token.isNullOrEmpty()) {

            Log.e(
                TAG,
                "No auth token found. Cannot send location."
            )

            return
        }

        thread {

            try {

                val url = URL(
                    "${ApiConfig.BASE_URL}/update_location"
                )

                val connection =
                    url.openConnection()
                            as HttpURLConnection

                connection.requestMethod = "POST"

                connection.setRequestProperty(
                    "Authorization",
                    "Bearer $token"
                )

                connection.setRequestProperty(
                    "Content-Type",
                    "application/json"
                )

                connection.doOutput = true

                val json =
                    """
                    {
                        "latitude": $latitude,
                        "longitude": $longitude,
                        "accuracy": $accuracy
                    }
                    """.trimIndent()

                connection.outputStream.use { output ->
                    output.write(
                        json.toByteArray(
                            Charsets.UTF_8
                        )
                    )
                }

                val responseCode =
                    connection.responseCode

                Log.d(
                    TAG,
                    "Backend response: $responseCode"
                )

                connection.disconnect()

            } catch (e: Exception) {

                Log.e(
                    TAG,
                    "Failed to send location",
                    e
                )
            }
        }
    }

    private fun stopLocationTracking() {

        fusedLocationClient.removeLocationUpdates(
            locationCallback
        )

        Log.d(
            TAG,
            "Location tracking STOPPED"
        )

        stopForeground(
            STOP_FOREGROUND_REMOVE
        )

        stopSelf()
    }

    private fun createNotificationChannel() {

        if (
            Build.VERSION.SDK_INT >=
            Build.VERSION_CODES.O
        ) {

            val channel =
                NotificationChannel(
                    CHANNEL_ID,
                    "Live Location",
                    NotificationManager.IMPORTANCE_LOW
                )

            val manager =
                getSystemService(
                    NotificationManager::class.java
                )

            manager.createNotificationChannel(
                channel
            )
        }
    }

    override fun onBind(
        intent: Intent?
    ): IBinder? {
        return null
    }

    override fun onDestroy() {

        fusedLocationClient.removeLocationUpdates(
            locationCallback
        )

        super.onDestroy()
    }
}