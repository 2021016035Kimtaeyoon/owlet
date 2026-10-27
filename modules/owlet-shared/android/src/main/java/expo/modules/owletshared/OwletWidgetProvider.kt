package expo.modules.owletshared

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject
import kotlin.random.Random

/**
 * 2x2 홈 위젯. 앱이 저장한 공유 상태(SharedPreferences)를 읽어 그린다.
 * 갱신될 때마다 새의 위치를 바꿔서 움직이는 느낌을 준다.
 * (react-native-android-widget 대신 Kotlin 직접 구현: 이미 있는 공유 상태를 그대로 재사용하기 위함)
 */
class OwletWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    update(context, manager, ids)
  }

  companion object {
    // (left, top) dp: 새가 놓일 자리 후보
    private val POSES = listOf(
      intArrayOf(14, 44), intArrayOf(64, 36), intArrayOf(40, 60), intArrayOf(70, 56), intArrayOf(24, 30),
    )
    private var lastPose = -1

    fun refreshAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, OwletWidgetProvider::class.java))
      if (ids.isNotEmpty()) update(context, mgr, ids)
    }

    fun update(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      val json = context.getSharedPreferences(OwletSharedModule.PREFS, Context.MODE_PRIVATE)
        .getString(OwletSharedModule.KEY, null)
        ?.let { runCatching { JSONObject(it) }.getOrNull() }
      val enabled = json?.optBoolean("widgetEnabled", true) ?: true
      val emoji = json?.optString("mainEmoji", "🕊️") ?: "🕊️"
      val unread = json?.optInt("unreadCount", 0) ?: 0
      val mode = json?.optString("birdMode", "fly") ?: "fly"

      // 오늘 날짜의 운세 한 줄 (앱이 며칠치를 미리 계산해 둠)
      val cal = java.util.Calendar.getInstance()
      val today = String.format("%04d-%02d-%02d", cal.get(java.util.Calendar.YEAR), cal.get(java.util.Calendar.MONTH) + 1, cal.get(java.util.Calendar.DAY_OF_MONTH))
      var fortune = ""
      json?.optJSONArray("fortunes")?.let { arr ->
        for (i in 0 until arr.length()) {
          val o = arr.optJSONObject(i)
          if (o != null && o.optString("date") == today) fortune = o.optString("text")
        }
      }

      var pose: Int
      do { pose = Random.nextInt(POSES.size) } while (pose == lastPose && POSES.size > 1)
      lastPose = pose
      val d = context.resources.displayMetrics.density
      val spot = if (mode == "rest") intArrayOf(40, 60) else POSES[pose]
      val px = spot[0]
      val py = spot[1]

      val open = PendingIntent.getActivity(
        context, 0,
        Intent(Intent.ACTION_VIEW, Uri.parse("owlet://open")).setPackage(context.packageName),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )

      for (id in ids) {
        val v = RemoteViews(context.packageName, R.layout.owlet_widget)
        v.setOnClickPendingIntent(R.id.owlet_root, open)
        if (enabled && fortune.isNotEmpty()) {
          v.setTextViewText(R.id.owlet_fortune, fortune)
          v.setViewVisibility(R.id.owlet_fortune, View.VISIBLE)
        } else {
          v.setViewVisibility(R.id.owlet_fortune, View.GONE)
        }
        if (!enabled || mode == "hidden") {
          v.setTextViewText(R.id.owlet_bird, if (enabled) "🙈" else "💤")
          v.setViewPadding(R.id.owlet_bird, (40 * d).toInt(), (44 * d).toInt(), 0, 0)
          v.setViewVisibility(R.id.owlet_letter, View.GONE)
          v.setViewVisibility(R.id.owlet_badge, View.GONE)
        } else {
          v.setTextViewText(R.id.owlet_bird, emoji)
          v.setViewPadding(R.id.owlet_bird, (px * d).toInt(), (py * d).toInt(), 0, 0)
          // 편지가 있으면 새 옆에 편지를 문 모습
          v.setViewVisibility(R.id.owlet_letter, if (unread > 0) View.VISIBLE else View.GONE)
          v.setViewPadding(R.id.owlet_letter, ((px + 34) * d).toInt(), ((py + 30) * d).toInt(), 0, 0)
          v.setViewVisibility(R.id.owlet_badge, if (unread > 0) View.VISIBLE else View.GONE)
          if (unread > 0) v.setTextViewText(R.id.owlet_badge, unread.toString())
        }
        mgr.updateAppWidget(id, v)
      }
    }
  }
}
