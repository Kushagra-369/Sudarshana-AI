package com.sudarshna.ai.mobile

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import com.google.android.gms.location.LocationServices

class LocationService(context: Context) {

    private val fusedLocationClient =
        LocationServices.getFusedLocationProviderClient(context)

    @SuppressLint("MissingPermission")
    fun getCurrentLocation(
        onLocation: (Location) -> Unit,
        onError: (Exception) -> Unit
    ) {
        fusedLocationClient.lastLocation
            .addOnSuccessListener { location: Location? ->
                if (location != null) {
                    onLocation(location)
                } else {
                    onError(Exception("Location unavailable"))
                }
            }
            .addOnFailureListener { exception: Exception ->
                onError(exception)
            }
    }
}