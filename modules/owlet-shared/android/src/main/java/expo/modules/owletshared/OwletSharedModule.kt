package expo.modules.owletshared

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * 앱 ↔ 위젯/오버레이 공유 상태 (SharedPreferences) + 오버레이 제어.
 * 상태는 JSON 문자열 하나로 저장하고, 위젯/오버레이(Kotlin)가 같은 파일을 읽는다.
 */
class OwletSharedModule : Module() {
  companion object {
    const val PREFS = "owlet_shared"
    const val KEY = "state"
    /** 오버레이에서 "오버레이 끄기"를 눌렀을 때 세워 두는 플래그 (앱이 다음에 열릴 때 소비) */
    const val KEY_OFF_REQUEST = "overlay_off_request"
  }

  private val context: Context
    get() = appContext.reactContext ?: throw Exception("React context is not available")

  private fun prefs() = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  override fun definition() = ModuleDefinition {
    Name("OwletShared")

    Function("setState") { json: String -> prefs().edit().putString(KEY, json).apply() }
    Function("getState") { prefs().getString(KEY, null) }

    Function("reloadWidgets") { OwletWidgetProvider.refreshAll(context) }

    // ---- 5단계: 오버레이 ----
    Function("canDrawOverlays") { Settings.canDrawOverlays(context) }

    Function("requestOverlayPermission") {
      val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${context.packageName}"))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("startOverlay") {
      if (Settings.canDrawOverlays(context)) {
        ContextCompat.startForegroundService(context, Intent(context, OverlayService::class.java))
      }
    }

    Function("stopOverlay") { context.stopService(Intent(context, OverlayService::class.java)) }

    Function("consumeOverlayOffRequest") {
      val p = prefs()
      val v = p.getBoolean(KEY_OFF_REQUEST, false)
      if (v) p.edit().putBoolean(KEY_OFF_REQUEST, false).apply()
      v
    }
  }
}
