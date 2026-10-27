import SwiftUI
import WidgetKit

// 앱(OwletSharedModule.swift)이 App Group UserDefaults에 저장한 JSON을 읽는다.
private let appGroup = "group.com.owlet.app"

struct OwletState {
  var emoji = "🕊️"
  var unread = 0
  var mode = "fly" // fly | rest | hidden
  var widgetEnabled = true
  var fortunes: [String: String] = [:] // yyyy-MM-dd → 한 줄 운세

  static func load() -> OwletState {
    var s = OwletState()
    guard
      let json = UserDefaults(suiteName: appGroup)?.string(forKey: "state"),
      let obj = try? JSONSerialization.jsonObject(with: Data(json.utf8)) as? [String: Any]
    else { return s }
    s.emoji = obj["mainEmoji"] as? String ?? s.emoji
    s.unread = obj["unreadCount"] as? Int ?? 0
    s.mode = obj["birdMode"] as? String ?? "fly"
    s.widgetEnabled = obj["widgetEnabled"] as? Bool ?? true
    if let arr = obj["fortunes"] as? [[String: Any]] {
      for o in arr { if let d = o["date"] as? String, let t = o["text"] as? String { s.fortunes[d] = t } }
    }
    return s
  }
}

private let dayFormatter: DateFormatter = {
  let f = DateFormatter()
  f.dateFormat = "yyyy-MM-dd"
  f.locale = Locale(identifier: "en_US_POSIX")
  return f
}()

struct OwletEntry: TimelineEntry {
  let date: Date
  let state: OwletState
  let pose: Int // 0...3: 위젯 안에서 새가 놓이는 자리
  /// 이 엔트리 날짜의 운세 (타임라인이 날짜를 넘어가도 맞는 날의 운세가 나온다)
  var fortune: String? { state.fortunes[dayFormatter.string(from: date)] }
}

struct OwletProvider: TimelineProvider {
  func placeholder(in context: Context) -> OwletEntry { OwletEntry(date: Date(), state: OwletState(), pose: 0) }

  func getSnapshot(in context: Context, completion: @escaping (OwletEntry) -> Void) {
    completion(OwletEntry(date: Date(), state: OwletState.load(), pose: 0))
  }

  // iOS 위젯은 연속 애니메이션이 불가하므로, 5분 간격으로 포즈를 번갈아 보여주는 타임라인을 만든다.
  func getTimeline(in context: Context, completion: @escaping (Timeline<OwletEntry>) -> Void) {
    let state = OwletState.load()
    let now = Date()
    let entries = (0..<8).map { i in
      OwletEntry(date: now.addingTimeInterval(Double(i) * 5 * 60), state: state, pose: i % 4)
    }
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

struct OwletWidgetView: View {
  let entry: OwletEntry
  @Environment(\.widgetFamily) var family

  private var birdSize: CGFloat { family == .systemSmall ? 44 : 56 }

  // 포즈별 위치 (0~1 비율)
  private var anchor: CGPoint {
    if entry.state.mode == "rest" { return CGPoint(x: 0.7, y: 0.6) }
    switch entry.pose {
    case 0: return CGPoint(x: 0.3, y: 0.45)
    case 1: return CGPoint(x: 0.65, y: 0.3)
    case 2: return CGPoint(x: 0.5, y: 0.6)
    default: return CGPoint(x: 0.75, y: 0.5)
    }
  }

  var body: some View {
    GeometryReader { geo in
      ZStack {
        LinearGradient(colors: [Color(red: 0.78, green: 0.93, blue: 0.98), Color(red: 0.61, green: 0.84, blue: 0.96)],
                       startPoint: .top, endPoint: .bottom)
        VStack {
          Spacer()
          ZStack {
            Rectangle().fill(Color(red: 0.42, green: 0.75, blue: 0.35))
            if let f = entry.fortune, entry.state.widgetEnabled {
              Text(f).font(.system(size: 10)).lineLimit(2).multilineTextAlignment(.center)
                .foregroundColor(Color(red: 0.12, green: 0.24, blue: 0.1)).padding(.horizontal, 6)
            }
          }
          .frame(height: geo.size.height * (entry.fortune == nil ? 0.2 : 0.3))
        }

        if !entry.state.widgetEnabled {
          Text("💤").font(.system(size: birdSize))
        } else if entry.state.mode == "hidden" {
          Text("🙈").font(.system(size: birdSize))
        } else {
          ZStack {
            Text(entry.state.emoji).font(.system(size: birdSize))
            if entry.state.unread > 0 {
              Text("✉️").font(.system(size: birdSize * 0.5)).offset(x: birdSize * 0.45, y: birdSize * 0.3)
            }
          }
          .position(x: geo.size.width * anchor.x, y: geo.size.height * anchor.y)
        }

        if entry.state.unread > 0 && entry.state.widgetEnabled {
          Text("\(entry.state.unread)")
            .font(.system(size: 13, weight: .bold)).foregroundColor(.white)
            .padding(.horizontal, 8).padding(.vertical, 2)
            .background(Capsule().fill(Color.red))
            .position(x: 24, y: 20)
        }
      }
    }
    .widgetURL(URL(string: "owlet://open")) // 탭하면 앱 열기 (앱이 편지함/홈으로 분기)
  }
}

struct OwletWidget: Widget {
  let kind = "OwletWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: OwletProvider()) { entry in
      if #available(iOS 17.0, *) {
        OwletWidgetView(entry: entry).containerBackground(.clear, for: .widget)
      } else {
        OwletWidgetView(entry: entry)
      }
    }
    .configurationDisplayName("새 메신저")
    .description("새와 안 읽은 편지 수를 보여줘요")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct OwletWidgetBundle: WidgetBundle {
  var body: some Widget { OwletWidget() }
}
