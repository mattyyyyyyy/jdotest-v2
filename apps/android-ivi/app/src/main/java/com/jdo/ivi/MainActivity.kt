package com.jdo.ivi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.jdo.ivi.ui.screens.IviHomeScreen
import com.jdo.ivi.ui.theme.JdoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            JdoTheme {
                IviHomeScreen()
            }
        }
    }
}
