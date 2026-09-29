import ExpoModulesCore
import WidgetKit

// App Group ID는 plugins/withOwletNative.js 와 반드시 같아야 한다.
private let appGroup = "group.com.owlet.app"
private let stateKey = "state"

public class OwletSharedModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OwletShared")

    Function("setState") { (json: String) in
      UserDefaults(suiteName: appGroup)?.set(json, forKey: stateKey)
    }

    Function("getState") { () -> String? in
      UserDefaults(suiteName: appGroup)?.string(forKey: stateKey)
    }

    // 위젯 타깃이 없어도 호출은 안전하다 (7단계에서 위젯 추가)
    Function("reloadWidgets") {
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
