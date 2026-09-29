package expo.modules.owletshared

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.min

/**
 * 다른 앱 위에 작은 새를 띄우는 포그라운드 서비스.
 * - 화면 가장자리를 따라 천천히 이동 (100ms 간격 틱, 배터리 고려)
 * - 드래그 이동 / 탭: 앱 열기 / 길게 누르기: 쉬기·숨기기·오버레이 끄기
 * - 앱이 저장한 공유 상태(SharedPreferences)가 바뀌면 이모지·편지 표시를 갱신
 */
class OverlayService : Service() {
  companion object {
    private const val CHANNEL_ID = "owlet_overlay"
    private const val NOTIF_ID = 4201
    private const val ACTION_SHOW = "expo.modules.owletshared.SHOW"
    private const val TICK_MS = 100L
    private const val STEP_PX = 3f
    private const val LONG_PRESS_MS = 500L
  }

  private lateinit var wm: WindowManager
  private lateinit var prefs: SharedPreferences
  private val handler = Handler(Looper.getMainLooper())

  private lateinit var bird: FrameLayout
  private lateinit var emojiView: TextView
  private lateinit var letterView: TextView
  private lateinit var params: WindowManager.LayoutParams
  private var menu: View? = null

  private var sizePx = 0
  private var dist = 0f // 화면 둘레를 따라 이동한 거리
  private var resting = false
  private var hiddenByUser = false
  private var appHidden = false
  private var appResting = false
  private var motion = true

  private val prefListener = SharedPreferences.OnSharedPreferenceChangeListener { _, _ -> handler.post { applyState() } }

  private val tick = object : Runnable {
    override fun run() {
      if (motion && !resting && !appResting && !dragging && menu == null && bird.visibility == View.VISIBLE) {
        dist += STEP_PX
        placeOnPerimeter()
      }
      handler.postDelayed(this, TICK_MS)
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    prefs = getSharedPreferences(OwletSharedModule.PREFS, Context.MODE_PRIVATE)
    sizePx = (56 * resources.displayMetrics.density).toInt()
    startForeground(NOTIF_ID, buildNotification())
    buildBird()
    applyState()
    prefs.registerOnSharedPreferenceChangeListener(prefListener)
    handler.post(tick)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_SHOW) {
      hiddenByUser = false
      applyState()
      updateNotification()
    }
    return START_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacksAndMessages(null)
    prefs.unregisterOnSharedPreferenceChangeListener(prefListener)
    dismissMenu()
    if (::bird.isInitialized && bird.isAttachedToWindow) wm.removeView(bird)
    super.onDestroy()
  }

  // ---------- 상태 반영 ----------
  private fun applyState() {
    val json = prefs.getString(OwletSharedModule.KEY, null)?.let { runCatching { JSONObject(it) }.getOrNull() }
    val emoji = json?.optString("mainEmoji", "🕊️") ?: "🕊️"
    val unread = json?.optInt("unreadCount", 0) ?: 0
    val mode = json?.optString("birdMode", "fly") ?: "fly"
    motion = json?.optBoolean("overlayMotion", true) ?: true
    appHidden = mode == "hidden"
    appResting = mode == "rest"
    emojiView.text = emoji
    letterView.visibility = if (unread > 0) View.VISIBLE else View.GONE
    bird.visibility = if (appHidden || hiddenByUser) View.GONE else View.VISIBLE
  }

  // ---------- 새 뷰 ----------
  private fun buildBird() {
    emojiView = TextView(this).apply { textSize = 36f; gravity = Gravity.CENTER }
    letterView = TextView(this).apply { text = "✉️"; textSize = 18f; visibility = View.GONE }
    bird = FrameLayout(this).apply {
      addView(emojiView, FrameLayout.LayoutParams(sizePx, sizePx))
      addView(letterView, FrameLayout.LayoutParams(-2, -2, Gravity.BOTTOM or Gravity.END))
    }
    params = WindowManager.LayoutParams(
      sizePx, sizePx,
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
      PixelFormat.TRANSLUCENT,
    ).apply { gravity = Gravity.TOP or Gravity.START }
    placeOnPerimeter()
    bird.setOnTouchListener(touchListener())
    wm.addView(bird, params)
  }

  private fun screenW() = resources.displayMetrics.widthPixels - sizePx
  private fun screenH() = resources.displayMetrics.heightPixels - sizePx

  /** 둘레를 따라 시계 방향: 위 → 오른쪽 → 아래 → 왼쪽 */
  private fun placeOnPerimeter() {
    val w = screenW().toFloat(); val h = screenH().toFloat()
    val total = 2 * (w + h)
    var d = dist % total
    if (d < 0) d += total
    val x: Float; val y: Float
    when {
      d < w -> { x = d; y = 0f }
      d < w + h -> { x = w; y = d - w }
      d < 2 * w + h -> { x = w - (d - w - h); y = h }
      else -> { x = 0f; y = h - (d - 2 * w - h) }
    }
    params.x = x.toInt(); params.y = y.toInt()
    if (bird.isAttachedToWindow) wm.updateViewLayout(bird, params)
  }

  /** 드래그로 놓은 위치를 가장 가까운 가장자리로 붙여서 이동을 이어간다 */
  private fun snapToEdge() {
    val w = screenW().toFloat(); val h = screenH().toFloat()
    val x = params.x.toFloat().coerceIn(0f, w); val y = params.y.toFloat().coerceIn(0f, h)
    val dTop = y; val dBottom = h - y; val dLeft = x; val dRight = w - x
    val m = minOf(dTop, dBottom, dLeft, dRight)
    dist = when (m) {
      dTop -> x
      dRight -> w + y
      dBottom -> w + h + (w - x)
      else -> 2 * w + h + (h - y)
    }
    placeOnPerimeter()
  }

  // ---------- 터치 ----------
  private var dragging = false
  private fun touchListener(): View.OnTouchListener {
    var downX = 0f; var downY = 0f; var startX = 0; var startY = 0
    var longPressed = false
    val longPress = Runnable { longPressed = true; showMenu() }
    return View.OnTouchListener { _, e ->
      when (e.action) {
        MotionEvent.ACTION_DOWN -> {
          downX = e.rawX; downY = e.rawY; startX = params.x; startY = params.y
          dragging = false; longPressed = false
          handler.postDelayed(longPress, LONG_PRESS_MS)
        }
        MotionEvent.ACTION_MOVE -> {
          val dx = e.rawX - downX; val dy = e.rawY - downY
          if (!dragging && (abs(dx) > 12 || abs(dy) > 12)) { dragging = true; handler.removeCallbacks(longPress) }
          if (dragging) {
            params.x = (startX + dx).toInt(); params.y = (startY + dy).toInt()
            wm.updateViewLayout(bird, params)
          }
        }
        MotionEvent.ACTION_UP -> {
          handler.removeCallbacks(longPress)
          if (dragging) { dragging = false; snapToEdge() }
          else if (!longPressed) openApp()
        }
        MotionEvent.ACTION_CANCEL -> { handler.removeCallbacks(longPress); if (dragging) { dragging = false; snapToEdge() } }
      }
      true
    }
  }

  private fun openApp() {
    val i = Intent(Intent.ACTION_VIEW, Uri.parse("owlet://open"))
      .setPackage(packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    startActivity(i)
  }

  // ---------- 길게 누르기 메뉴 ----------
  private fun showMenu() {
    dismissMenu()
    val d = resources.displayMetrics.density
    fun item(label: String, onClick: () -> Unit) = TextView(this).apply {
      text = label; textSize = 16f; setTextColor(Color.parseColor("#4A3B2A"))
      setPadding((20 * d).toInt(), (12 * d).toInt(), (20 * d).toInt(), (12 * d).toInt())
      setOnClickListener { dismissMenu(); onClick() }
    }
    val box = object : LinearLayout(this) {
      override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_OUTSIDE) dismissMenu()
        return super.onTouchEvent(event)
      }
    }.apply {
      orientation = LinearLayout.VERTICAL
      background = GradientDrawable().apply { setColor(Color.parseColor("#FFFDF5")); cornerRadius = 16 * d }
      addView(item(if (resting) "🕊️ 날아다니기" else "🪹 쉬기") { resting = !resting })
      addView(item("🙈 숨기기") { hiddenByUser = true; applyState(); updateNotification() })
      addView(item("⛔ 오버레이 끄기") {
        prefs.edit().putBoolean(OwletSharedModule.KEY_OFF_REQUEST, true).apply()
        stopSelf()
      })
    }
    val lp = WindowManager.LayoutParams(
      WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
        WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
      PixelFormat.TRANSLUCENT,
    ).apply {
      gravity = Gravity.TOP or Gravity.START
      x = min(params.x, resources.displayMetrics.widthPixels - (200 * d).toInt()).coerceAtLeast(0)
      y = params.y + sizePx
    }
    menu = box
    wm.addView(box, lp)
  }

  private fun dismissMenu() {
    menu?.let { if (it.isAttachedToWindow) wm.removeView(it) }
    menu = null
  }

  // ---------- 알림 (포그라운드 서비스 필수) ----------
  private fun buildNotification(): Notification {
    val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    nm.createNotificationChannel(NotificationChannel(CHANNEL_ID, "오버레이", NotificationManager.IMPORTANCE_MIN))
    val builder = Notification.Builder(this, CHANNEL_ID)
    builder.setSmallIcon(android.R.drawable.ic_dialog_info)
      .setContentTitle("새가 바탕화면에서 놀고 있어요")
      .setOngoing(true)
    if (hiddenByUser) {
      val show = PendingIntent.getService(
        this, 0, Intent(this, OverlayService::class.java).setAction(ACTION_SHOW),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )
      builder.addAction(Notification.Action.Builder(null, "새 보이기", show).build())
    }
    return builder.build()
  }

  private fun updateNotification() {
    (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(NOTIF_ID, buildNotification())
  }
}
